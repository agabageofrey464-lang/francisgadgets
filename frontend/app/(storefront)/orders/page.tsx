import { ChevronRight, PackageSearch } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

function itemSummary(order: Order): string {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const first = order.items[0]?.product_name ?? "";
  if (order.items.length <= 1) return first;
  return `${first} +${order.items.length - 1} more (${count} items)`;
}

export default async function MyOrdersPage() {
  const session = await getSession();
  const orders = await apiFetch<Order[]>("/orders/me", { token: session?.accessToken });

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "My orders" }]} />
      <h1 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">My orders</h1>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <PackageSearch className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink-900">No orders yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            When you place an order it will show up here, with its delivery status.
          </p>
          <Link href="/products" className="mt-6 inline-block">
            <Button size="lg">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.order_number}`}
              className="group flex items-center gap-3 p-4 transition-colors hover:bg-brand-50/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-900">{order.order_number}</span>
                  <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">{itemSummary(order)}</p>
                <p className="mt-0.5 text-xs text-gray-400">Placed {formatDate(order.created_at)}</p>
              </div>

              <span className="price shrink-0 text-sm font-bold text-ink-900">
                {formatCurrency(order.total, order.currency)}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
