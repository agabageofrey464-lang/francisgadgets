"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Card";
import { useCartStore } from "@/lib/cart-store";
import type { ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductListItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0];
  const inStock = product.stock_quantity > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-gray-50">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-gray-400">No image</div>
        )}
        {!inStock && (
          <Badge tone="danger" className="absolute left-2 top-2">
            Out of stock
          </Badge>
        )}
        {product.compare_at_price && (
          <Badge tone="success" className="absolute right-2 top-2">
            Sale
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && <span className="text-xs text-gray-400">{product.category.name}</span>}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-ink-900">
          {product.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink-900">{formatCurrency(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compare_at_price)}</span>
          )}
        </div>
        <button
          disabled={!inStock}
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: parseFloat(product.price),
              image: image?.url ?? null,
              stockQuantity: product.stock_quantity,
            });
            toast.success(`${product.name} added to cart`);
          }}
          className="mt-3 rounded-lg bg-ink-900 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
