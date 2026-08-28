import { Camera, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { GalleryGrid } from "@/components/storefront/GalleryGrid";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { GALLERY_ITEMS } from "@/lib/gallery";
import { CONTACT } from "@/lib/social";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos of the equipment we supply and fit -- CCTV and security systems, stock and installations, from Francis Gadgets Technologies in Kampala.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "Gallery" }]} />

      <div className="mt-4 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Camera className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">Gallery</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            The equipment we supply and fit, and the work we do around Kampala.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <GalleryGrid items={GALLERY_ITEMS} />
      </div>

      {/* A gallery's job is to start a conversation, so end on one. */}
      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 text-center sm:p-8">
        <h2 className="text-lg font-bold text-ink-900">Want something like this fitted?</h2>
        <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-gray-500">
          Tell us the site and what you need covered. We will quote the kit and the installation
          together, so there is no surprise on the day.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Ask for a quote
          </a>
          <Link
            href="/products?category=cctv-security-cameras"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Browse CCTV &amp; security
          </Link>
        </div>
      </div>

      <PromiseStrip className="mt-8" />
    </div>
  );
}
