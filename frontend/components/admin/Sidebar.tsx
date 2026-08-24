"use client";

import { LayoutDashboard, Megaphone, Package, Tags, ShoppingBag, Users, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiFetch<DashboardStats>("/admin/dashboard/stats", { token: session.accessToken })
      .then(setStats)
      .catch(() => setStats(null));
  }, [session?.accessToken]);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, count: undefined },
    { href: "/admin/products", label: "Products", icon: Package, count: stats?.products_count },
    { href: "/admin/categories", label: "Categories", icon: Tags, count: stats?.categories_count },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag, count: stats?.pending_orders, countTone: "warning" as const },
    { href: "/admin/customers", label: "Customers", icon: Users, count: stats?.customers_count },
    { href: "/admin/ads", label: "Ads", icon: Megaphone, count: undefined },
  ];

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r-2 border-accent-500 bg-ink-900 md:flex">
      <div className="h-1 bg-brand-flag" />
      <div className="p-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="Francis Gadgets Technologies" width={40} height={40} className="rounded-full" />
          <span>
            <span className="block text-sm font-semibold leading-tight text-white">Francis Gadgets</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-400">Admin</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon, exact, count, countTone }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white",
                    countTone === "warning" && count > 0 ? "bg-amber-500" : "bg-white/15"
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-400">
          <ExternalLink className="h-3.5 w-3.5" />
          View storefront
        </Link>
      </div>
    </aside>
  );
}
