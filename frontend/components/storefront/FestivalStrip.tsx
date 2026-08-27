"use client";

import { ArrowRight, MessageCircle, Percent, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CONTACT } from "@/lib/social";

interface Offer {
  title: string;
  body: string;
  href: string;
  icon: LucideIcon;
  /** Solid colour per offer -- flat fills, no gradients. */
  color: string;
}

const OFFERS: Offer[] = [
  {
    title: "CCTV installation",
    body: "UGX 50,000 per camera, fitted by our own technicians.",
    href: "/products?category=installation-services",
    icon: Wrench,
    color: "bg-brand-700",
  },
  {
    title: "GPS tracker fitting",
    body: "UGX 30,000 including activation on your vehicle.",
    href: "/products?category=gps-trackers",
    icon: Percent,
    color: "bg-accent-600",
  },
  {
    title: "Same-day in Kampala",
    body: "Order before afternoon and get it the same day.",
    href: "/products",
    icon: Truck,
    color: "bg-ink-800",
  },
  {
    title: "Genuine stock only",
    body: "Authorised channels, warranty where offered.",
    href: "/about",
    icon: ShieldCheck,
    color: "bg-brand-900",
  },
];

const ROTATE_MS = 4500;

/** Shared by every layout, so the rotation reads the same wherever it is placed. */
function useRotatingOffer(): [Offer, number] {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % OFFERS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return [OFFERS[index], index];
}

function Dots({ index }: { index: number }) {
  return (
    <span className="flex gap-1">
      {OFFERS.map((offer, i) => (
        <span
          key={offer.title}
          className={`h-1 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1 bg-white/40"}`}
        />
      ))}
    </span>
  );
}

function WhatsAppTile() {
  return (
    <a
      href={CONTACT.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-300"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
        <MessageCircle className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-900">Order on WhatsApp</span>
        <span className="block truncate text-[11px] text-gray-400">{CONTACT.whatsapp}</span>
      </span>
    </a>
  );
}

function TrackOrderTile() {
  return (
    <Link
      href="/track-order"
      className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-300"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Truck className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-900">Track an order</span>
        <span className="block truncate text-[11px] text-gray-400">Check where your delivery is</span>
      </span>
    </Link>
  );
}

export type FestivalStripLayout = "column" | "row" | "banner";

/**
 * The shop's standing offers, rotating one at a time.
 *
 * - `column` -- tall rail beside the hero (homepage xl sidebar)
 * - `row`    -- three across, for wide space above the fold
 * - `banner` -- one slim full-width band, for the top of inner pages where a
 *               tall rail would push the actual content below the fold
 */
export function FestivalStrip({ layout = "column" }: { layout?: FestivalStripLayout }) {
  const [offer, index] = useRotatingOffer();

  if (layout === "banner") {
    return (
      <aside
        className="flex items-stretch gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200"
        aria-label="Offers"
      >
        <Link
          href={offer.href}
          className={`group flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-white transition-colors duration-500 ${offer.color}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
            <offer.icon className="h-[18px] w-[18px]" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold leading-tight">{offer.title}</span>
            <span className="hidden truncate text-xs text-white/80 sm:block">{offer.body}</span>
          </span>

          <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold sm:inline-flex">
            See more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>

          <span className="shrink-0">
            <Dots index={index} />
          </span>
        </Link>

        <a
          href={CONTACT.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-2 bg-white px-4 text-xs font-semibold text-ink-900 transition-colors hover:bg-brand-50 md:flex"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          Order on WhatsApp
        </a>
      </aside>
    );
  }

  const isRow = layout === "row";

  return (
    <aside className={isRow ? "grid gap-3 sm:grid-cols-3" : "flex flex-col gap-3"} aria-label="Offers">
      {/* Rotating offer -- the colour is part of the offer, so the whole panel changes with it. */}
      <Link
        href={offer.href}
        className={`group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl p-4 text-white transition-colors duration-500 ${isRow ? "" : "flex-1"} ${offer.color}`}
      >
        <div>
          <offer.icon className="mb-2 h-5 w-5 text-white/80" />
          <p className="text-sm font-bold leading-tight">{offer.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">{offer.body}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            See more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <Dots index={index} />
        </div>
      </Link>

      <WhatsAppTile />
      <TrackOrderTile />
    </aside>
  );
}
