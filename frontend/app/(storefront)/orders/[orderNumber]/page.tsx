import { notFound } from "next/navigation";

import { Badge, Card } from "@/components/ui/Card";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

async function getOrder(orderNumber: string, token?: string): Promise<Order | null> {
  try {
    return await apiFetch<Order>(`/orders/${orderNumber}`, { token });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) return null;
    throw err;
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const session = await getSession();
  const order = await getOrder(orderNumber, session?.accessToken);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge tone={orderStatusTone(order.status)} className="text-sm">
          {order.status}
        </Badge>
      </div>

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
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Payment</h2>
          <p className="text-sm text-gray-600">
            Provider: {order.payment_provider ?? "--"}
            <br />
            Reference: {order.payment_reference ?? "--"}
            <br />
            Paid: {order.paid_at ? formatDate(order.paid_at) : "Not yet paid"}
          </p>
        </Card>
      </div>
    </div>
  );
}
