"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const SHIPPING_FEE = 10000;

interface PaymentInitResponse {
  authorization_url: string;
  reference: string;
  provider: string;
}

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [provider, setProvider] = useState<"paystack" | "flutterwave">("flutterwave");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "Uganda",
    postal_code: "",
  });

  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) {
      setForm((f) => ({ ...f, email: session.user.email ?? "", full_name: session.user.name ?? "" }));
    }
  }, [session]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        token: session?.accessToken,
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          shipping_fee: SHIPPING_FEE,
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
          shipping_address: {
            full_name: form.full_name,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2 || null,
            city: form.city,
            state: form.state,
            country: form.country,
            postal_code: form.postal_code || null,
          },
        }),
      });

      const payment = await apiFetch<PaymentInitResponse>("/payments/initialize", {
        method: "POST",
        token: session?.accessToken,
        body: JSON.stringify({ order_id: order.id, provider }),
      });

      clear();
      window.location.href = payment.authorization_url;
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Checkout failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Checkout</h1>

      <form onSubmit={submit} className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={update("email")} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={update("phone")} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Shipping address</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" required value={form.full_name} onChange={update("full_name")} />
              </div>
              <div>
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" required value={form.line1} onChange={update("line1")} />
              </div>
              <div>
                <Label htmlFor="line2">Address line 2 (optional)</Label>
                <Input id="line2" value={form.line2} onChange={update("line2")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required value={form.city} onChange={update("city")} />
                </div>
                <div>
                  <Label htmlFor="state">District</Label>
                  <Input id="state" required value={form.state} onChange={update("state")} />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal code</Label>
                  <Input id="postal_code" value={form.postal_code} onChange={update("postal_code")} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Payment method</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["flutterwave", "paystack"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize ${
                    provider === p ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-300 text-ink-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Order summary</h2>
          <ul className="mb-4 space-y-2 text-sm text-gray-600">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {i.name} &times; {i.quantity}
                </span>
                <span>{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{formatCurrency(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-4 w-full" size="lg" isLoading={submitting}>
            Pay {formatCurrency(total)}
          </Button>
        </div>
      </form>
    </div>
  );
}
