import { Headphones, MessageCircle, Phone, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PromiseStrip } from "@/components/storefront/PromiseStrip";
import { CONTACT } from "@/lib/social";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Francis Gadgets Technologies is a Kampala-based electronics retailer supplying phones, laptops, CCTV and accessories across Uganda.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Genuine products",
    description: "Every phone, laptop, camera and accessory we sell is sourced from authorised suppliers.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    description: "We dispatch orders quickly and keep you updated from checkout to your doorstep.",
  },
  {
    icon: Wrench,
    title: "Setup & support",
    description: "From CCTV installation to device setup, our team helps you get the most out of your purchase.",
  },
  {
    icon: Headphones,
    title: "Real customer care",
    description: "Reach a real person for order questions, warranty claims, or product advice.",
  },
];

/** Numbers a shopper can weigh us by, kept to ones we can stand behind. */
const FACTS = [
  { figure: "Kampala", label: "Where we are based" },
  { figure: "Same-day", label: "Delivery inside Kampala" },
  { figure: "Nationwide", label: "Courier delivery across Uganda" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <span className="inline-block rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            About Francis Gadgets Technologies
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Your Digital Dreams Delivered</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
            We&apos;re a Kampala-based electronics retailer supplying smartphones, laptops, desktops, GPS trackers,
            CCTV &amp; security systems, and the phone and computer accessories that keep them running -- to
            individuals, homes, and businesses across Uganda.
          </p>
        </div>

        {/* Flat band under the hero, in the brand colours the logo already uses. */}
        <div className="h-1 bg-brand-flag" aria-hidden />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-white px-4 py-5 text-center">
              <p className="text-xl font-bold text-brand-700">{fact.figure}</p>
              <p className="mt-1 text-xs text-gray-500">{fact.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink-900">What we do</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Francis Gadgets Technologies stocks and sells consumer and small-business electronics -- smartphones,
              laptops, desktops, GPS trackers, CCTV and security cameras, audio equipment, and the accessories that
              go with them. Whether you&apos;re outfitting a home office, securing a shop with CCTV, or replacing a
              cracked phone screen, our catalog and team are built around getting you the right gadget, genuine and
              at a fair price.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink-900">Where we operate</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We&apos;re based in Kampala, Uganda, and deliver nationwide. Orders can be paid for securely online via
              Flutterwave (cards and mobile money) or Paystack, tracked from our storefront, and picked up or
              delivered depending on your location.
            </p>
          </div>
        </div>

        <h2 className="mb-4 mt-12 text-lg font-bold text-ink-900">What you can count on</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="text-xs leading-relaxed text-gray-500">{description}</p>
            </div>
          ))}
        </div>

        <PromiseStrip className="mt-10" />

        {/* Talking to us is the point of this page, so end on how. */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 text-center sm:p-8">
          <h2 className="text-lg font-bold text-ink-900">Talk to us before you buy</h2>
          <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-gray-500">
            Not sure which model fits, or need a CCTV setup quoted? Tell us what you are trying to do and we will
            tell you what actually works.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-gray-50"
            >
              <Phone className="h-4 w-4 text-brand-600" />
              {CONTACT.phone}
            </a>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
