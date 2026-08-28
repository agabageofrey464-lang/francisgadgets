import { ArrowRight, Cctv, Headphones, Laptop, ShieldCheck, Smartphone, Truck } from "lucide-react";
import Link from "next/link";

import { CONTACT } from "@/lib/social";

/**
 * Dark brand statement panel that closes the homepage: who we are, what we
 * stand behind, and a way into the four categories people arrive looking for.
 *
 * It sits below the product rails rather than above them -- a shopper who has
 * scrolled that far has seen the stock and is deciding whether to trust the
 * shop, which is exactly what this answers. Its heading is an h2 because the
 * page's h1 is the document title at the top.
 */
const HERO_TILES = [
  { href: "/products?category=smartphones", label: "Phones", icon: Smartphone },
  { href: "/products?category=laptops", label: "Laptops", icon: Laptop },
  { href: "/products?category=cctv-security-cameras", label: "CCTV", icon: Cctv },
  { href: "/products?category=audio", label: "Audio", icon: Headphones },
];

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

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            New arrivals every week
          </span>

          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Your digital dreams, <span className="bg-brand-flag bg-clip-text text-transparent">delivered.</span>
          </h2>

          <p className="max-w-xl text-base text-gray-300 sm:text-lg">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {HERO_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex flex-col gap-3 rounded-xl bg-white/5 p-5 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10 hover:ring-brand-400/40"
            >
              <tile.icon className="h-6 w-6 text-accent-500" />
              <span className="flex items-center justify-between text-sm font-semibold text-white">
                {tile.label}
                <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
