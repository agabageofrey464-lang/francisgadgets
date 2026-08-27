"use client";

import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { buildAdminLinks, isActiveLink, useAdminStats } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

function initials(nameOrEmail: string): string {
  const source = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "A").concat(parts[1]?.[0] ?? "").toUpperCase();
}

/**
 * The console's header bar. On desktop it carries the page title, the signed-in
 * admin and sign-out; below md it also opens the nav drawer, since the Sidebar
 * is hidden there.
 */
export function AdminTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const stats = useAdminStats();
  const links = buildAdminLinks(stats);
  const [open, setOpen] = useState(false);

  const current = links.find((link) => isActiveLink(pathname, link));
  const identity = session?.user?.name || session?.user?.email || "Admin";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 -mx-4 -mt-4 mb-6 border-b border-gray-200 bg-white/90 backdrop-blur sm:-mx-6 sm:-mt-6">
        <div className="h-1 bg-brand-flag md:hidden" />
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={open}
            className="-ml-2 rounded-lg p-2 text-ink-900 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Image src="/logo.jpg" alt="" width={32} height={32} className="rounded-full md:hidden" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900 md:text-base">
              {current?.label ?? "Admin"}
            </p>
            <p className="hidden text-xs text-gray-400 md:block">Francis Gadgets Technologies console</p>
          </div>

          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-brand-300 hover:text-brand-600 sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View storefront
          </Link>

          <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 md:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-flag text-xs font-bold text-white">
              {initials(identity)}
            </span>
            <span className="hidden max-w-[12rem] lg:block">
              <span className="block truncate text-xs font-medium text-ink-900">{identity}</span>
              <span className="block text-[11px] text-gray-400">Administrator</span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink-900"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>

          <Link
            href="/"
            aria-label="View storefront"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink-900 sm:hidden"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </header>

      <div className={cn("fixed inset-0 z-50 md:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink-900/70 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col border-r-2 border-accent-500 bg-ink-900 shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-1 shrink-0 bg-brand-flag" />

          <div className="flex shrink-0 items-center justify-between gap-3 p-4">
            <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
              <Image src="/logo.jpg" alt="" width={36} height={36} className="shrink-0 rounded-full" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-white">Francis Gadgets</span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-400">Admin</span>
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              className="rounded-lg p-2 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2">
            {links.map((link) => {
              const { href, label, icon: Icon, count, countTone } = link;
              const active = isActiveLink(pathname, link);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

          <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
            <p className="px-3 pb-1 text-[11px] text-gray-500">Signed in as</p>
            <p className="truncate px-3 pb-2 text-xs font-medium text-white">{identity}</p>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              View storefront
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
