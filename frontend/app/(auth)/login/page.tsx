"use client";

import { ArrowLeft, LayoutDashboard, Lock, Megaphone, Package, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const ADMIN_POINTS = [
  { icon: Package, label: "Catalogue", body: "Add products, images, stock levels and pricing." },
  { icon: ShoppingBag, label: "Orders", body: "Track payments, fulfilment and delivery status." },
  { icon: Megaphone, label: "Ads", body: "Schedule homepage banners and video placements." },
];

const SHOP_POINTS = [
  { icon: ShieldCheck, label: "Genuine products", body: "Sourced from authorised channels." },
  { icon: Truck, label: "Countrywide delivery", body: "Same-day in Kampala, nationwide dispatch." },
  { icon: Package, label: "Order history", body: "Track every order from one place." },
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const isAdminLogin = callbackUrl.startsWith("/admin");
  const points = isAdminLogin ? ADMIN_POINTS : SHOP_POINTS;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel -- the admin console gets its own identity, not the shop's. */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-flag" />
        <div
          className="pointer-events-none absolute -left-24 top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={44} height={44} className="rounded-full" />
          <span>
            <span className="block text-sm font-semibold leading-tight text-white">Francis Gadgets</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-400">
              {isAdminLogin ? "Admin Console" : "Technologies"}
            </span>
          </span>
        </div>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white">
            {isAdminLogin ? (
              <>
                Run the shop from{" "}
                <span className="bg-brand-flag bg-clip-text text-transparent">one console.</span>
              </>
            ) : (
              <>
                Your digital dreams,{" "}
                <span className="bg-brand-flag bg-clip-text text-transparent">delivered.</span>
              </>
            )}
          </h2>

          <ul className="mt-8 space-y-5">
            {points.map((point) => (
              <li key={point.label} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-accent-500 ring-1 ring-inset ring-white/10">
                  <point.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{point.label}</span>
                  <span className="block text-sm text-gray-400">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Francis Gadgets Technologies
        </p>
      </aside>

      <div className="flex flex-col bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-sm">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image src="/logo.jpg" alt="" width={40} height={40} className="rounded-full" />
              <span>
                <span className="block text-sm font-semibold leading-tight text-ink-900">Francis Gadgets</span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                  {isAdminLogin ? "Admin Console" : "Technologies"}
                </span>
              </span>
            </div>

            {isAdminLogin && (
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Staff access
              </span>
            )}

            <h1 className="mb-1 text-2xl font-bold text-ink-900">
              {isAdminLogin ? "Admin sign in" : "Welcome back"}
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              {isAdminLogin
                ? "Authorised staff accounts only."
                : "Sign in to track orders and check out faster."}
            </p>

            <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" isLoading={loading}>
                {isAdminLogin ? "Sign in to console" : "Sign in"}
              </Button>

              {isAdminLogin && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  This area is restricted and access is logged.
                </p>
              )}
            </form>

            {!isAdminLogin && (
              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-brand-600 hover:underline">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
