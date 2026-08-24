import Link from "next/link";

import { Badge, Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

export default async function MyOrdersPage() {
  const session = await getSession();
  const orders = await apiFetch<Order[]>("/orders/me", { token: session?.accessToken });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">My orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/products" className="text-brand-600 hover:underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.order_number}`}>
              <Card className="flex items-center justify-between p-4 hover:border-brand-400">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-ink-900">{formatCurrency(order.total, order.currency)}</span>
                  <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
