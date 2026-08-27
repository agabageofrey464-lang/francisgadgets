"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stock_quantity > 0;

  return (
    <div className="mt-4 flex items-center gap-2.5">
      <div className="flex items-center rounded-lg border border-gray-300">
        <button
          className="px-3 py-2 text-gray-500 hover:text-ink-900"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="nums w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          className="px-3 py-2 text-gray-500 hover:text-ink-900"
          onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        disabled={!inStock}
        className="flex-1"
        size="lg"
        onClick={() => {
          addItem(
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: parseFloat(product.price),
              image: product.images[0]?.url ?? null,
              stockQuantity: product.stock_quantity,
            },
            quantity
          );
          toast.success(`${product.name} added to cart`);
        }}
      >
        {inStock ? "Add to cart" : "Out of stock"}
      </Button>
    </div>
  );
}
