import { LayoutDashboard, Megaphone, Package, ShoppingBag, Tags, Users, type LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

export interface AdminLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  count?: number;
  countTone?: "warning";
}

/** Shared by the desktop sidebar and the mobile drawer so the two never drift. */
export function buildAdminLinks(stats: DashboardStats | null): AdminLink[] {
  return [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package, count: stats?.products_count },
    { href: "/admin/categories", label: "Categories", icon: Tags, count: stats?.categories_count },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag, count: stats?.pending_orders, countTone: "warning" },
    { href: "/admin/customers", label: "Customers", icon: Users, count: stats?.customers_count },
    { href: "/admin/ads", label: "Ads", icon: Megaphone },
  ];
}

export function useAdminStats(): DashboardStats | null {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiFetch<DashboardStats>("/admin/dashboard/stats", { token: session.accessToken })
      .then(setStats)
      .catch(() => setStats(null));
  }, [session?.accessToken]);

  return stats;
}

export function isActiveLink(pathname: string, link: AdminLink): boolean {
  return link.exact ? pathname === link.href : pathname.startsWith(link.href);
}
