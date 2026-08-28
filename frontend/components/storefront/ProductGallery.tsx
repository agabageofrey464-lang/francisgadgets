"use client";

import Image from "next/image";
import { useState } from "react";

import { ProductThumb, isReachablePhoto } from "@/components/storefront/ProductThumb";
import { SHOW_PRODUCT_PHOTOS } from "@/lib/site";
import type { ProductImage } from "@/lib/types";

/**
 * The product's artwork on its detail page.
 *
 * Shows the photograph, falling back to the drawn illustration when a product
 * has no usable one. The thumbnail strip only appears where there is more than
 * one photo to choose between -- a strip of one is just clutter.
 */
export function ProductGallery({
  images,
  name,
  categorySlug,
}: {
  images: ProductImage[];
  name: string;
  categorySlug?: string | null;
}) {
  const usable = SHOW_PRODUCT_PHOTOS ? images.filter(isReachablePhoto) : [];
  const [active, setActive] = useState(0);
  const current = usable[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
        <ProductThumb
          image={current}
          name={name}
          categorySlug={categorySlug}
          sizes="(max-width: 768px) 100vw, 40vw"
          patternId="gallery-art"
          priority
          className="object-contain p-4"
        />
      </div>

      {usable.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {usable.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${usable.length}`}
              aria-pressed={i === active}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-white transition-colors ${
                i === active ? "border-brand-600 ring-1 ring-brand-600" : "border-gray-200 hover:border-brand-300"
              }`}
            >
              <Image src={img.url} alt={img.alt_text ?? name} fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
