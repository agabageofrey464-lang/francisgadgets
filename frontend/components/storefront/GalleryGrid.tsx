"use client";

import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { galleryCategories, type GalleryItem } from "@/lib/gallery";

/**
 * Filterable photo grid with a lightbox.
 *
 * Filtering is client-side because the set is small and lives in a file --
 * a round trip to filter a dozen photos would be slower and worse.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = galleryCategories(items);
  const [active, setActive] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shown = active === "All" ? items : items.filter((item) => item.category === active);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (delta: number) =>
      setLightbox((current) =>
        current === null ? null : (current + delta + shown.length) % shown.length
      ),
    [shown.length]
  );

  // Arrow keys and Escape are how people expect a lightbox to work.
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the overlay.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <ImageIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-base font-bold text-ink-900">No photos yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          Photos of the shop, stock and completed installations will appear here.
        </p>
      </div>
    );
  }

  const openIndex = lightbox;
  const current = openIndex === null ? null : shown[openIndex];

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              onClick={() => {
                setActive(category);
                setLightbox(null);
              }}
              aria-pressed={active === category}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active === category
                  ? "bg-brand-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((item, i) => (
          <li key={item.src}>
            <button
              onClick={() => setLightbox(i)}
              className="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-colors hover:border-brand-300"
            >
              <span className="relative block aspect-[4/3] bg-gray-50">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="block px-3 py-2.5">
                <span className="line-clamp-2 text-xs font-medium leading-snug text-ink-900">
                  {item.caption}
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-400">{item.category}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 p-4 sm:p-8"
          onClick={close}
        >
          <div className="flex justify-end">
            <button
              onClick={close}
              aria-label="Close"
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {shown.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div
              className="relative h-full w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {shown.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
                className="absolute right-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm font-medium text-white">{current.caption}</p>
            <p className="mt-0.5 text-xs text-white/60">
              {openIndex + 1} of {shown.length} &middot; {current.category}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
