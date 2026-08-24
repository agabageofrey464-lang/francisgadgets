import { ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { AdSlot } from "@/components/storefront/AdSlot";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { ProductCard } from "@/components/storefront/ProductCard";
import { TaglineMarquee } from "@/components/storefront/TaglineMarquee";
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
      <HeroBanner />

      <section className="bg-ink-900">
        <h1 className="sr-only">Your digital dreams delivered.</h1>

        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 pt-16 sm:px-6 md:pt-24">
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            New arrivals every week
          </span>
        </div>

        <div className="my-6">
          <TaglineMarquee />
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 pb-16 sm:px-6 md:pb-24">
          <div className="flex flex-wrap gap-2">
            {["Phones", "Laptops", "Audio", "Accessories"].map((label) => (
              <span
                key={label}
                className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-white/10"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent-500" />
              Genuine products
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-accent-500" />
              Fast delivery across Uganda
            </span>
          </div>

          <Link
            href="/products"
            className="mt-1 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Shop now
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <AdSlot placement="homepage_mid" />
      </div>

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
