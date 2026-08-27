"use client";

import { AlertCircle, MessageCircle, PackageSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { OrderStatusTrack } from "@/components/storefront/OrderStatusTrack";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import { CONTACT } from "@/lib/social";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate, orderStatusTone } from "@/lib/utils";

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderForm />
    </Suspense>
  );
}

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const data = await apiFetch<Order>(`/orders/${orderNumber}`, { params: { email } });
      setOrder(data);
    } catch (err) {
      setError(err instanceof ApiError ? "Order not found. Check your order number and email." : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("order")) setOrderNumber(searchParams.get("order") ?? "");
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "Track order" }]} />

      <div className="mt-4 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <PackageSearch className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">Track your order</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Enter your order number and the email you used at checkout -- no account needed.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              required
              placeholder="FGT-XXXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto" isLoading={loading}>
          Track order
        </Button>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <p className="mt-1 text-xs leading-relaxed text-red-600/90">
              Still stuck? Message us on{" "}
              <a
                href={CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                WhatsApp
              </a>{" "}
              and we will look it up for you.
            </p>
          </div>
        </div>
      )}

      {order && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">{order.order_number}</p>
              <p className="mt-0.5 text-xs text-gray-500">Placed {formatDate(order.created_at)}</p>
            </div>
            <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
          </div>

          <div className="border-b border-gray-100 p-4 sm:p-5">
            <OrderStatusTrack status={order.status} />
          </div>

          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0 text-sm text-ink-800">
                  {item.product_name}
                  <span className="text-gray-400"> &times; {item.quantity}</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-ink-900">
                  {formatCurrency(item.subtotal, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-gray-100 bg-surface/60 p-4">
            <span className="text-sm font-semibold text-ink-900">Total</span>
            <span className="text-base font-bold text-ink-900">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>

          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" />
            Ask about this order on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
