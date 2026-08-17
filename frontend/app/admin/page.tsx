import { AlertTriangle, Clock, DollarSign, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/admin/StatCard";
import { Badge, Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { DashboardStats } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const stats = await apiFetch<DashboardStats>("/admin/dashboard/stats", { token: session?.accessToken });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back to Francis Gadgets Technologies admin.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue received"
          value={formatCurrency(stats.total_sales)}
          sublabel="Paid & confirmed orders"
          icon={DollarSign}
          tone="money"
        />
        <StatCard
          label="Pending orders"
          value={stats.pending_orders}
          sublabel="Awaiting payment"
          icon={Clock}
          tone="warning"
        />
        <StatCard label="Total orders" value={stats.orders_count} icon={ShoppingBag} />
        <StatCard label="Customers" value={stats.customers_count} icon={Users} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Needs your attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/orders?status=pending">
            <Card className="flex items-center justify-between p-5 transition-colors hover:border-brand-400">
              <span className="text-sm font-medium text-ink-900">New orders</span>
              <span className="grid h-8 min-w-8 place-items-center rounded-full bg-amber-100 px-2 text-sm font-bold text-amber-700">
                {stats.pending_orders}
              </span>
            </Card>
          </Link>
          <Card className="flex items-center justify-between p-5">
            <span className="text-sm font-medium text-ink-900">Low stock products</span>
            <span className="grid h-8 min-w-8 place-items-center rounded-full bg-red-100 px-2 text-sm font-bold text-red-700">
              {stats.low_stock_products.length}
            </span>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-ink-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-brand-600 hover:underline">
              View all &rarr;
            </Link>
          </div>
          {stats.recent_orders.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-y border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2">Reference</th>
                  <th className="px-5 py-2">Date</th>
                  <th className="px-5 py-2">Customer</th>
                  <th className="px-5 py-2">Total</th>
                  <th className="px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-600 hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-3 text-gray-700">{order.email}</td>
                    <td className="px-5 py-3 font-medium text-ink-900">{formatCurrency(order.total, order.currency)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-ink-900">Low stock products</h2>
          </div>
          {stats.low_stock_products.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats.low_stock_products.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between text-sm">
                    <span className="text-ink-900">{p.name}</span>
                    <Badge tone={p.stock_quantity === 0 ? "danger" : "warning"}>{p.stock_quantity} left</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
