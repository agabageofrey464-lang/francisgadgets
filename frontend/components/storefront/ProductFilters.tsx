import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import type { Category } from "@/lib/types";

export interface ProductSearchParams {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
}

interface ProductFiltersProps {
  categories: Category[];
  searchParams: ProductSearchParams;
}

/**
 * Server-rendered filters: category picks are plain links and the price /
 * availability controls are a GET form, so the whole panel works without JS
 * and every filtered view stays a shareable URL.
 */
export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const stocked = categories.filter((c) => c.product_count > 0);

  const categoryHref = (slug: string | null) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set("q", searchParams.q);
    if (slug) params.set("category", slug);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.min_price) params.set("min_price", searchParams.min_price);
    if (searchParams.max_price) params.set("max_price", searchParams.max_price);
    if (searchParams.in_stock) params.set("in_stock", searchParams.in_stock);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const body = (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-900">Category</h2>
        <ul className="space-y-0.5">
          <li>
            <Link
              href={categoryHref(null)}
              className={
                searchParams.category
                  ? "block rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-600"
                  : "block rounded-md bg-brand-50 px-2 py-1.5 text-sm font-semibold text-brand-700"
              }
            >
              All categories
            </Link>
          </li>
          {stocked.map((c) => {
            const active = searchParams.category === c.slug;
            return (
              <li key={c.id}>
                <Link
                  href={categoryHref(c.slug)}
                  className={
                    active
                      ? "flex items-center justify-between gap-2 rounded-md bg-brand-50 px-2 py-1.5 text-sm font-semibold text-brand-700"
                      : "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-600"
                  }
                >
                  <span className="min-w-0 truncate">{c.name}</span>
                  <span className="shrink-0 text-[11px] text-gray-400">{c.product_count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <form action="/products" method="get" className="space-y-4 border-t border-gray-100 pt-5">
        {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}

        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Price (UGX)</h2>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min_price"
              min={0}
              step={1000}
              defaultValue={searchParams.min_price}
              placeholder="Min"
              aria-label="Minimum price"
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <span className="text-gray-300">&ndash;</span>
            <input
              type="number"
              name="max_price"
              min={0}
              step={1000}
              defaultValue={searchParams.max_price}
              placeholder="Max"
              aria-label="Maximum price"
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="in_stock"
            value="true"
            defaultChecked={searchParams.in_stock === "true"}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          In stock only
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Apply
          </button>
          <Link
            href={searchParams.q ? `/products?q=${encodeURIComponent(searchParams.q)}` : "/products"}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink-900 transition-colors hover:bg-gray-50"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {/* Phones: collapsed behind a disclosure so the grid stays above the fold. */}
      <details className="mb-6 rounded-xl border border-gray-200 bg-white p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-900">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          Filters
        </summary>
        <div className="mt-4">{body}</div>
      </details>

      <aside className="hidden lg:block">
        <div className="sticky top-32 rounded-xl border border-gray-200 bg-white p-4">{body}</div>
      </aside>
    </>
  );
}
