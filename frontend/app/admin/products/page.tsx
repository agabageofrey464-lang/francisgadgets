"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import type { Page, ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<Page<ProductListItem> | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiFetch<Page<ProductListItem>>("/admin/products", {
        token: session.accessToken,
        params: { q, page_size: 50 },
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const remove = async (id: number) => {
    if (!session?.accessToken) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: "DELETE", token: session.accessToken });
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={load}>
          Search
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              data?.items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                      </div>
                      <span className="font-medium text-ink-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.is_active ? "success" : "default"}>{p.is_active ? "Active" : "Hidden"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(p.id)} className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
