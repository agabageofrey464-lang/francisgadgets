"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildAdminLinks, isActiveLink, useAdminStats } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const stats = useAdminStats();
  const links = buildAdminLinks(stats);

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
        {links.map((link) => {
          const { href, label, icon: Icon, count, countTone } = link;
          const active = isActiveLink(pathname, link);
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
