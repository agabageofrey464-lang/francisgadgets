"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { ProductAssurances } from "@/components/storefront/ProductAssurances";
import { ProductThumb } from "@/components/storefront/ProductThumb";
import { Stars } from "@/components/ui/Stars";
import { useCartStore } from "@/lib/cart-store";
import type { ProductListItem } from "@/lib/types";
import { discountPercent, formatCurrency, splitPrice } from "@/lib/utils";

/**
 * Marketplace-style product card: no box or border -- the photo sits directly
 * on the page, with title, rating, price and delivery line stacked beneath it.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0];
  const inStock = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 3;
  const discount = discountPercent(product.price, product.compare_at_price);
  const [currency, amount] = splitPrice(product.price);

  return (
    <div className="group flex h-full flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-lg bg-white"
      >
        <ProductThumb
          image={image}
          name={product.name}
          categorySlug={product.category?.slug}
          sizes="(max-width: 768px) 45vw, 220px"
          patternId={`card-dots-${product.id}`}
        />

        {inStock && discount !== null && (
          <span className="absolute left-1.5 top-1.5 rounded bg-accent-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <span className="absolute left-1.5 top-1.5 rounded bg-ink-900/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-2">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-3 text-sm leading-snug text-ink-800 hover:text-brand-700 hover:underline"
        >
          {product.name}
        </Link>

        <div className="mt-1 min-h-[1.125rem]">
          <Stars average={product.rating_average} count={product.review_count} />
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-xs font-semibold text-ink-900">{currency}</span>
          <span className="price text-lg font-bold leading-none text-ink-900">{amount}</span>
          {discount !== null && product.compare_at_price && (
            <span className="price text-xs text-gray-400 line-through">{formatCurrency(product.compare_at_price)}</span>
          )}
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {inStock ? (
            <>
              Get it <span className="font-semibold text-ink-900">same-day</span> in Kampala
            </>
          ) : (
            "Currently unavailable"
          )}
        </p>

        {lowStock && <p className="mt-0.5 text-xs font-medium text-accent-700">Only {product.stock_quantity} left</p>}

        <ProductAssurances variant="compact" className="mt-1.5" />

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
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {inStock && <ShoppingCart className="h-3.5 w-3.5" />}
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
