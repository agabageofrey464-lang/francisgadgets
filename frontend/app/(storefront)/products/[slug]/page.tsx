import { MessageCircle, Package, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { FestivalStrip } from "@/components/storefront/FestivalStrip";
import { ProductActions } from "@/components/storefront/ProductActions";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import { Stars } from "@/components/ui/Stars";
import { ApiError, apiFetch } from "@/lib/api";
import { CONTACT } from "@/lib/social";
import type { Product } from "@/lib/types";
import { discountPercent, formatCurrency, splitPrice } from "@/lib/utils";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const description =
    product.description?.slice(0, 160) ?? `Buy ${product.name} in Uganda -- ${formatCurrency(product.price)}.`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `/products/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** The reassurances that belong next to the buy button, not in the page footer. */
const BUY_BOX_ASSURANCES = [
  { icon: Truck, text: "Same-day delivery within Kampala, countrywide by courier." },
  { icon: ShieldCheck, text: "Genuine stock from authorised channels." },
  { icon: RotateCcw, text: "Faulty on arrival? We replace it." },
];

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const inStock = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 3;
  const discount = discountPercent(product.price, product.compare_at_price);
  const [currency, amount] = splitPrice(product.price);
  const saving =
    product.compare_at_price !== null
      ? parseFloat(product.compare_at_price) - parseFloat(product.price)
      : 0;

  const whatsappHref = `${CONTACT.whatsappLink}?text=${encodeURIComponent(
    `Hello Francis Gadgets, I'm interested in ${product.name} (${formatCurrency(product.price)}).`
  )}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <FestivalStrip layout="banner" />

      <Breadcrumbs
        className="mt-4"
        trail={[
          { label: "Shop", href: "/products" },
          ...(product.category
            ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      {/* Gallery and the facts sit side by side; the buy box is its own column on
          desktop so the price and the add-to-cart stay in view while reading. */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6 md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} categorySlug={product.category?.slug} />

          <div className="min-w-0">
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-2 text-xl font-bold leading-snug text-ink-900 sm:text-2xl">{product.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Stars average={product.rating_average} count={product.review_count} />
              {product.sku && <span className="text-xs text-gray-400">SKU {product.sku}</span>}
            </div>

            {product.description && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h2 className="text-sm font-semibold text-ink-900">About this item</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold text-ink-900">Need a hand?</h2>
              <p className="mt-1 text-sm text-gray-600">
                Call{" "}
                <a href={`tel:${CONTACT.phone}`} className="font-medium text-brand-700 hover:underline">
                  {CONTACT.phone}
                </a>{" "}
                or message us on WhatsApp and we will confirm stock before you pay.
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-ink-900">{currency}</span>
              <span className="price text-3xl font-bold leading-none text-ink-900">{amount}</span>
            </div>

            {discount !== null && product.compare_at_price && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="price text-sm text-gray-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
                <span className="rounded bg-accent-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  -{discount}%
                </span>
                <span className="text-xs font-medium text-accent-700">
                  You save {formatCurrency(saving)}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm">
              <Package className={`h-4 w-4 ${inStock ? "text-emerald-600" : "text-gray-400"}`} />
              {inStock ? (
                <span className="font-medium text-emerald-700">
                  In stock &middot; {product.stock_quantity} available
                </span>
              ) : (
                <span className="font-medium text-gray-500">Out of stock</span>
              )}
            </div>

            {lowStock && (
              <p className="mt-1 text-xs font-semibold text-accent-700">
                Only {product.stock_quantity} left -- order soon.
              </p>
            )}

            <ProductActions product={product} />

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" />
              Order on WhatsApp
            </a>

            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {BUY_BOX_ASSURANCES.map((item) => (
                <li key={item.text} className="flex gap-2 text-xs leading-relaxed text-gray-600">
                  <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <PromiseStrip className="mt-8" />

      <div className="mt-10 border-t border-gray-100 pt-8">
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}
