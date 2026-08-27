"use client";

import {
  ChevronDown,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/storefront/MobileMenu";
import { SearchBar } from "@/components/storefront/SearchBar";
import { UgandaFlagIcon } from "@/components/storefront/UgandaFlagIcon";
import { apiFetch } from "@/lib/api";
import { cartCount, useCartStore } from "@/lib/cart-store";
import { CONTACT } from "@/lib/social";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/products?category=smartphones", label: "Smartphones" },
  { href: "/products?category=laptops", label: "Laptops" },
  { href: "/products?category=cctv-security-cameras", label: "CCTV & Security" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Support" },
];

export function Navbar() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    apiFetch<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      {/* Row 0 -- utility strip: the things shoppers check before they buy. */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 text-xs sm:px-6">
          <span className="flex items-center gap-1.5 text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
            <span className="hidden sm:inline">Genuine products &middot;&nbsp;</span>delivery across Uganda
          </span>

          <div className="ml-auto flex items-center gap-4">
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-1.5 text-white/70 hover:text-white">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{CONTACT.phone}</span>
            </a>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/70 hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <Link href="/track-order" className="hidden items-center gap-1.5 text-white/70 hover:text-white md:flex">
              <Package className="h-3.5 w-3.5" />
              Track order
            </Link>
            <span className="hidden items-center gap-1.5 border-l border-white/15 pl-4 text-white/50 lg:flex">
              <UgandaFlagIcon className="h-3 w-[18px] shrink-0 rounded-[2px]" />
              Uganda &middot; EN
            </span>
          </div>
        </div>
      </div>

      {/* Row 1 -- identity, search and account actions. */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 md:gap-6">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="-ml-2 rounded-lg p-2 text-ink-900 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Francis Gadgets Technologies"
            width={42}
            height={42}
            className="rounded-full ring-1 ring-gray-200"
          />
          <span className="hidden text-sm font-bold leading-tight text-ink-900 lg:block">
            Francis Gadgets
            <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-600">Technologies</span>
          </span>
        </Link>

        <SearchBar categories={categories} className="hidden flex-1 md:block md:max-w-2xl" />

        <div className="ml-auto flex items-center gap-1">
          {session ? (
            <>
              {/* The category row no longer carries "My Orders", so this is the
                  way in to orders and account details on desktop. */}
              <Link
                href="/account"
                className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink-900 sm:flex"
              >
                <UserIcon className="h-[18px] w-[18px]" />
                <span className="hidden xl:inline">Account</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink-900 sm:flex"
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span className="hidden xl:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink-900 sm:flex"
            >
              <UserIcon className="h-[18px] w-[18px]" />
              <span className="hidden xl:inline">Sign in</span>
            </Link>
          )}

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            <span className="relative">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden xl:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Row 2 -- category navigation, desktop only. */}
      <div className="hidden bg-brand-700 md:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-7 px-4 text-sm font-medium text-white sm:px-6">
          <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
            <Link href="/products" className="flex items-center gap-1 py-2.5 transition-colors hover:text-accent-300">
              Products
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {shopOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full z-50 grid w-[34rem] grid-cols-2 gap-0.5 rounded-b-xl border border-gray-200 bg-white p-2 shadow-xl">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="min-w-0 truncate">{c.name}</span>
                    {c.product_count > 0 && (
                      <span className="shrink-0 text-[11px] text-gray-400">{c.product_count}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="py-2.5 transition-colors hover:text-accent-300">
              {link.label}
            </Link>
          ))}

          <span className="ml-auto flex items-center gap-1.5 py-2.5 text-xs text-white/70">
            <Package className="h-3.5 w-3.5" />
            Same-day delivery in Kampala
          </span>
        </nav>
      </div>

      {/* Row 3 -- search on phones, where it matters most. */}
      <div className="border-t border-gray-100 px-4 py-2.5 md:hidden">
        <SearchBar categories={categories} />
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        isAuthenticated={Boolean(session)}
      />
    </header>
  );
}
