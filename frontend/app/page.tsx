import Link from "next/link";

import { ProductCard } from "@/components/storefront/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Category, Page, ProductListItem } from "@/lib/types";

async function getFeaturedProducts() {
  try {
    return await apiFetch<Page<ProductListItem>>("/products", { params: { page_size: 8, sort: "newest" } });
  } catch {
    return null;
  }
}

async function getCategories() {
  try {
    return await apiFetch<Category[]>("/categories");
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div>
      <section className="bg-ink-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-16 sm:px-6 md:py-24">
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            New arrivals every week
          </span>
          <h1 className="max-w-2xl text-3xl font-bold text-white sm:text-5xl">
            The latest gadgets, at prices that make sense.
          </h1>
          <p className="max-w-xl text-gray-300">
            Phones, laptops, audio and accessories -- genuine products, fast delivery across Uganda.
          </p>
          <Link
            href="/products"
            className="mt-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Shop now
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="mb-4 text-lg font-semibold text-ink-900">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:border-brand-500 hover:text-brand-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {!products || products.items.length === 0 ? (
          <p className="text-sm text-gray-500">
            No products yet -- run the seed script or add products from the admin dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
