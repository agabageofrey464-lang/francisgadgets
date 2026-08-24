import { Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";

import { Card } from "@/components/ui/Card";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Genuine products",
    description: "Every phone, laptop, camera and accessory we sell is sourced from authorized suppliers.",
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

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink-900">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
            About Francis Gadgets Technologies
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Your Digital Dreams Delivered</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            We&apos;re a Kampala-based electronics retailer supplying smartphones, laptops, desktops, GPS trackers,
            CCTV &amp; security systems, and the phone and computer accessories that keep them running -- to
            individuals, homes, and businesses across Uganda.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-bold text-ink-900">What we do</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Francis Gadgets Technologies stocks and sells consumer and small-business electronics -- smartphones,
              laptops, desktops, GPS trackers, CCTV and security cameras, audio equipment, and the accessories that
              go with them. Whether you&apos;re outfitting a home office, securing a shop with CCTV, or replacing a
              cracked phone screen, our catalog and team are built around getting you the right gadget, genuine and
              at a fair price.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold text-ink-900">Where we operate</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We&apos;re based in Kampala, Uganda, and deliver nationwide. Orders can be paid for securely online via
              Flutterwave (cards and mobile money) or Paystack, tracked from our storefront, and picked up or
              delivered depending on your location.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="text-xs text-gray-500">{description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
