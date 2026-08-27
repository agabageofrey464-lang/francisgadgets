import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  let product: Product;
  try {
    product = await apiFetch<Product>(`/admin/products/${id}`, { token: session?.accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div>
      <PageHeader title="Edit product" description="Update pricing, stock, images and description." />
      <ProductForm product={product} />
    </div>
  );
}
