"use client";

import { Lock, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { CheckoutSteps } from "@/components/storefront/CheckoutSteps";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import type { Order } from "@/lib/types";
import { formatCurrency, isUnreachableImageUrl, splitPrice } from "@/lib/utils";

const SHIPPING_FEE = 10000;

const PROVIDERS = [
  { key: "flutterwave", name: "Flutterwave", blurb: "Cards, mobile money and bank transfer." },
  { key: "paystack", name: "Paystack", blurb: "Cards and bank transfer." },
] as const;

interface PaymentInitResponse {
  authorization_url: string;
  reference: string;
  provider: string;
}

/** A numbered section, so the form reads as three steps rather than one wall. */
function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-ink-900">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
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

  const subtotal = cartSubtotal(items);
  const total = subtotal + SHIPPING_FEE;
  const [currency, amount] = splitPrice(total);

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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">Checkout</h1>
        <CheckoutSteps current={1} />
      </div>

      <form
        onSubmit={submit}
        className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="space-y-4">
          <Section step={1} title="Contact">
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
            <p className="mt-2 text-xs text-gray-500">
              We use these to confirm the order and reach you about the delivery.
            </p>
          </Section>

          <Section step={2} title="Delivery address">
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
          </Section>

          <Section step={3} title="Payment method">
            <div className="grid gap-3 sm:grid-cols-2">
              {PROVIDERS.map((p) => {
                const selected = provider === p.key;
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => setProvider(p.key)}
                    aria-pressed={selected}
                    className={`rounded-lg border p-3.5 text-left transition-colors ${
                      selected
                        ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                        : "border-gray-300 hover:border-brand-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                          selected ? "border-brand-600" : "border-gray-300"
                        }`}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                      </span>
                      <span className="text-sm font-semibold text-ink-900">{p.name}</span>
                    </span>
                    <span className="mt-1 block pl-6 text-xs text-gray-500">{p.blurb}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5 text-brand-600" />
              You pay on the provider&apos;s secure page -- we never see your card details.
            </p>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900">Order summary</h2>

            <ul className="mt-3 space-y-3 border-t border-gray-100 pt-3">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-2.5">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {!isUnreachableImageUrl(item.image) && (
                      <Image src={item.image!} alt="" fill sizes="48px" className="object-contain p-0.5" />
                    )}
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-xs leading-snug text-ink-800">{item.name}</span>
                  </span>
                  <span className="price shrink-0 text-xs font-semibold text-ink-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{formatCurrency(SHIPPING_FEE)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-gray-100 pt-2">
                <span className="text-sm font-semibold text-ink-900">Total</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-ink-900">{currency}</span>
                  <span className="price text-xl font-bold leading-none text-ink-900">{amount}</span>
                </span>
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full" size="lg" isLoading={submitting}>
              {submitting ? "Starting payment..." : `Pay ${formatCurrency(total)}`}
            </Button>

            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <li className="flex gap-2 text-xs leading-relaxed text-gray-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                Genuine stock, checked before it leaves us.
              </li>
              <li className="flex gap-2 text-xs leading-relaxed text-gray-600">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                Same-day within Kampala, countrywide by courier.
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
