"use client";

import { useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Card, Spinner } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    if (!session?.accessToken) return;
    const data = await apiFetch<Order>(`/admin/orders/${id}`, { token: session.accessToken });
    setOrder(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const updateStatus = async (status: OrderStatus) => {
    if (!session?.accessToken) return;
    setUpdating(true);
    try {
      const updated = await apiFetch<Order>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        token: session.accessToken,
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge tone={orderStatusTone(order.status)} className="text-sm">
          {order.status}
        </Badge>
      </div>

      <Card className="mb-6 p-4">
        <h2 className="mb-2 text-sm font-semibold text-ink-900">Update status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={updating || s === order.status}
              onClick={() => updateStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize disabled:cursor-not-allowed ${
                s === order.status ? "bg-ink-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-6 divide-y divide-gray-100">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{item.product_name}</p>
              <p className="text-xs text-gray-500">
                {formatCurrency(item.unit_price, order.currency)} &times; {item.quantity}
              </p>
            </div>
            <span className="text-sm font-medium text-ink-900">{formatCurrency(item.subtotal, order.currency)}</span>
          </div>
        ))}
        <div className="space-y-1.5 p-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{formatCurrency(order.shipping_fee, order.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Customer</h2>
          <p className="text-sm text-gray-600">
            {order.email}
            <br />
            {order.phone}
          </p>
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Shipping address</h2>
          <p className="text-sm text-gray-600">
            {order.shipping_address.full_name}
            <br />
            {order.shipping_address.line1}
            {order.shipping_address.line2 ? <>, {order.shipping_address.line2}</> : null}
            <br />
            {order.shipping_address.city}, {order.shipping_address.state}
            <br />
            {order.shipping_address.country}
          </p>
        </Card>
        <Card className="p-4 sm:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Payment</h2>
          <p className="text-sm text-gray-600">
            Provider: {order.payment_provider ?? "--"} &middot; Reference: {order.payment_reference ?? "--"} &middot; Paid:{" "}
            {order.paid_at ? formatDate(order.paid_at) : "Not yet paid"}
          </p>
        </Card>
      </div>
    </div>
  );
}
