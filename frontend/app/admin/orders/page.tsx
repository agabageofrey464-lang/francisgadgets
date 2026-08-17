"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Badge, Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import type { Order, OrderStatus, Page } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Page<Order> | null>(null);
  const [status, setStatus] = useState<string>(searchParams.get("status") ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    setLoading(true);
    apiFetch<Page<Order>>("/admin/orders", {
      token: session.accessToken,
      params: { status: status || undefined, page_size: 50 },
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [session?.accessToken, status]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Orders</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            status === "" ? "bg-ink-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
              status === s ? "bg-ink-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              data?.items.map((order) => (
                <tr key={order.id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-ink-900">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total, order.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
