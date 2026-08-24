"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="mb-6 text-sm text-gray-500">Browse our catalog and add something you like.</p>
        <Link href="/products">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Your cart</h1>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.slug}`} className="text-sm font-medium text-ink-900 hover:underline">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-gray-500">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                className="px-2.5 py-1.5 text-gray-500 hover:text-ink-900"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                className="px-2.5 py-1.5 text-gray-500 hover:text-ink-900"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="w-24 text-right text-sm font-medium text-ink-900">
              {formatCurrency(item.price * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-500">Subtotal</span>
        <span className="text-xl font-bold text-ink-900">{formatCurrency(subtotal)}</span>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Link href="/products">
          <Button variant="outline">Continue shopping</Button>
        </Link>
        <Link href="/checkout">
          <Button size="lg">Proceed to checkout</Button>
        </Link>
      </div>
    </div>
  );
}
