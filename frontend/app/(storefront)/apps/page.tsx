import {
  Bell,
  Globe,
  MessageCircle,
  PackageSearch,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { CONTACT } from "@/lib/social";

export const metadata: Metadata = {
  title: "Our app",
  description:
    "The Francis Gadgets Technologies mobile app is on the way. In the meantime, shop the full catalogue on the web or order on WhatsApp.",
  alternates: { canonical: "/apps" },
};

/** What the app will add over the website. Written as promises we can keep. */
const PLANNED: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Bell,
    title: "Price drop alerts",
    body: "Get told when something you are watching goes on offer.",
  },
  {
    icon: PackageSearch,
    title: "Delivery tracking",
    body: "Follow your order from our shelf to your door, without asking.",
  },
  {
    icon: Wallet,
    title: "Faster mobile money",
    body: "Pay with MTN or Airtel money in a couple of taps.",
  },
];

/** How to shop today -- the part of this page that is actually usable now. */
const TODAY: { icon: LucideIcon; title: string; body: string; href: string; external?: boolean }[] =
  [
    {
      icon: Globe,
      title: "Shop the website",
      body: "The full catalogue, on any phone browser. Nothing to install.",
      href: "/products",
    },
    {
      icon: MessageCircle,
      title: "Order on WhatsApp",
      body: `Send us what you need on ${CONTACT.whatsapp} and we will sort it.`,
      href: CONTACT.whatsappLink,
      external: true,
    },
    {
      icon: PackageSearch,
      title: "Track an order",
      body: "Check where a delivery has reached, with just your order number.",
      href: "/track-order",
    },
  ];

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "Our app" }]} />

      {/* Says plainly that there is no app yet. Better than a dead download
          button that teaches shoppers not to trust the page. */}
      <section className="mt-4 overflow-hidden rounded-xl bg-ink-900">
        <div className="h-1 bg-brand-flag" aria-hidden />
        <div className="px-5 py-10 text-center sm:px-8 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400/15 px-3 py-1 text-xs font-semibold text-accent-300">
            <Smartphone className="h-3.5 w-3.5" />
            In development
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Our app is on the way
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-300">
            We are building a Francis Gadgets app for Android and iOS. Until it lands, everything
            you need is already here on the website &mdash; and you can always reach a real person
            on WhatsApp.
          </p>
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Tell us to notify you
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink-900">How to shop right now</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TODAY.map((item) => {
            const inner = (
              <>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <item.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="mt-3 block text-sm font-semibold text-ink-900">{item.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">{item.body}</span>
              </>
            );
            const className =
              "group block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300";

            return item.external ? (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link key={item.title} href={item.href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink-900">What the app will add</h2>
        <p className="mt-1 text-sm text-gray-500">
          Things a browser cannot do well. Everything else already works on the site.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PLANNED.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-gray-500">
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <PromiseStrip className="mt-10" />
    </div>
  );
}
