"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DotGrid } from "@/components/ui/Pattern";
import type { ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Fallback banners for an empty catalogue. Real slides are built from stock, so
 * the hero always shows products the shop actually sells.
 */
const FALLBACK_SLIDES = [
  { src: "/AOV-SolarVu-Cameras_homepage-banner.jpg", alt: "Solar-powered Hikvision security cameras" },
  { src: "/Hikvision-Anti-corrosion-series-camera-pc-banner.jpg", alt: "Hikvision Anti-corrosion series cameras" },
  { src: "/Hikvision-ultra-series-PTZ-pc.jpg", alt: "Hikvision Ultra series PTZ camera" },
  { src: "/TandemVu-PTZ-pc.jpg", alt: "Hikvision TandemVu PTZ camera" },
  { src: "/deepinviewx-top-pc-banner.jpg", alt: "Hikvision DeepinViewX cameras" },
  { src: "/Deepinview-banner.png", alt: "Hikvision DeepinView cameras" },
];

const INTERVAL_MS = 6000;

function discountPercent(price: string, compareAt: string | null): number | null {
  if (!compareAt) return null;
  const now = parseFloat(price);
  const was = parseFloat(compareAt);
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= now) return null;
  return Math.round(((was - now) / was) * 100);
}

export function HomeMarquee({ products = [] }: { products?: ProductListItem[] }) {
  // Every product has artwork now (drawn, not photographed), so nothing is
  // excluded for lacking a picture.
  const slides = products.slice(0, 6);
  const count = slides.length > 0 ? slides.length : FALLBACK_SLIDES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  if (slides.length === 0) {
    return (
      <Link
        href="/products?category=cctv-security-cameras"
        className="relative block aspect-[1920/700] w-full overflow-hidden rounded-xl bg-ink-900"
      >
        {FALLBACK_SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <Dots count={FALLBACK_SLIDES.length} index={index} onSelect={setIndex} />
      </Link>
    );
  }

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-ink-900 sm:aspect-[1920/700]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((product, i) => {
        const discount = discountPercent(product.price, product.compare_at_price);

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 text-white/[0.06]" aria-hidden>
              <DotGrid id={`hero-dots-${product.id}`} className="h-full w-full" />
            </div>
            <div
              className="pointer-events-none absolute -left-20 top-0 h-full w-2/3 rounded-full bg-brand-600/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 right-0 h-2/3 w-1/2 rounded-full bg-accent-500/15 blur-3xl"
              aria-hidden
            />

            <div className="relative grid h-full grid-cols-[1.1fr_1fr] items-center gap-2 px-5 sm:px-8 md:px-12">
              <div className="min-w-0">
                {product.category && (
                  <span className="inline-block rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-200 sm:text-xs">
                    {product.category.name}
                  </span>
                )}

                {/* Headlines are live text, not baked into a bitmap -- crisp at any
                    display density, including 4K, and always in sync with stock. */}
                <h2 className="mt-2 line-clamp-2 text-base font-extrabold leading-tight tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
                  {product.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-3">
                  <span className="text-sm font-bold text-white sm:text-xl md:text-2xl">
                    {formatCurrency(product.price)}
                  </span>
                  {discount !== null && product.compare_at_price && (
                    <>
                      <span className="text-[11px] text-gray-400 line-through sm:text-sm">
                        {formatCurrency(product.compare_at_price)}
                      </span>
                      <span className="rounded bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white sm:mt-5 sm:px-5 sm:py-2.5 sm:text-sm">
                  Shop now
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>

              <div className="relative h-[78%] w-full">
                <ProductThumb
                  image={product.images[0]}
                  name={product.name}
                  categorySlug={product.category?.slug}
                  patternId={`hero-art-${product.id}`}
                  priority={i === 0}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 420px"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </Link>
        );
      })}

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50 sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50 sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <Dots count={count} index={index} onSelect={setIndex} />
    </div>
  );
}

function Dots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.preventDefault();
            onSelect(i);
          }}
          aria-label={`Go to slide ${i + 1}`}
          className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
        />
      ))}
    </div>
  );
}
