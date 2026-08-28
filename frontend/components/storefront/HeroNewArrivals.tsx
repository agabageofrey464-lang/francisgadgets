import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import { DotGrid } from "@/components/ui/Pattern";
import type { ProductListItem } from "@/lib/types";
import { discountPercent, splitPrice } from "@/lib/utils";

/**
 * Newest stock, filling the column beside the category rail.
 *
 * The rail lists all 22 categories, so it stands much taller than the hero
 * carousel and the quick-picks row beneath it. This closes that gap with the
 * freshest stock rather than whitespace -- eight products, which is what it
 * takes to reach the bottom of the rail on a desktop screen.
 */
export function HeroNewArrivals({ products }: { products: ProductListItem[] }) {
  const items = products.slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section className="mt-4 hidden overflow-hidden rounded-xl border border-gray-200 bg-white lg:block">
      {/* Banded header, so the panel reads as its own thing rather than more grid. */}
      <div className="relative overflow-hidden bg-ink-900 px-4 py-3">
        <div className="pointer-events-none absolute inset-0 text-white/[0.07]" aria-hidden>
          <DotGrid id="new-arrivals-dots" className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/25 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-400/20 text-accent-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold leading-tight text-white">Just arrived</h2>
              <p className="text-[11px] text-gray-400">Newest stock on the shelves</p>
            </div>
          </div>

          <Link
            href="/products?sort=newest"
            className="group inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            See all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-px bg-gray-100">
        {items.map((product, i) => {
          const discount = discountPercent(product.price, product.compare_at_price);
          const [currency, amount] = splitPrice(product.price);

          return (
            <li key={product.id} className="bg-white">
              <Link href={`/products/${product.slug}`} className="group flex h-full flex-col p-2.5">
                <span className="relative block aspect-square overflow-hidden rounded-lg bg-white">
                  <ProductThumb
                    image={product.images[0]}
                    name={product.name}
                    categorySlug={product.category?.slug}
                    sizes="160px"
                    patternId={`arrival-dots-${product.id}`}
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* The first four are the freshest, so they carry the flag. */}
                  {i < 4 && discount === null && (
                    <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      New
                    </span>
                  )}
                  {discount !== null && (
                    <span className="absolute left-1 top-1 rounded bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      -{discount}%
                    </span>
                  )}
                </span>

                <span className="mt-1.5 line-clamp-2 flex-1 text-xs leading-snug text-ink-800 group-hover:text-brand-700 group-hover:underline">
                  {product.name}
                </span>

                <span className="mt-1 flex items-baseline gap-1">
                  <span className="text-[10px] font-semibold text-ink-900">{currency}</span>
                  <span className="price text-sm font-bold leading-none text-ink-900">{amount}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
