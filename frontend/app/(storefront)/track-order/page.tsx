"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
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
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Track your order</h1>
      <p className="mb-6 text-sm text-gray-500">
        Enter your order number and the email you used at checkout.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input id="orderNumber" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          Track order
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <Card className="mt-6 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900">{order.order_number}</span>
            <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
          </div>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
          <p className="mt-2 text-sm font-medium text-ink-900">{formatCurrency(order.total, order.currency)}</p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product_name} &times; {item.quantity}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
