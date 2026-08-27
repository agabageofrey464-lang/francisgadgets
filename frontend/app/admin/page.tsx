import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Megaphone,
  Package,
  Plus,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { DashboardStats } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

const QUICK_ACTIONS = [
  { href: "/admin/products/new", label: "Add a product", icon: Plus },
  { href: "/admin/orders", label: "Process orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Manage categories", icon: Tags },
  { href: "/admin/ads", label: "Schedule an ad", icon: Megaphone },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  const stats = await apiFetch<DashboardStats>("/admin/dashboard/stats", { token: session?.accessToken });

  const outOfStock = stats.low_stock_products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Everything that needs your attention, at a glance.">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue received"
          value={formatCurrency(stats.total_sales)}
          sublabel="Paid & confirmed orders"
          icon={TrendingUp}
          tone="money"
        />
        <StatCard
          label="Pending orders"
          value={stats.pending_orders}
          sublabel="Awaiting payment or dispatch"
          icon={Clock}
          tone={stats.pending_orders > 0 ? "warning" : "default"}
          href="/admin/orders"
        />
        <StatCard
          label="Total orders"
          value={stats.orders_count}
          sublabel={`${stats.products_count} products listed`}
          icon={ShoppingBag}
          href="/admin/orders"
        />
        <StatCard
          label="Customers"
          value={stats.customers_count}
          sublabel={`${stats.categories_count} categories`}
          icon={Users}
          href="/admin/customers"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-brand-300 hover:shadow-sm"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-ink-900">
              <action.icon className="h-4 w-4 text-gray-400 group-hover:text-brand-600" />
              {action.label}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-brand-600 hover:underline">
              View all &rarr;
            </Link>
          </div>

          {stats.recent_orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Reference</th>
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-5 py-2.5 font-medium">Customer</th>
                    <th className="px-5 py-2.5 font-medium">Total</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recent_orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="max-w-[14rem] truncate px-5 py-3 text-gray-700">{order.email}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink-900">
                        {formatCurrency(order.total, order.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Stock alerts
            </h2>
            <Link href="/admin/products" className="text-xs font-medium text-brand-600 hover:underline">
              Products &rarr;
            </Link>
          </div>

          {stats.low_stock_products.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-500">All products are well stocked.</p>
            </div>
          ) : (
            <>
              {outOfStock > 0 && (
                <p className="border-b border-gray-100 bg-red-50 px-5 py-2.5 text-xs font-medium text-red-700">
                  {outOfStock} {outOfStock === 1 ? "product is" : "products are"} out of stock
                </p>
              )}
              <ul className="divide-y divide-gray-100">
                {stats.low_stock_products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                    >
                      <span className="min-w-0 truncate text-sm text-ink-900">{p.name}</span>
                      <Badge tone={p.stock_quantity === 0 ? "danger" : "warning"} className="shrink-0">
                        {p.stock_quantity} left
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
