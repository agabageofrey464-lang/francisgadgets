"use client";

import { Trash2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

interface Props {
  product?: Product;
}

export function ProductForm({ product }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    compare_at_price: product?.compare_at_price ?? "",
    sku: product?.sku ?? "",
    stock_quantity: product?.stock_quantity ?? 0,
    category_id: product?.category_id ?? "",
    is_active: product?.is_active ?? true,
  });
  const [images, setImages] = useState(product?.images ?? []);

  useEffect(() => {
    apiFetch<Category[]>("/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const uploadImage = async (file: File) => {
    if (!session?.accessToken) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await apiFetch<{ url: string }>("/uploads/product-image", {
        method: "POST",
        token: session.accessToken,
        body: formData,
      });

      if (product) {
        const updated = await apiFetch<Product>(`/admin/products/${product.id}/images?url=${encodeURIComponent(url)}`, {
          method: "POST",
          token: session.accessToken,
        });
        setImages(updated.images);
      } else {
        setImages((imgs) => [...imgs, { id: -imgs.length - 1, url, alt_text: null, position: imgs.length }]);
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId: number) => {
    if (!session?.accessToken) return;
    if (product && imageId > 0) {
      const updated = await apiFetch<Product>(`/admin/products/${product.id}/images/${imageId}`, {
        method: "DELETE",
        token: session.accessToken,
      });
      setImages(updated.images);
    } else {
      setImages((imgs) => imgs.filter((i) => i.id !== imageId));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        sku: form.sku || null,
        stock_quantity: Number(form.stock_quantity),
        category_id: form.category_id ? Number(form.category_id) : null,
        is_active: form.is_active,
      };

      if (product) {
        await apiFetch(`/admin/products/${product.id}`, {
          method: "PATCH",
          token: session.accessToken,
          body: JSON.stringify(payload),
        });
        toast.success("Product updated");
      } else {
        const created = await apiFetch<Product>("/admin/products", {
          method: "POST",
          token: session.accessToken,
          body: JSON.stringify(payload),
        });
        for (const img of images) {
          await apiFetch(`/admin/products/${created.id}/images?url=${encodeURIComponent(img.url)}`, {
            method: "POST",
            token: session.accessToken,
          });
        }
        toast.success("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={form.name} onChange={update("name")} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} value={form.description ?? ""} onChange={update("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (UGX)</Label>
          <Input id="price" type="number" min={0} step="0.01" required value={form.price} onChange={update("price")} />
        </div>
        <div>
          <Label htmlFor="compare_at_price">Compare-at price (optional)</Label>
          <Input
            id="compare_at_price"
            type="number"
            min={0}
            step="0.01"
            value={form.compare_at_price ?? ""}
            onChange={update("compare_at_price")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={form.sku ?? ""} onChange={update("sku")} />
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            min={0}
            required
            value={form.stock_quantity}
            onChange={update("stock_quantity")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category_id">Category</Label>
        <select
          id="category_id"
          value={form.category_id}
          onChange={update("category_id") as any}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-900">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
        />
        Visible in storefront
      </label>

      <div>
        <Label>Images</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
              <Image src={img.url} alt={img.alt_text ?? ""} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-brand-500 hover:text-brand-600"
          >
            <Upload className="h-5 w-5" />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <Button type="submit" isLoading={saving}>
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
