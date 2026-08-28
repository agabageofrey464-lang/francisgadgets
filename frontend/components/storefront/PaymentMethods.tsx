import Image from "next/image";

/**
 * The ways a customer can actually pay, shown as the providers' own marks.
 *
 * Mobile money is how most Ugandan orders are paid, so MTN and Airtel lead and
 * cards follow. Saying this on the page -- rather than only at the last step of
 * checkout -- removes the commonest reason a shopper abandons a cart: not
 * knowing whether their money will be accepted.
 */
const METHODS = [
  { src: "/icons/pay/mtn-mobile-logo-icon.svg", label: "MTN Mobile Money" },
  { src: "/icons/pay/airtel-logo-icon.svg", label: "Airtel Money" },
  { src: "/icons/pay/master-card-icon.svg", label: "Mastercard" },
];

export function PaymentMethods({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {METHODS.map((method) => (
        <li
          key={method.label}
          title={method.label}
          className="grid place-items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5"
        >
          <Image
            src={method.src}
            alt={method.label}
            width={size}
            height={size}
            className="h-auto w-auto"
            style={{ height: size, width: "auto" }}
          />
        </li>
      ))}
    </ul>
  );
}
