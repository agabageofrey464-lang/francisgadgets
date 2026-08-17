"use client";

import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { SocialLinks } from "@/components/storefront/SocialLinks";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { CONTACT } from "@/lib/social";

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-ink-900">Contact &amp; Support</h1>
      <p className="mb-8 text-sm text-gray-500">
        Questions about an order, a product, or a warranty claim? We&apos;re happy to help.
      </p>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="space-y-4">
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
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              required
              placeholder="Tell us what you need help with..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <Button type="submit">Send message</Button>
        </form>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">Email</p>
                <a href={`mailto:${CONTACT.email}`} className="text-sm text-gray-500 hover:text-brand-600">
                  {CONTACT.email}
                </a>
              </div>
            </div>
            <div className="mb-3 flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">Phone</p>
                <a href={`tel:${CONTACT.phone}`} className="text-sm text-gray-500 hover:text-brand-600">
                  {CONTACT.phone}
                </a>
              </div>
            </div>
            <div className="mb-3 flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">WhatsApp</p>
                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-brand-600"
                >
                  {CONTACT.whatsapp}
                </a>
              </div>
            </div>
            <div className="mb-3 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">Address</p>
                <p className="text-sm text-gray-500">Kampala, Uganda</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">Hours</p>
                <p className="text-sm text-gray-500">Mon &ndash; Sat, 9am &ndash; 6pm</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-ink-900">Follow us</p>
            <SocialLinks />
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-ink-900">Already placed an order?</p>
            <p className="mt-1 text-sm text-gray-500">
              Track its status any time from the{" "}
              <a href="/track-order" className="text-brand-600 hover:underline">
                order tracking page
              </a>
              .
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
