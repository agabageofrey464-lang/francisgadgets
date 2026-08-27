"use client";

import {
  ChevronRight,
  LogOut,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { SearchBar } from "@/components/storefront/SearchBar";
import { CONTACT } from "@/lib/social";
import type { Category } from "@/lib/types";

const BROWSE_LINKS = [
  { href: "/products", label: "All products" },
  { href: "/track-order", label: "Track an order" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Support" },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  isAuthenticated: boolean;
}

export function MobileMenu({ open, onClose, categories, isAuthenticated }: MobileMenuProps) {
  const pathname = usePathname();

  // Close on navigation -- the drawer would otherwise stay open over the new page.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Empty categories exist in the catalogue but are dead ends for a shopper.
  const stockedCategories = categories.filter((c) => c.product_count > 0);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink-900/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-1 shrink-0 bg-brand-flag" />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <Link href="/" onClick={onClose} className="flex min-w-0 items-center gap-2">
            <Image src="/logo.jpg" alt="" width={36} height={36} className="shrink-0 rounded-full" />
            <span className="truncate text-sm font-semibold text-ink-900">Francis Gadgets</span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-ink-900 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-gray-100 px-4 py-3">
          <SearchBar size="md" onSubmitted={onClose} />
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <ul className="mb-4 space-y-0.5">
            {BROWSE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-gray-50 hover:text-brand-600"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>

          {stockedCategories.length > 0 && (
            <>
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Shop by category</p>
              <ul className="space-y-0.5">
                {stockedCategories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                    >
                      <span className="min-w-0 truncate">{c.name}</span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {c.product_count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-gray-100 px-4 py-3">
          <div className="mb-3 flex flex-col gap-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
              Genuine products
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-accent-500" />
              Fast delivery across Uganda
            </span>
          </div>

          <ul className="mb-3 space-y-0.5">
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-gray-50"
                  >
                    <Package className="h-4 w-4 text-gray-400" />
                    My Orders
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onClose();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-gray-50"
                >
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Sign in / Register
                </Link>
              </li>
            )}
          </ul>

          <div className="flex gap-2">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              WhatsApp us
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              aria-label={`Call ${CONTACT.phone}`}
              className="grid place-items-center rounded-lg border border-gray-300 px-3 py-2.5 text-ink-900 hover:bg-gray-50"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
