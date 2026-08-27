"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductListItem } from "@/lib/types";

interface ProductRailProps {
  title: string;
  /** Small line under the title, e.g. what makes this row worth scanning. */
  subtitle?: string;
  href: string;
  products: ProductListItem[];
  /** Solid accent bar beside the title, matching the festival strip's flat-colour treatment. */
  accent?: string;
}

/**
 * A marketplace-style carousel: cards scroll sideways with snap points, and
 * chevrons appear on pointer devices once there is something to scroll to.
 */
export function ProductRail({ title, subtitle, href, products, accent = "bg-brand-600" }: ProductRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;

    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, products.length]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-8 w-1 shrink-0 rounded-full ${accent}`} aria-hidden />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-ink-900 sm:text-lg">{title}</h2>
            {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <Link href={href} className="shrink-0 text-sm font-medium text-brand-700 hover:underline">
          See all
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scroller}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[9.5rem] shrink-0 snap-start sm:w-[11rem] lg:w-[12.5rem]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {!atStart && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} left`}
            className="absolute -left-3 top-[7rem] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-ink-900 shadow-md transition-colors hover:bg-gray-50 md:grid"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {!atEnd && (
          <button
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} right`}
            className="absolute -right-3 top-[7rem] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-ink-900 shadow-md transition-colors hover:bg-gray-50 md:grid"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
