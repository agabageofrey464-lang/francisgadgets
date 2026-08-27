"use client";

import Image from "next/image";
import { useState } from "react";

import { ProductIllustration } from "@/components/storefront/ProductIllustration";
import { SHOW_PRODUCT_PHOTOS } from "@/lib/site";
import type { ProductImage } from "@/lib/types";
import { isUnreachableImageUrl } from "@/lib/utils";

interface ProductThumbProps {
  image: ProductImage | undefined;
  name: string;
  categorySlug?: string | null;
  sizes: string;
  /** Unique per render site -- SVG ids are global. */
  patternId: string;
  priority?: boolean;
  className?: string;
  /**
   * Show the photograph instead of the drawn artwork. Defaults to the
   * catalogue-wide `SHOW_PRODUCT_PHOTOS` switch in lib/site.ts; pass it
   * explicitly to override for one product that does have a real photo.
   */
  preferPhoto?: boolean;
}

/** Narrowing wrapper around the shared URL rule. */
export function isReachablePhoto(image: ProductImage | undefined): image is ProductImage {
  return Boolean(image && !isUnreachableImageUrl(image.url));
}

/**
 * A product's picture: the house illustration by default, or the photograph
 * where one is trusted. Either way it is drawn inline or served from our own
 * origin -- nothing here can 404, rate-limit or hotlink-block.
 */
export function ProductThumb({
  image,
  name,
  categorySlug,
  sizes,
  patternId,
  priority,
  className,
  preferPhoto = SHOW_PRODUCT_PHOTOS,
}: ProductThumbProps) {
  // A URL can look fine and still fail (host down, 404, rate limit). Falling
  // back on error keeps a dead link from rendering as a broken-image icon.
  const [failed, setFailed] = useState(false);

  if (preferPhoto && isReachablePhoto(image) && !failed) {
    return (
      <Image
        src={image.url}
        alt={image.alt_text ?? name}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={className ?? "object-contain p-2 transition-transform duration-300 group-hover:scale-105"}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      <ProductIllustration
        name={name}
        categorySlug={categorySlug}
        patternId={patternId}
        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
