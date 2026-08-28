import {
  BadgeCheck,
  Banknote,
  Lock,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface Assurance {
  icon: LucideIcon;
  /** Two short lines -- these sit in a tight column under the icon. */
  line1: string;
  line2?: string;
  title: string;
}

/**
 * The promises that answer a buyer's last few objections, in the order they
 * tend to ask them: can I pay on delivery, will you fit it, what if it breaks,
 * who am I actually buying from, do I get a proper invoice, can I send it back.
 *
 * EFRIS is URA's e-invoicing system -- a business customer in Uganda needs that
 * invoice to claim the purchase, so it belongs on the page, not buried in the
 * checkout.
 */
const ASSURANCES: Assurance[] = [
  { icon: Banknote, line1: "Cash on", line2: "delivery", title: "Pay cash when your order arrives" },
  { icon: Wrench, line1: "Expert", line2: "installation", title: "Fitted by our own technicians" },
  { icon: ShieldCheck, line1: "1 Year", line2: "warranty", title: "One year warranty where offered by the brand" },
  { icon: Truck, line1: "Fulfilled by", line2: "Francis Gadgets", title: "Stocked, checked and dispatched by us" },
  { icon: Receipt, line1: "EFRIS", line2: "invoice", title: "URA-compliant e-invoice issued on request" },
  { icon: RotateCcw, line1: "7 Day", line2: "returns", title: "Return within 7 days if it is not right" },
  { icon: BadgeCheck, line1: "Genuine", line2: "product", title: "Sourced from authorised channels" },
  { icon: Star, line1: "Top", line2: "brand", title: "Brands we stand behind" },
  { icon: Lock, line1: "Secure", line2: "transaction", title: "Payments handled by Paystack and Flutterwave" },
];

/** The three that matter most at a glance, for tight spaces. */
const COMPACT = [ASSURANCES[0], ASSURANCES[5], ASSURANCES[6]];

/**
 * `row` -- the full nine, as an icon grid for a product page.
 * `compact` -- three one-line chips, small enough for a product card.
 */
export function ProductAssurances({
  variant = "row",
  className = "",
}: {
  variant?: "row" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <ul className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
        {COMPACT.map((item) => (
          <li
            key={item.line1}
            title={item.title}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500"
          >
            <item.icon className="h-3 w-3 shrink-0 text-brand-600" />
            {item.line1} {item.line2}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={`grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-5 lg:grid-cols-9 ${className}`}
      aria-label="What you get with this order"
    >
      {ASSURANCES.map((item) => (
        <li key={item.line1} title={item.title} className="flex flex-col items-center text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-600">
            <item.icon className="h-[18px] w-[18px]" />
          </span>
          <span className="mt-1.5 text-[11px] font-medium leading-tight text-brand-700">
            {item.line1}
            {item.line2 && (
              <>
                <br />
                {item.line2}
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
