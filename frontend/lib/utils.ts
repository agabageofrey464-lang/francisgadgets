import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatCurrency(amount: string | number, currency: string = "UGX"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** "UGX 1,250,000" -> ["UGX", "1,250,000"] so the currency can sit small beside a large figure. */
export function splitPrice(value: string | number, currency: string = "UGX"): [string, string] {
  const formatted = formatCurrency(value, currency);
  const match = formatted.match(/^([^\d]*)(.*)$/);
  return match ? [match[1].trim(), match[2].trim()] : ["", formatted];
}

/**
 * Percent saved against the struck-through price, or null when there is no
 * genuine saving to advertise (missing, equal or lower "was" price).
 */
export function discountPercent(price: string | number, compareAt: string | number | null): number | null {
  if (compareAt === null) return null;
  const now = typeof price === "string" ? parseFloat(price) : price;
  const was = typeof compareAt === "string" ? parseFloat(compareAt) : compareAt;
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= now) return null;
  return Math.round(((was - now) / was) * 100);
}

/**
 * URLs that will not render a real product photo.
 *
 * - `placehold.co` is a generated stand-in, not a photo of the product.
 * - wikimedia's `Special:FilePath` is a *redirect* endpoint: two hops per image,
 *   HTTP 429 under load, and 403 for any client without a policy-compliant
 *   User-Agent (Next's image optimizer included). The catalogue now stores the
 *   direct `upload.wikimedia.org` CDN URL instead -- see
 *   backend/scripts/resolve_image_urls.py -- but this guard stays so a stray
 *   redirect URL degrades to the branded tile rather than a broken box.
 */
export function isUnreachableImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes("placehold") || url.includes("commons.wikimedia.org/wiki/Special:FilePath");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-UG", { year: "numeric", month: "short", day: "numeric" });
}

export function orderStatusTone(status: string): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "paid":
    case "delivered":
      return "success";
    case "processing":
    case "shipped":
      return "info";
    case "pending":
      return "warning";
    case "cancelled":
    case "refunded":
      return "danger";
    default:
      return "default";
  }
}
