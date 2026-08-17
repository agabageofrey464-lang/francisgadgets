import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "default" | "money" | "warning" | "danger";
}) {
  const iconTones: Record<string, string> = {
    default: "bg-brand-50 text-brand-600",
    money: "bg-rose-50 text-rose-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };
  const valueTones: Record<string, string> = {
    default: "text-ink-900",
    money: "text-rose-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg", iconTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={cn("text-xl font-bold", valueTones[tone])}>{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
        </div>
      </div>
    </Card>
  );
}
