"use client";

import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Search, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { UgandaFlagIcon } from "@/components/storefront/UgandaFlagIcon";
import { apiFetch } from "@/lib/api";
import { cartCount, useCartStore } from "@/lib/cart-store";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
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

  useEffect(() => {
    setMounted(true);
    apiFetch<Category[]>("/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="h-1 bg-brand-flag" />
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.jpg" alt="Francis Gadgets Technologies" width={40} height={40} className="rounded-full" />
        </Link>

        <nav className="hidden flex-1 items-center gap-7 text-sm font-medium text-ink-900 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link href="/products" className="flex items-center gap-1 py-2 transition-colors hover:text-brand-600">
              Products
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {shopOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full grid w-64 grid-cols-1 gap-0.5 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-600">
              {link.label}
            </Link>
          ))}
          {session && (
            <Link href="/orders" className="transition-colors hover:text-brand-600">
              My Orders
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 text-ink-900">
          <Link href="/products" className="rounded-lg p-2 hover:bg-gray-100" aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {session?.user.role === "admin" && (
            <Link href="/admin" className="rounded-lg p-2 hover:bg-gray-100" aria-label="Admin">
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </Link>
          )}

          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Sign out">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <Link href="/login" className="rounded-lg p-2 hover:bg-gray-100" aria-label="Sign in">
              <UserIcon className="h-[18px] w-[18px]" />
            </Link>
          )}

          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-gray-100" aria-label="Cart">
            <ShoppingCart className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-500 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <span className="ml-1 hidden items-center gap-1.5 border-l border-gray-200 pl-3 text-xs font-medium text-gray-500 sm:flex">
            <UgandaFlagIcon className="h-3 w-[18px] shrink-0 rounded-[2px]" />
            <span>Uganda &middot; EN</span>
          </span>
        </div>
      </div>
    </header>
  );
}
