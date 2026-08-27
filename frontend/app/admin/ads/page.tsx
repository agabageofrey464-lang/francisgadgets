"use client";

import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import type { Ad, AdMediaType, AdPlacement } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "homepage_top", label: "Homepage - top banner" },
  { value: "homepage_mid", label: "Homepage - mid page" },
  { value: "product_list", label: "Product listing page" },
  { value: "sidebar", label: "Sidebar" },
];

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function emptyForm() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    advertiser_name: "",
    media_url: "",
    media_type: "image" as AdMediaType,
    link_url: "",
    placement: "homepage_top" as AdPlacement,
    starts_at: toLocalInput(now.toISOString()),
    ends_at: toLocalInput(in30Days.toISOString()),
    is_active: true,
  };
}

export default function AdminAdsPage() {
  const { data: session } = useSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      setAds(await apiFetch<Ad[]>("/admin/ads", { token: session.accessToken }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const startEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      advertiser_name: ad.advertiser_name,
      media_url: ad.media_url,
      media_type: ad.media_type,
      link_url: ad.link_url,
      placement: ad.placement,
      starts_at: toLocalInput(ad.starts_at),
      ends_at: toLocalInput(ad.ends_at),
      is_active: ad.is_active,
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const uploadMedia = async (file: File) => {
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
      setForm((f) => ({ ...f, media_url: url }));
    } catch {
      toast.error(form.media_type === "video" ? "Video upload failed" : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    if (!form.media_url) {
      toast.error(form.media_type === "video" ? "Upload an ad video first" : "Upload an ad image first");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        advertiser_name: form.advertiser_name,
        media_url: form.media_url,
        media_type: form.media_type,
        link_url: form.link_url,
        placement: form.placement,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        is_active: form.is_active,
      };
      if (editing) {
        await apiFetch(`/admin/ads/${editing.id}`, {
          method: "PATCH",
          token: session.accessToken,
          body: JSON.stringify(payload),
        });
        toast.success("Ad updated");
      } else {
        await apiFetch("/admin/ads", {
          method: "POST",
          token: session.accessToken,
          body: JSON.stringify(payload),
        });
        toast.success("Ad created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Failed to save ad");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!session?.accessToken) return;
    if (!confirm("Delete this ad?")) return;
    try {
      await apiFetch(`/admin/ads/${id}`, { method: "DELETE", token: session.accessToken });
      toast.success("Ad deleted");
      load();
    } catch {
      toast.error("Failed to delete ad");
    }
  };

  const toggleActive = async (ad: Ad) => {
    if (!session?.accessToken) return;
    try {
      await apiFetch(`/admin/ads/${ad.id}`, {
        method: "PATCH",
        token: session.accessToken,
        body: JSON.stringify({ is_active: !ad.is_active }),
      });
      load();
    } catch {
      toast.error("Failed to update ad");
    }
  };

  return (
    <div>
      <PageHeader title="Ads" description="Sell ad placements to other businesses across the storefront.">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          New ad
        </Button>
      </PageHeader>

      {showForm && (
        <Card className="mb-6 max-w-lg p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">{editing ? "Edit ad" : "New ad"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-ink-900">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="advertiser_name">Advertiser name</Label>
              <Input
                id="advertiser_name"
                required
                value={form.advertiser_name}
                onChange={(e) => setForm((f) => ({ ...f, advertiser_name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                type="url"
                required
                placeholder="https://example.com"
                value={form.link_url}
                onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="placement">Placement</Label>
              <select
                id="placement"
                value={form.placement}
                onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value as AdPlacement }))}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="starts_at">Starts</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  required
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="ends_at">Ends</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  required
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Media type</Label>
              <div className="flex gap-2">
                {(["image", "video"] as AdMediaType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, media_type: type, media_url: "" }))}
                    className={
                      form.media_type === type
                        ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                        : "rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-ink-900 hover:bg-gray-50"
                    }
                  >
                    {type === "image" ? "Image" : "Video"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Ad {form.media_type === "video" ? "video" : "image"}</Label>
              {form.media_type === "video" && (
                <p className="mb-2 text-xs text-gray-500">
                  Plays muted and on loop; visitors click it to unmute the sound.
                </p>
              )}
              <div className="flex items-center gap-3">
                {form.media_url &&
                  (form.media_type === "video" ? (
                    <video src={form.media_url} muted className="h-16 w-28 rounded-lg border border-gray-200 object-cover" />
                  ) : (
                    <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-gray-200">
                      <Image src={form.media_url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex h-16 w-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:border-brand-500 hover:text-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept={form.media_type === "video" ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMedia(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-900">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Active
            </label>

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
              <th className="px-4 py-3">Advertiser</th>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Impressions</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : ads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No ads yet.
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded border border-gray-200">
                        {ad.media_type === "video" ? (
                          <video src={ad.media_url} muted className="h-full w-full object-cover" />
                        ) : (
                          <Image src={ad.media_url} alt={ad.advertiser_name} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-ink-900">{ad.advertiser_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {PLACEMENTS.find((p) => p.value === ad.placement)?.label ?? ad.placement}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(ad.starts_at)} - {formatDate(ad.ends_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ad.impression_count}</td>
                  <td className="px-4 py-3 text-gray-500">{ad.click_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={
                        ad.is_active
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500"
                      }
                    >
                      {ad.is_active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(ad)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(ad.id)}
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
