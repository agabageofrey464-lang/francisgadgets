import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PaymentMethods } from "@/components/storefront/PaymentMethods";
import { SocialLinks } from "@/components/storefront/SocialLinks";
import { UgandaFlagIcon } from "@/components/storefront/UgandaFlagIcon";
import { Diagonals } from "@/components/ui/Pattern";
import { apiFetch } from "@/lib/api";
import { CONTACT } from "@/lib/social";
import type { Category } from "@/lib/types";

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact & Support" },
  { href: "/track-order", label: "Track an order" },
  { href: "/orders", label: "My orders" },
];

async function getFooterCategories(): Promise<Category[]> {
  try {
    const categories = await apiFetch<Category[]>("/categories");
    return categories
      .filter((c) => c.product_count > 0)
      .sort((a, b) => b.product_count - a.product_count)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function Footer() {
  const categories = await getFooterCategories();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-brand-100 bg-white">
      <div className="h-1 bg-brand-flag" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 text-brand-600/[0.05]" aria-hidden>
        <Diagonals id="footer-lines" className="h-full w-full" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Image
                src="/brand/logo.jpg"
                alt="Francis Gadgets Technologies"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-semibold text-ink-900">Francis Gadgets Technologies</span>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Genuine phones, laptops, CCTV and accessories &mdash; delivered anywhere in Uganda.
            </p>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Follow us</p>
            <SocialLinks />
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className="hover:text-brand-600">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="font-medium text-brand-600 hover:underline">
                  All products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Get in touch</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-600">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="min-w-0 break-all">{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 hover:text-brand-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                Kampala, Uganda
              </li>
            </ul>

            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp {CONTACT.whatsapp}
            </a>
          </div>
        </div>

        {/* Pay-by row: mobile money first, which is how most orders here are paid. */}
        <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">We accept</p>
            <PaymentMethods />
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-gray-400">
            Card and mobile money payments are processed securely by Paystack and Flutterwave. We never see
            your card details.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Francis Gadgets Technologies. All rights reserved.</p>
          <span className="flex items-center gap-1.5">
            <UgandaFlagIcon className="h-3 w-[18px] shrink-0 rounded-[2px]" />
            Uganda
          </span>
        </div>
      </div>
    </footer>
  );
}
