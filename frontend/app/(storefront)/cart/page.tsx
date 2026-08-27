"use client";

import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { FestivalStrip } from "@/components/storefront/FestivalStrip";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { Button } from "@/components/ui/Button";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart-store";
import { formatCurrency, isUnreachableImageUrl, splitPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The cart lives in localStorage, so the first server render has nothing to
  // show -- rendering it would flash an empty cart at someone who has items.
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <FestivalStrip layout="banner" />

        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink-900">Your cart is empty</h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Browse phones, laptops, CCTV kits and accessories -- add something you like and it will show up here.
          </p>
          <Link href="/products" className="mt-6 inline-block">
            <Button size="lg">Start shopping</Button>
          </Link>
        </div>

        <PromiseStrip className="mt-6" />
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const itemCount = cartCount(items);
  const [currency, amount] = splitPrice(subtotal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <FestivalStrip layout="banner" />

      <h1 className="mt-5 text-xl font-bold text-ink-900 sm:text-2xl">
        Your cart{" "}
        <span className="text-base font-medium text-gray-400">
          ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {items.map((item) => {
            const atStockCeiling = item.quantity >= item.stockQuantity;

            return (
              <div key={item.productId} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-24 sm:w-24"
                >
                  {isUnreachableImageUrl(item.image) ? (
                    <span className="grid h-full w-full place-items-center text-brand-300">
                      <ShoppingBag className="h-6 w-6" />
                    </span>
                  ) : (
                    <Image src={item.image!} alt={item.name} fill sizes="96px" className="object-contain p-1" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium leading-snug text-ink-900 hover:text-brand-700 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">{formatCurrency(item.price)} each</p>

                  {atStockCeiling && (
                    <p className="mt-0.5 text-xs font-medium text-accent-700">
                      Only {item.stockQuantity} in stock
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2.5">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        className="px-2.5 py-1.5 text-gray-500 hover:text-ink-900 disabled:opacity-40"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="nums w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="px-2.5 py-1.5 text-gray-500 hover:text-ink-900 disabled:opacity-40"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        disabled={atStockCeiling}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                <span className="price shrink-0 text-right text-sm font-bold text-ink-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900">Order summary</h2>

            <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-ink-900">{currency}</span>
                <span className="price text-xl font-bold leading-none text-ink-900">{amount}</span>
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Delivery is calculated at checkout once we have your address.
            </p>

            <Link href="/checkout" className="mt-4 block">
              <Button size="lg" className="w-full">
                Proceed to checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/products" className="mt-2 block">
              <Button variant="outline" className="w-full">
                Continue shopping
              </Button>
            </Link>

            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <li className="flex gap-2 text-xs leading-relaxed text-gray-600">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                Same-day delivery within Kampala, countrywide by courier.
              </li>
              <li className="flex gap-2 text-xs leading-relaxed text-gray-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                Pay by mobile money, card or bank transfer.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <PromiseStrip className="mt-8" />
    </div>
  );
}
