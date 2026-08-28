import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { CONTACT } from "@/lib/social";

/**
 * Dark brand band that opens the homepage: who we are, what we stand behind,
 * and the two ways to start -- browse, or ask us.
 *
 * It carries the page's h1; the homepage has no other visible headline at that
 * level.
 *
 * Deliberately a slim band rather than a full-height hero: the shopping row
 * (category rail, carousel, offers) sits immediately beneath it and is what
 * people actually came for. It also carries no category tiles -- those would be
 * the third way to reach a category on one page, after the rail below it and
 * the "Shop by category" grid further down.
 */
export function BrandHero() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-11">
        <div className="flex max-w-3xl flex-col items-start gap-4">
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            New arrivals every week
          </span>

          <h1 className="text-2xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl">
            Your digital dreams, <span className="bg-brand-flag bg-clip-text text-transparent">delivered.</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
            Genuine phones, laptops, desktops, CCTV and security cameras, GPS trackers and accessories &mdash; sourced
            properly, priced fairly, and delivered anywhere in Uganda.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Ask us on WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent-500" />
              Genuine products
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-accent-500" />
              Fast delivery across Uganda
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
