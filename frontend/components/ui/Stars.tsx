import { Star } from "lucide-react";

/**
 * Amazon-style rating row. Renders nothing when a product has never been
 * reviewed -- an empty five-star row reads as "rated badly", not "unrated".
 */
export function Stars({ average, count }: { average: number | null; count: number }) {
  if (!average || count === 0) return null;

  const rounded = Math.round(average * 2) / 2;

  return (
    <span className="flex items-center gap-1" aria-label={`Rated ${average.toFixed(1)} out of 5 from ${count} reviews`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((position) => {
          const fill = Math.min(Math.max(rounded - position + 1, 0), 1);
          return (
            <span key={position} className="relative h-3.5 w-3.5">
              <Star className="absolute inset-0 h-3.5 w-3.5 text-gray-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
              </span>
            </span>
          );
        })}
      </span>
      <span className="text-xs text-brand-700">{count.toLocaleString()}</span>
    </span>
  );
}
