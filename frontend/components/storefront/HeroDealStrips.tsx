"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import { DotGrid } from "@/components/ui/Pattern";
import type { ProductListItem } from "@/lib/types";
import { discountPercent, formatCurrency, splitPrice } from "@/lib/utils";

/**
 * Stacked strips that rotate through discounted stock, filling the column
 * beside the category rail.
 *
 * The rail lists all 22 categories and stands far taller than the carousel, so
 * this fills the rest of the height with movement rather than whitespace. Each
 * strip cycles its own set of products on a staggered clock, so the panel is
 * always changing somewhere without every row flipping at once -- which would
 * read as a glitch rather than a rotation.
 */

/** One flat colour per strip. Flat fills, in keeping with the rest of the shop. */
const TONES = [
  { bg: "bg-brand-700", chip: "bg-accent-400 text-ink-900" },
  { bg: "bg-ink-800", chip: "bg-accent-400 text-ink-900" },
  { bg: "bg-brand-900", chip: "bg-accent-400 text-ink-900" },
];

const ROTATE_MS = 3800;
/** Offset between strips so they never all turn over on the same tick. */
const STAGGER_MS = 1100;

function Strip({
  products,
  tone,
  delay,
}: {
  products: ProductListItem[];
  tone: (typeof TONES)[number];
  delay: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const start = setTimeout(() => {
      setIndex((i) => (i + 1) % products.length);
    }, delay);
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, ROTATE_MS);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [products.length, delay]);

  const product = products[index];
  if (!product) return null;

  const discount = discountPercent(product.price, product.compare_at_price);
  const [currency, amount] = splitPrice(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative flex flex-1 items-center gap-4 overflow-hidden px-4 text-white transition-colors duration-500 ${tone.bg}`}
    >
      <div className="pointer-events-none absolute inset-0 text-white/[0.06]" aria-hidden>
        <DotGrid id={`deal-dots-${product.id}`} className="h-full w-full" />
      </div>

      {/* The product itself, on a light plate so the photo reads on dark. */}
      <div className="relative h-[78%] w-24 shrink-0 overflow-hidden rounded-lg bg-white/95">
        <ProductThumb
          image={product.images[0]}
          name={product.name}
          categorySlug={product.category?.slug}
          sizes="96px"
          patternId={`deal-art-${product.id}`}
          className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <span className="relative min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</span>

        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[11px] font-semibold text-white/70">{currency}</span>
          <span className="price text-lg font-bold leading-none">{amount}</span>
          {product.compare_at_price && discount !== null && (
            <span className="price text-xs text-white/50 line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </span>
      </span>

      {discount !== null && (
        <span className="relative shrink-0 text-center">
          <span
            className={`block rounded-lg px-2.5 py-1.5 text-lg font-extrabold leading-none ${tone.chip}`}
          >
            -{discount}%
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60">
            Save now
          </span>
        </span>
      )}

      <ArrowRight className="relative h-4 w-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />

      {/* Which of this strip's products is showing. */}
      {products.length > 1 && (
        <span className="absolute bottom-1.5 left-4 flex gap-1" aria-hidden>
          {products.map((p, i) => (
            <span
              key={p.id}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-white/80" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </span>
      )}
    </Link>
  );
}

export function HeroDealStrips({
  products,
  className = "",
}: {
  products: ProductListItem[];
  className?: string;
}) {
  // Genuine reductions first; top up with newest stock if there are not enough
  // to fill three strips, so the panel is never half empty.
  const discounted = products.filter((p) => discountPercent(p.price, p.compare_at_price) !== null);
  const pool = discounted.length >= 6 ? discounted : [...discounted, ...products].slice(0, 9);
  if (pool.length === 0) return null;

  // Deal the pool round-robin so each strip cycles a different set.
  const lanes: ProductListItem[][] = [[], [], []];
  pool.forEach((product, i) => lanes[i % 3].push(product));
  const filled = lanes.filter((lane) => lane.length > 0);

  return (
    <section
      className={`mt-4 hidden min-h-[16rem] flex-col gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 lg:flex ${className}`}
      aria-label="Current deals"
    >
      {filled.map((lane, i) => (
        <Strip key={i} products={lane} tone={TONES[i % TONES.length]} delay={i * STAGGER_MS} />
      ))}
    </section>
  );
}
