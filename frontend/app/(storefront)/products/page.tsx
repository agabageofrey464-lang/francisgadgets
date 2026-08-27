import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdSlot } from "@/components/storefront/AdSlot";
import { FestivalStrip } from "@/components/storefront/FestivalStrip";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductFilters, type ProductSearchParams } from "@/components/storefront/ProductFilters";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { EmptyBoxGraphic } from "@/components/ui/Pattern";
import { apiFetch } from "@/lib/api";
import type { Category, Page, ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type SearchParams = ProductSearchParams;

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "name", label: "Name: A to Z" },
];

async function getProducts(searchParams: SearchParams) {
  return apiFetch<Page<ProductListItem>>("/products", {
    params: {
      q: searchParams.q,
      category_slug: searchParams.category,
      min_price: searchParams.min_price,
      max_price: searchParams.max_price,
      in_stock: searchParams.in_stock,
      sort: searchParams.sort ?? "newest",
      page: searchParams.page ?? "1",
      page_size: 12,
    },
  });
}

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParams = await searchParamsPromise;

  if (searchParams.category) {
    const categories = await apiFetch<Category[]>("/categories").catch(() => []);
    const category = categories.find((c) => c.slug === searchParams.category);
    if (category) {
      return {
        title: category.name,
        description: `Shop ${category.name} in Uganda -- genuine products, fast delivery.`,
        alternates: { canonical: `/products?category=${category.slug}` },
      };
    }
  }

  if (searchParams.q) {
    return { title: `Search: ${searchParams.q}`, robots: { index: false, follow: true } };
  }

  return { title: "Shop all products", alternates: { canonical: "/products" } };
}

export default async function ProductsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<SearchParams> }) {
  const searchParams = await searchParamsPromise;
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    apiFetch<Category[]>("/categories").catch(() => [] as Category[]),
  ]);

  const activeCategory = categories.find((c) => c.slug === searchParams.category) ?? null;
  const heading = searchParams.q
    ? `Results for "${searchParams.q}"`
    : (activeCategory?.name ?? "Shop all products");

  const buildQuery = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams({
      ...(searchParams.q ? { q: searchParams.q } : {}),
      ...(searchParams.category ? { category: searchParams.category } : {}),
      ...(searchParams.min_price ? { min_price: searchParams.min_price } : {}),
      ...(searchParams.max_price ? { max_price: searchParams.max_price } : {}),
      ...(searchParams.in_stock ? { in_stock: searchParams.in_stock } : {}),
      ...(searchParams.sort ? { sort: searchParams.sort } : {}),
      ...overrides,
    } as Record<string, string>);
    return `/products?${params.toString()}`;
  };

  // A chip per active filter, each linking to the same view with that one dropped.
  const withoutParam = (key: keyof SearchParams) => {
    const rest = { ...searchParams, page: undefined, [key]: undefined };
    const params = new URLSearchParams(
      Object.entries(rest).filter(([, value]) => Boolean(value)) as [string, string][]
    );
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const chips: { key: keyof SearchParams; label: string }[] = [
    ...(searchParams.q ? [{ key: "q" as const, label: `Search: ${searchParams.q}` }] : []),
    ...(activeCategory ? [{ key: "category" as const, label: activeCategory.name }] : []),
    ...(searchParams.min_price ? [{ key: "min_price" as const, label: `From ${formatCurrency(searchParams.min_price)}` }] : []),
    ...(searchParams.max_price ? [{ key: "max_price" as const, label: `Up to ${formatCurrency(searchParams.max_price)}` }] : []),
    ...(searchParams.in_stock === "true" ? [{ key: "in_stock" as const, label: "In stock only" }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <FestivalStrip layout="banner" />

      <h1 className={`mt-5 text-2xl font-bold text-ink-900 ${chips.length ? "" : "mb-6"}`}>{heading}</h1>

      {/* Searching now happens in the navbar, so this row only shows -- and clears -- what is currently applied. */}
      {chips.length > 0 && (
        <div className="mb-6 mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={withoutParam(chip.key)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              {chip.label}
              <X className="h-3.5 w-3.5" />
            </Link>
          ))}
          {chips.length > 1 && (
            <Link href="/products" className="text-xs font-medium text-gray-400 hover:text-brand-600">
              Clear all
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
        <div className="lg:space-y-6">
          <ProductFilters categories={categories} searchParams={searchParams} />
          <div className="hidden lg:block">
            <FestivalStrip />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">{products.total} products</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.key}
                  href={buildQuery({ sort: opt.key, page: "1" })}
                  className={cnLink(searchParams.sort === opt.key || (!searchParams.sort && opt.key === "newest"))}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {products.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <EmptyBoxGraphic className="mx-auto mb-4 w-32 text-brand-600" />
              <p className="text-sm font-medium text-ink-900">No products match these filters.</p>
              <p className="mt-1 text-sm text-gray-500">Try widening the price range or clearing a filter.</p>
              <Link
                href="/products"
                className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-8">
            <AdSlot placement="product_list" />
          </div>

          {products.pages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
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
      </div>

      <PromiseStrip className="mt-10" />
    </div>
  );
}

function cnLink(active: boolean): string {
  return active ? "font-semibold text-brand-600" : "text-gray-500 hover:text-brand-600";
}
