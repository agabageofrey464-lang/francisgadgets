import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Crumb {
  label: string;
  /** Omitted on the last crumb -- you are already there. */
  href?: string;
}

/**
 * "Home / Shop / Laptops / HP OMEN". Always starts at Home, so callers pass
 * only the trail that follows it.
 */
export function Breadcrumbs({ trail, className = "" }: { trail: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1 text-xs text-gray-500 ${className}`}
    >
      <Link href="/" className="hover:text-brand-600">
        Home
      </Link>
      {trail.map((crumb) => (
        <span key={crumb.label} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden />
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-brand-600">
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate text-ink-900">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
