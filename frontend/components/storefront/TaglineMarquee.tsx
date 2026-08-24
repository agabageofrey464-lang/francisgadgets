import { Sparkle } from "lucide-react";

const REPEATS = 6;

export function TaglineMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-900/60 py-4">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-900 to-transparent sm:w-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-900 to-transparent sm:w-32"
        aria-hidden
      />

      <div className="flex w-max animate-marquee motion-reduce:animate-none" aria-hidden>
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-6 pr-6">
            {Array.from({ length: REPEATS }).map((_, i) => (
              <span key={i} className="flex shrink-0 items-center gap-6">
                <span className="bg-brand-flag bg-clip-text text-3xl font-extrabold uppercase italic tracking-tight text-transparent sm:text-5xl">
                  Your digital dreams delivered.
                </span>
                <Sparkle className="h-5 w-5 shrink-0 fill-accent-500 text-accent-500 sm:h-7 sm:w-7" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
