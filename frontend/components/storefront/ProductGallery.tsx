"use client";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import type { ProductImage } from "@/lib/types";

/**
 * The product's artwork on its detail page.
 *
 * The catalogue is illustrated rather than photographed for now, so there is a
 * single drawn image per product and no thumbnail strip to page through. When
 * real photography arrives, pass `preferPhoto` and the stored images come back
 * -- the strip returns with them.
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
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ProductThumb
        image={images[0]}
        name={name}
        categorySlug={categorySlug}
        sizes="(max-width: 768px) 100vw, 40vw"
        patternId="gallery-art"
        priority
        className="object-contain p-4"
      />
    </div>
  );
}
