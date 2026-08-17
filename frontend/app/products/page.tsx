import Link from "next/link";

import { ProductCard } from "@/components/storefront/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Page, ProductListItem } from "@/lib/types";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams) {
  return apiFetch<Page<ProductListItem>>("/products", {
    params: {
      q: searchParams.q,
      category_slug: searchParams.category,
      sort: searchParams.sort ?? "newest",
      page: searchParams.page ?? "1",
      page_size: 12,
    },
  });
}

export default async function ProductsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<SearchParams> }) {
  const searchParams = await searchParamsPromise;
  const products = await getProducts(searchParams);

  const buildQuery = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams({
      ...(searchParams.q ? { q: searchParams.q } : {}),
      ...(searchParams.category ? { category: searchParams.category } : {}),
      ...(searchParams.sort ? { sort: searchParams.sort } : {}),
      ...overrides,
    } as Record<string, string>);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Shop all products</h1>

      <form action="/products" method="get" className="mb-6 max-w-sm">
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </form>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{products.total} products</p>
        <div className="flex gap-2 text-sm">
          {[
            { key: "newest", label: "Newest" },
            { key: "price_asc", label: "Price: Low to High" },
            { key: "price_desc", label: "Price: High to Low" },
          ].map((opt) => (
            <Link
              key={opt.key}
              href={buildQuery({ sort: opt.key })}
              className={cnLink(searchParams.sort === opt.key || (!searchParams.sort && opt.key === "newest"))}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {products.items.length === 0 ? (
        <p className="text-sm text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {products.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: products.pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery({ page: String(p) })}
              className={
                p === products.page
                  ? "rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-md border border-gray-300 px-3 py-1.5 text-sm text-ink-900 hover:bg-gray-50"
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function cnLink(active: boolean): string {
  return active ? "font-semibold text-brand-600" : "text-gray-500 hover:text-brand-600";
}
