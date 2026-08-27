/**
 * Inline SVG background patterns. Everything is drawn with `currentColor`, so a
 * pattern takes its colour from whatever text colour the parent sets -- no
 * image assets, no extra requests, and crisp at any pixel density.
 */

interface PatternProps {
  /** Must be unique on the page -- SVG pattern ids are global. */
  id: string;
  className?: string;
}

/** Fine dot grid. Good under dark panels and product-image fallbacks. */
export function DotGrid({ id, className }: PatternProps) {
  return (
    <svg aria-hidden className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.25" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Diagonal hatching. Used for banded sections that need texture, not noise. */
export function Diagonals({ id, className }: PatternProps) {
  return (
    <svg aria-hidden className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Concentric arcs radiating from a corner -- a soft focal graphic for panels. */
export function CornerRings({ id, className }: PatternProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMaxYMin slice">
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.9">
        {[40, 70, 100, 130, 160].map((r) => (
          <circle key={r} cx="200" cy="0" r={r} />
        ))}
      </g>
      <title id={id}>Decorative rings</title>
    </svg>
  );
}

/**
 * "Nothing here" illustration -- an empty carton with a dashed search sweep.
 * Sized by the parent's width; inherits colour from `currentColor`.
 */
export function EmptyBoxGraphic({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 160 120" fill="none">
      <ellipse cx="80" cy="104" rx="52" ry="7" fill="currentColor" opacity="0.12" />
      <path
        d="M28 46h104v50a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V46Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M22 30h116v16H22V30Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path d="M68 46h24v14H68V46Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" opacity="0.55" />
      <circle cx="118" cy="26" r="15" stroke="currentColor" strokeWidth="3" strokeDasharray="4 5" opacity="0.8" />
      <path d="m129 37 12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
