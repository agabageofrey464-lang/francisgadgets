import Image from "next/image";
import Link from "next/link";

import { AdSlot } from "@/components/storefront/AdSlot";
import { CategorySidebar } from "@/components/storefront/CategorySidebar";
import { FestivalStrip } from "@/components/storefront/FestivalStrip";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { HeroQuickPicks } from "@/components/storefront/HeroQuickPicks";
import { ProductRail } from "@/components/storefront/ProductRail";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { CategoryTileGraphic } from "@/components/storefront/CategoryTileGraphic";
import { apiFetch } from "@/lib/api";
import type { Category, Page, ProductListItem } from "@/lib/types";
import { discountPercent, isUnreachableImageUrl } from "@/lib/utils";

/**
 * Hero slides should show the range of the shop, not eight laptops in a row --
 * so take the newest product from each of a spread of categories.
 */
const HERO_CATEGORY_ORDER = [
  "smartphones",
  "laptops",
  "cctv-security-cameras",
  "tablets",
  "gps-trackers",
  "audio",
  "desktops",
  "networking",
  "phone-accessories",
  "computer-accessories",
];

/** One request feeds the hero, the deals rail, new arrivals and the category rows. */
async function getCatalogue(): Promise<ProductListItem[]> {
  try {
    const res = await apiFetch<Page<ProductListItem>>("/products", {
      params: { page_size: 100, sort: "newest" },
    });
    return res.items;
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>("/categories");
  } catch {
    return [];
  }
}

/**
 * Worth putting in front of a shopper. Artwork is no longer a condition --
 * every product is illustrated -- so this is purely about being buyable.
 */
function isSellable(product: ProductListItem): boolean {
  return product.stock_quantity > 0;
}

/** 0 rather than null here, so the deals rail can sort on it directly. */
function dealPercent(product: ProductListItem): number {
  return discountPercent(product.price, product.compare_at_price) ?? 0;
}

function pickHeroProducts(catalogue: ProductListItem[]): ProductListItem[] {
  const bySlug = new Map<string, ProductListItem>();
  for (const product of catalogue) {
    const slug = product.category?.slug;
    if (!slug || bySlug.has(slug) || !isSellable(product)) continue;
    bySlug.set(slug, product);
  }

  const ordered = HERO_CATEGORY_ORDER.map((slug) => bySlug.get(slug)).filter(
    (p): p is ProductListItem => Boolean(p)
  );
  const extras = [...bySlug.entries()]
    .filter(([slug]) => !HERO_CATEGORY_ORDER.includes(slug))
    .map(([, product]) => product);

  return [...ordered, ...extras].slice(0, 6);
}

export default async function HomePage() {
  const [catalogue, categories] = await Promise.all([getCatalogue(), getCategories()]);

  // Categories with nothing in them are dead ends for a shopper.
  const stockedCategories = categories.filter((c) => c.product_count > 0);

  const heroProducts = pickHeroProducts(catalogue);
  const deals = catalogue
    .filter((p) => isSellable(p) && dealPercent(p) > 0)
    .sort((a, b) => dealPercent(b) - dealPercent(a))
    .slice(0, 6);
  const newArrivals = catalogue.filter(isSellable).slice(0, 6);

  // The three biggest categories each get their own row.
  const featuredCategories = [...stockedCategories].sort((a, b) => b.product_count - a.product_count).slice(0, 3);

  return (
    <div>
      {/* The page's only h1 -- the visible headline lives in BrandHero, which is currently parked. */}
      <h1 className="sr-only">
        Francis Gadgets Technologies -- phones, laptops, CCTV and electronics in Uganda
      </h1>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
          <CategorySidebar categories={stockedCategories} />
          <div className="min-w-0">
            <HeroBanner products={heroProducts} />
            <HeroQuickPicks products={deals.length >= 4 ? deals : newArrivals} />
          </div>
          <div className="hidden xl:block">
            <FestivalStrip />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 xl:hidden">
        <FestivalStrip layout="row" />
      </section>

      {/* Bridges the hero into the catalogue: one flat band, same width and
          corner radius as the hero row above it. */}
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <PromiseStrip />
      </section>

      {stockedCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900 sm:text-lg">Shop by category</h2>
            <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {stockedCategories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-gray-50">
                  {c.image_url && !isUnreachableImageUrl(c.image_url) ? (
                    <Image
                      src={c.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <CategoryTileGraphic slug={c.slug} name={c.name} />
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-ink-900 group-hover:text-brand-600">
                    {c.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {c.product_count} {c.product_count === 1 ? "item" : "items"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRail
        title="Best deals"
        subtitle="Biggest price drops in stock right now"
        href="/products?sort=price_asc"
        products={deals}
        accent="bg-accent-600"
      />

      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <AdSlot placement="homepage_mid" />
      </div>

      <ProductRail
        title="New arrivals"
        subtitle="Latest stock on the shelves"
        href="/products?sort=newest"
        products={newArrivals}
      />

      {featuredCategories.map((category, i) => (
        <ProductRail
          key={category.id}
          title={category.name}
          subtitle={`${category.product_count} products available`}
          href={`/products?category=${category.slug}`}
          products={catalogue.filter((p) => p.category?.slug === category.slug && isSellable(p)).slice(0, 6)}
          accent={["bg-brand-600", "bg-ink-800", "bg-brand-900"][i % 3]}
        />
      ))}

      <div className="pb-8" />
    </div>
  );
}
