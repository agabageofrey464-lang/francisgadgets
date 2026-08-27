import Link from "next/link";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import type { ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Sits directly under the hero carousel. The category rail beside it is taller
 * than the carousel, so this fills that column instead of leaving dead space --
 * and does it with stock rather than filler.
 */
export function HeroQuickPicks({ products }: { products: ProductListItem[] }) {
  const picks = products.slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <div className="mt-4 hidden grid-cols-4 gap-3 lg:grid">
      {picks.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group flex flex-col"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white">
            <ProductThumb
              image={product.images[0]}
              name={product.name}
              categorySlug={product.category?.slug}
              sizes="180px"
              patternId={`pick-dots-${product.id}`}
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="pt-1.5">
            <p className="line-clamp-2 text-xs leading-snug text-ink-800 group-hover:text-brand-700 group-hover:underline">
              {product.name}
            </p>
            <p className="mt-1 text-sm font-bold text-ink-900">{formatCurrency(product.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
