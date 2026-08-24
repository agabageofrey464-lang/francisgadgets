import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { Category, Page, ProductListItem } from "@/lib/types";

async function getAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  for (;;) {
    const result = await apiFetch<Page<ProductListItem>>("/products", {
      params: { page, page_size: 100 },
    }).catch(() => null);
    if (!result || result.items.length === 0) break;
    slugs.push(...result.items.map((p) => p.slug));
    if (page >= result.pages) break;
    page += 1;
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([
    getAllProductSlugs(),
    apiFetch<Category[]>("/categories").catch(() => [] as Category[]),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/track-order`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products?category=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
