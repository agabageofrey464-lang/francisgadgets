import { CreditCard, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { OrderStatusTrack } from "@/components/storefront/OrderStatusTrack";
import { Badge } from "@/components/ui/Card";
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
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
      <Breadcrumbs
        trail={[{ label: "My orders", href: "/orders" }, { label: order.order_number }]}
      />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">Order {order.order_number}</h1>
          <p className="mt-0.5 text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge tone={orderStatusTone(order.status)} className="text-sm">
          {order.status}
        </Badge>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <OrderStatusTrack status={order.status} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-ink-900">
          Items ({order.items.length})
        </h2>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{item.product_name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatCurrency(item.unit_price, order.currency)} &times; {item.quantity}
                </p>
              </div>
              <span className="price shrink-0 text-sm font-semibold text-ink-900">
                {formatCurrency(item.subtotal, order.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="nums space-y-1.5 border-t border-gray-100 bg-surface/60 p-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <span>{formatCurrency(order.shipping_fee, order.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <MapPin className="h-4 w-4 text-brand-600" />
            Delivery address
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            {order.shipping_address.full_name}
            <br />
            {order.shipping_address.line1}
            {order.shipping_address.line2 ? <>, {order.shipping_address.line2}</> : null}
            <br />
            {order.shipping_address.city}, {order.shipping_address.state}
            <br />
            {order.shipping_address.country}
          </p>
          <p className="mt-2 text-sm text-gray-500">{order.shipping_address.phone}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <CreditCard className="h-4 w-4 text-brand-600" />
            Payment
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Provider</dt>
              <dd className="truncate capitalize text-ink-900">{order.payment_provider ?? "--"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Reference</dt>
              <dd className="truncate font-mono text-xs text-ink-900">{order.payment_reference ?? "--"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Paid</dt>
              <dd className="text-ink-900">{order.paid_at ? formatDate(order.paid_at) : "Not yet paid"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
