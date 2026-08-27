import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Tone = "default" | "money" | "warning" | "danger";

const iconTones: Record<Tone, string> = {
  default: "bg-brand-50 text-brand-600",
  money: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
};

const accentTones: Record<Tone, string> = {
  default: "bg-brand-500",
  money: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  tone?: Tone;
  /** Makes the whole card a link -- most stats have an obvious drill-down. */
  href?: string;
}) {
  const content = (
    <>
      <span className={cn("absolute inset-x-0 top-0 h-0.5", accentTones[tone])} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", iconTones[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
    </>
  );

  const className = cn(
    "relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5",
    href && "transition-all hover:border-brand-300 hover:shadow-md"
  );

  if (href) {
    return (
      <Link href={href} className={cn(className, "block")}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
