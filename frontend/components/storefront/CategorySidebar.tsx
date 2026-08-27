"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import { categoryIcon } from "@/lib/category-icons";
import { apiFetch } from "@/lib/api";
import type { Category, Page, ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Jumia-style vertical category rail. Hovering a row opens a flyout with that
 * category's top products, fetched once per category and then cached.
 */
export function CategorySidebar({ categories }: { categories: Category[] }) {
  const stocked = categories.filter((c) => c.product_count > 0);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, ProductListItem[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const open = (slug: string) => {
    setActiveSlug(slug);
    if (preview[slug]) return;

    setLoading(slug);
    apiFetch<Page<ProductListItem>>("/products", { params: { category_slug: slug, page_size: 6 } })
      .then((res) => setPreview((prev) => ({ ...prev, [slug]: res.items })))
      .catch(() => setPreview((prev) => ({ ...prev, [slug]: [] })))
      .finally(() => setLoading((current) => (current === slug ? null : current)));
  };

  if (stocked.length === 0) return null;

  const activeCategory = stocked.find((c) => c.slug === activeSlug) ?? null;
  const activeItems = activeSlug ? preview[activeSlug] : undefined;

  return (
    <nav
      aria-label="Product categories"
      className="relative hidden rounded-xl border border-gray-200 bg-white lg:block"
      onMouseLeave={() => setActiveSlug(null)}
    >
      <p className="border-b border-gray-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        All categories
      </p>

      <ul className="py-1">
        {stocked.map((c) => {
          const Icon = categoryIcon(c.slug);
          const active = activeSlug === c.slug;
          return (
            <li key={c.id}>
              <Link
                href={`/products?category=${c.slug}`}
                onMouseEnter={() => open(c.slug)}
                onFocus={() => open(c.slug)}
                className={`flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand-600" : "text-gray-400"}`} />
                  <span className="truncate">{c.name}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              </Link>
            </li>
          );
        })}
      </ul>

      {activeCategory && (
        <div className="absolute left-full top-0 z-30 ml-1 w-[34rem] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-900">{activeCategory.name}</h3>
            <Link
              href={`/products?category=${activeCategory.slug}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              See all {activeCategory.product_count} &rarr;
            </Link>
          </div>

          {loading === activeSlug && !activeItems ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-lg bg-gray-100" />
                  <div className="mt-2 h-3 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : activeItems && activeItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {activeItems.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-white">
                    <ProductThumb
                      image={p.images[0]}
                      name={p.name}
                      categorySlug={p.category?.slug}
                      sizes="160px"
                      patternId={`flyout-dots-${p.id}`}
                      className="object-contain p-2 transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-gray-600 group-hover:text-brand-600">
                    {p.name}
                  </p>
                  <p className="text-xs font-semibold text-ink-900">{formatCurrency(p.price)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">Nothing to show yet.</p>
          )}
        </div>
      )}
    </nav>
  );
}
