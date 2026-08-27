import { CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react";

const PROMISES = [
  { icon: ShieldCheck, title: "Genuine products", body: "Sourced from authorised channels." },
  { icon: Truck, title: "Delivery across Uganda", body: "Same-day within Kampala." },
  { icon: CreditCard, title: "Pay how you prefer", body: "Mobile money, card or transfer." },
  { icon: Wrench, title: "Installation & support", body: "Fitted by our own technicians." },
];

/**
 * The four standing promises, as one flat hairline-divided band. Shared by the
 * homepage, product pages and the cart so the shop makes the same four claims
 * in the same order wherever a shopper is deciding.
 */
export function PromiseStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {PROMISES.map((promise) => (
        <div key={promise.title} className="flex items-center gap-3 bg-white px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <promise.icon className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink-900">{promise.title}</span>
            <span className="block truncate text-xs text-gray-500">{promise.body}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
