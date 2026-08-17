"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {current ? (
          <Image src={current.url} alt={current.alt_text ?? name} fill className="object-cover" priority />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-gray-400">No image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border ${
                i === active ? "border-brand-600" : "border-gray-200"
              }`}
            >
              <Image src={img.url} alt={img.alt_text ?? name} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
