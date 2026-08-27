import { Check } from "lucide-react";

const STEPS = ["Cart", "Details", "Payment"];

/**
 * Three-step progress for the buying flow. `current` is zero-based, so the
 * checkout form passes 1 and the payment result page passes 2.
 */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const isCurrent = i === current;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-brand-600 text-white"
                  : isCurrent
                    ? "bg-brand-50 text-brand-700 ring-2 ring-brand-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={isCurrent ? "font-semibold text-ink-900" : "text-gray-500"}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-gray-200 sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
