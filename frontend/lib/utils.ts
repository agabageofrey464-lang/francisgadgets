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
