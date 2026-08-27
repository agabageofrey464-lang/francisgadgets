import { ChevronRight, Headphones, PackageSearch, ShoppingBag, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";

const SHORTCUTS: { href: string; icon: LucideIcon; title: string; body: string }[] = [
  { href: "/orders", icon: ShoppingBag, title: "My orders", body: "Everything you have bought from us." },
  { href: "/track-order", icon: PackageSearch, title: "Track an order", body: "See where a delivery has reached." },
  { href: "/contact", icon: Headphones, title: "Get help", body: "Warranty, returns or product advice." },
];

/** First letters of the name, for the avatar disc. */
function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AccountPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "My account" }]} />
      <h1 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">My account</h1>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
            {initials(user?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink-900">{user?.name ?? "--"}</p>
            <p className="truncate text-sm text-gray-500">{user?.email ?? "--"}</p>
          </div>
          {user?.role && (
            <Badge tone={user.role === "admin" ? "info" : "default"} className="ml-auto shrink-0 capitalize">
              {user.role}
            </Badge>
          )}
        </div>

      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-300"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <shortcut.icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-ink-900 group-hover:text-brand-700">
              {shortcut.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{shortcut.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
