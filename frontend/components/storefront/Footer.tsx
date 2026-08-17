import Image from "next/image";
import Link from "next/link";

import { SocialLinks } from "@/components/storefront/SocialLinks";
import { CONTACT } from "@/lib/social";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white">
      <div className="h-1 bg-brand-flag" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Image src="/logo.jpg" alt="Francis Gadgets Technologies" width={36} height={36} className="rounded-full" />
              <span className="font-semibold text-ink-900">Francis Gadgets Technologies</span>
            </div>
            <p className="mb-4 text-sm text-gray-500">Quality gadgets and electronics, delivered fast.</p>
            <SocialLinks />
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/products" className="hover:text-brand-600">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-600">
                  Track an order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>{CONTACT.email}</li>
              <li>Call {CONTACT.phone} &middot; WhatsApp {CONTACT.whatsapp}</li>
              <li>Kampala, Uganda</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Francis Gadgets Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
