"use client";

import { Clock, Mail, MapPin, MessageCircle, PackageSearch, Phone, Send, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { SocialLinks } from "@/components/storefront/SocialLinks";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { CONTACT } from "@/lib/social";

interface Channel {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

const CHANNELS: Channel[] = [
  { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone}` },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT.whatsapp,
    href: CONTACT.whatsappLink,
    external: true,
  },
  { icon: MapPin, label: "Address", value: "Kampala, Uganda" },
  { icon: Clock, label: "Hours", value: "Mon - Sat, 9am - 6pm" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${form.name || "website visitor"}`);
    const body = encodeURIComponent(`${form.message}\n\n-- \n${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app...");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
      <Breadcrumbs trail={[{ label: "Contact" }]} />

      <h1 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">Contact &amp; support</h1>
      <p className="mt-1 text-sm text-gray-500">
        Questions about an order, a product, or a warranty claim? We&apos;re happy to help.
      </p>

      {/* WhatsApp is how most people actually reach us, so it leads. */}
      <a
        href={CONTACT.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-600 p-4 text-white transition-colors hover:bg-emerald-700"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15">
          <MessageCircle className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">Chat with us on WhatsApp</span>
          <span className="block text-xs text-white/80">Fastest way to reach us -- {CONTACT.whatsapp}</span>
        </span>
      </a>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
        <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Send us a message</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={7}
              required
              placeholder="Tell us what you need help with..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto">
            <Send className="h-4 w-4" />
            Send message
          </Button>
          <p className="mt-2 text-xs text-gray-500">This opens your email app with the message ready to send.</p>
        </form>

        <div className="space-y-4">
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {CHANNELS.map((channel) => {
              const body = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <channel.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink-900">{channel.label}</span>
                    <span className="block truncate text-sm text-gray-500">{channel.value}</span>
                  </span>
                </>
              );

              return channel.href ? (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 p-3.5 transition-colors hover:bg-brand-50/50"
                >
                  {body}
                </a>
              ) : (
                <div key={channel.label} className="flex items-center gap-3 p-3.5">
                  {body}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold text-ink-900">Follow us</p>
            <SocialLinks />
          </div>

          <Link
            href="/track-order"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-300"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <PackageSearch className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-ink-900">Already placed an order?</span>
              <span className="block text-xs text-gray-500">Track its status any time.</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
