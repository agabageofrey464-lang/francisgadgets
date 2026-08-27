import { Ban, Check, CreditCard, PackageCheck, Receipt, Truck, Undo2, type LucideIcon } from "lucide-react";

import type { OrderStatus } from "@/lib/types";

/** The happy path every order walks, in order. */
const FLOW: { status: OrderStatus; label: string; icon: LucideIcon }[] = [
  { status: "pending", label: "Placed", icon: Receipt },
  { status: "paid", label: "Paid", icon: CreditCard },
  { status: "processing", label: "Packing", icon: PackageCheck },
  { status: "shipped", label: "On the way", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Check },
];

/** Orders that stopped rather than finished -- shown as a single terminal state. */
const TERMINAL: Partial<Record<OrderStatus, { label: string; body: string; icon: LucideIcon; tone: string }>> = {
  cancelled: {
    label: "Cancelled",
    body: "This order was cancelled. Contact us if you think that is a mistake.",
    icon: Ban,
    tone: "text-red-600 bg-red-50 border-red-200",
  },
  refunded: {
    label: "Refunded",
    body: "This order was refunded. The money should be back with you shortly.",
    icon: Undo2,
    tone: "text-amber-700 bg-amber-50 border-amber-200",
  },
};

/**
 * Where an order has got to, as a track rather than a word. A shopper checking
 * on a delivery wants "how far along", which a status pill alone does not say.
 */
export function OrderStatusTrack({ status }: { status: OrderStatus }) {
  const terminal = TERMINAL[status];

  if (terminal) {
    return (
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${terminal.tone}`}>
        <terminal.icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{terminal.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">{terminal.body}</p>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.findIndex((step) => step.status === status);

  return (
    <ol className="flex items-start" aria-label={`Order status: ${status}`}>
      {FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <li key={step.status} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Connector to the previous step -- omitted on the first. */}
              <span
                className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : done ? "bg-brand-600" : "bg-gray-200"}`}
              />
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-200 bg-white text-gray-300"
                } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
              >
                <step.icon className="h-4 w-4" />
              </span>
              <span
                className={`h-0.5 flex-1 ${
                  i === FLOW.length - 1 ? "bg-transparent" : i < currentIndex ? "bg-brand-600" : "bg-gray-200"
                }`}
              />
            </div>
            <span
              className={`mt-1.5 px-1 text-center text-[11px] leading-tight ${
                isCurrent ? "font-semibold text-ink-900" : done ? "text-ink-700" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
