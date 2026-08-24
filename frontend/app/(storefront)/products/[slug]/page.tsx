import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/storefront/ProductActions";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import { Badge } from "@/components/ui/Card";
import { ApiError, apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.category && <p className="mb-1 text-sm text-gray-400">{product.category.name}</p>}
          <h1 className="text-2xl font-bold text-ink-900">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink-900">{formatCurrency(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-base text-gray-400 line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>

          <div className="mt-3">
            {product.stock_quantity > 0 ? (
              <Badge tone="success">In stock ({product.stock_quantity} available)</Badge>
            ) : (
              <Badge tone="danger">Out of stock</Badge>
            )}
          </div>

          {product.description && <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{product.description}</p>}

          <ProductActions product={product} />
        </div>
      </div>

      <div className="mt-16 border-t border-gray-100 pt-8">
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}
