"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await apiFetch<Category[]>("/categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "" });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/admin/categories/${editing.id}`, {
          method: "PATCH",
          token: session.accessToken,
          body: JSON.stringify({ name: form.name, description: form.description || null }),
        });
        toast.success("Category updated");
      } else {
        await apiFetch("/admin/categories", {
          method: "POST",
          token: session.accessToken,
          body: JSON.stringify({ name: form.name, description: form.description || null }),
        });
        toast.success("Category created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!session?.accessToken) return;
    if (!confirm("Delete this category?")) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: "DELETE", token: session.accessToken });
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div>
      <PageHeader title="Categories" description="How products are grouped across the storefront.">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </PageHeader>

      {showForm && (
        <Card className="mb-6 max-w-lg p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">{editing ? "Edit category" : "New category"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-ink-900">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <Button type="submit" size="sm" isLoading={saving}>
              Save
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.description ?? "--"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(c)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
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
