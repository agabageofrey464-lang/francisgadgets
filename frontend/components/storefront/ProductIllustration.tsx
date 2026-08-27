import type { ReactElement } from "react";

/**
 * Drawn artwork for a product, chosen by its category.
 *
 * The shop sells a lot of near-identical SKUs (nine Tecno keypad phones, five
 * ThinkCentre all-in-ones) for which no photograph of the actual unit exists.
 * A stock photo of a *different* device is worse than no photo: it misleads.
 * These illustrations say "this is a keypad phone" honestly, in one house
 * style, and cost no network request -- they are inline SVG, crisp at any
 * density, and themable from the brand palette.
 *
 * Everything is flat fills in graphite with a single amber highlight -- no
 * gradients, no shadows -- so a grid reads as one designed system rather than
 * clip art. Graphite deliberately sits apart from the teal UI: teal means
 * 'you can click this', so artwork must not compete with it.
 */

const VARIANTS = [
  { body: "#1e293b", shade: "#0f172a", screen: "#cbd5e1", screenDim: "#94a3b8", accent: "#fbbf24" },
  { body: "#334155", shade: "#1e293b", screen: "#e2e8f0", screenDim: "#cbd5e1", accent: "#d97706" },
  { body: "#0f172a", shade: "#020617", screen: "#94a3b8", screenDim: "#64748b", accent: "#fbbf24" },
  { body: "#283548", shade: "#16202e", screen: "#dbe3ec", screenDim: "#a8b6c6", accent: "#f59e0b" },
];

type Palette = (typeof VARIANTS)[number];

/** Stable per-product, so the same item always draws the same way. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ---------------------------------------------------------------- artwork -- */
/* Each is drawn inside a 200x200 box, centred on roughly 40..160.             */

function Smartphone(p: Palette) {
  return (
    <g>
      <rect x="66" y="34" width="68" height="132" rx="12" fill={p.body} />
      <rect x="72" y="40" width="56" height="120" rx="7" fill={p.screen} />
      <rect x="72" y="40" width="56" height="30" rx="7" fill={p.screenDim} />
      <rect x="88" y="45" width="24" height="5" rx="2.5" fill={p.body} opacity="0.55" />
      {/* camera island */}
      <rect x="78" y="46" width="0" height="0" />
      <circle cx="118" cy="152" r="4" fill={p.accent} />
      <rect x="80" y="86" width="40" height="5" rx="2.5" fill={p.body} opacity="0.28" />
      <rect x="80" y="98" width="28" height="5" rx="2.5" fill={p.body} opacity="0.18" />
    </g>
  );
}

function FeaturePhone(p: Palette) {
  return (
    <g>
      <rect x="72" y="30" width="56" height="140" rx="10" fill={p.body} />
      <rect x="79" y="40" width="42" height="38" rx="4" fill={p.screen} />
      <rect x="79" y="40" width="42" height="12" rx="4" fill={p.screenDim} />
      {/* keypad: the thing that makes it read as a feature phone */}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={81 + col * 14}
            y={88 + row * 15}
            width="10"
            height="9"
            rx="2.5"
            fill={row === 0 ? p.accent : p.screen}
            opacity={row === 0 ? 1 : 0.65}
          />
        ))
      )}
    </g>
  );
}

function Tablet(p: Palette) {
  return (
    <g>
      <rect x="44" y="46" width="112" height="108" rx="11" fill={p.body} />
      <rect x="52" y="54" width="96" height="92" rx="5" fill={p.screen} />
      <rect x="52" y="54" width="96" height="26" rx="5" fill={p.screenDim} />
      <rect x="60" y="90" width="46" height="6" rx="3" fill={p.body} opacity="0.25" />
      <rect x="60" y="104" width="70" height="6" rx="3" fill={p.body} opacity="0.16" />
      <rect x="60" y="118" width="34" height="6" rx="3" fill={p.accent} opacity="0.9" />
    </g>
  );
}

function Laptop(p: Palette) {
  return (
    <g>
      {/* lid */}
      <rect x="48" y="48" width="104" height="70" rx="6" fill={p.body} />
      <rect x="55" y="55" width="90" height="56" rx="3" fill={p.screen} />
      <rect x="55" y="55" width="90" height="18" rx="3" fill={p.screenDim} />
      <rect x="62" y="82" width="42" height="5" rx="2.5" fill={p.body} opacity="0.25" />
      <rect x="62" y="93" width="60" height="5" rx="2.5" fill={p.body} opacity="0.15" />
      {/* base */}
      <path d="M36 124 h128 l10 16 a4 4 0 0 1 -3.4 6 H29.4 A4 4 0 0 1 26 140 Z" fill={p.shade} />
      <rect x="84" y="132" width="32" height="4" rx="2" fill={p.accent} />
    </g>
  );
}

function DesktopTower(p: Palette) {
  return (
    <g>
      <rect x="62" y="34" width="76" height="132" rx="8" fill={p.body} />
      <rect x="72" y="46" width="56" height="34" rx="4" fill={p.shade} />
      <circle cx="84" cy="63" r="6" fill={p.accent} />
      <rect x="96" y="59" width="24" height="4" rx="2" fill={p.screen} opacity="0.7" />
      <rect x="96" y="67" width="16" height="4" rx="2" fill={p.screen} opacity="0.45" />
      {/* vent slots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="74" y={94 + i * 11} width="52" height="5" rx="2.5" fill={p.screen} opacity="0.35" />
      ))}
    </g>
  );
}

function AllInOne(p: Palette) {
  return (
    <g>
      <rect x="34" y="42" width="132" height="88" rx="8" fill={p.body} />
      <rect x="42" y="50" width="116" height="72" rx="4" fill={p.screen} />
      <rect x="42" y="50" width="116" height="22" rx="4" fill={p.screenDim} />
      <rect x="52" y="82" width="52" height="6" rx="3" fill={p.body} opacity="0.25" />
      <rect x="52" y="96" width="76" height="6" rx="3" fill={p.body} opacity="0.15" />
      <rect x="92" y="130" width="16" height="22" fill={p.shade} />
      <rect x="62" y="152" width="76" height="10" rx="5" fill={p.shade} />
      <circle cx="100" cy="46" r="2.5" fill={p.accent} />
    </g>
  );
}

function MonitorScreen(p: Palette) {
  return (
    <g>
      <rect x="30" y="46" width="140" height="86" rx="7" fill={p.body} />
      <rect x="38" y="54" width="124" height="70" rx="3" fill={p.screen} />
      <rect x="38" y="54" width="124" height="20" rx="3" fill={p.screenDim} />
      <rect x="48" y="86" width="58" height="6" rx="3" fill={p.body} opacity="0.22" />
      <rect x="48" y="100" width="34" height="6" rx="3" fill={p.accent} opacity="0.85" />
      <rect x="92" y="132" width="16" height="20" fill={p.shade} />
      <rect x="64" y="152" width="72" height="10" rx="5" fill={p.shade} />
    </g>
  );
}

function CctvCamera(p: Palette) {
  return (
    <g>
      {/* bracket */}
      <rect x="40" y="46" width="10" height="60" rx="5" fill={p.shade} />
      <rect x="34" y="40" width="22" height="10" rx="5" fill={p.shade} />
      {/* body */}
      <rect x="50" y="74" width="96" height="46" rx="14" fill={p.body} />
      <circle cx="140" cy="97" r="21" fill={p.shade} />
      <circle cx="140" cy="97" r="13" fill={p.screen} />
      <circle cx="140" cy="97" r="6" fill={p.shade} />
      <circle cx="135" cy="92" r="2.5" fill="#ffffff" opacity="0.85" />
      {/* sun shield */}
      <path d="M52 70 h92 a8 8 0 0 1 8 8 v2 H44 v-2 a8 8 0 0 1 8 -8 Z" fill={p.shade} />
      {/* recording light */}
      <circle cx="64" cy="97" r="4" fill={p.accent} />
    </g>
  );
}

function GpsTracker(p: Palette) {
  return (
    <g>
      {/* signal arcs */}
      <g stroke={p.screen} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.75">
        <path d="M70 62 a42 42 0 0 1 60 0" />
        <path d="M82 76 a26 26 0 0 1 36 0" />
      </g>
      {/* pin */}
      <path d="M100 88 c-19 0 -34 15 -34 34 c0 25 34 56 34 56 s34 -31 34 -56 c0 -19 -15 -34 -34 -34 Z" fill={p.body} />
      <circle cx="100" cy="121" r="14" fill={p.screen} />
      <circle cx="100" cy="121" r="6" fill={p.accent} />
    </g>
  );
}

function Router(p: Palette) {
  return (
    <g>
      {/* antennas */}
      <rect x="56" y="46" width="7" height="52" rx="3.5" fill={p.shade} transform="rotate(-18 59 72)" />
      <rect x="137" y="46" width="7" height="52" rx="3.5" fill={p.shade} transform="rotate(18 141 72)" />
      <rect x="40" y="98" width="120" height="48" rx="10" fill={p.body} />
      {/* status lights */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={62 + i * 20} cy="122" r="5" fill={i === 0 ? p.accent : p.screen} opacity={i === 0 ? 1 : 0.7} />
      ))}
      <g stroke={p.screen} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M92 84 a14 14 0 0 1 16 0" />
      </g>
    </g>
  );
}

function Headphones(p: Palette) {
  return (
    <g>
      <path d="M52 116 v-16 a48 48 0 0 1 96 0 v16" stroke={p.body} strokeWidth="13" fill="none" strokeLinecap="round" />
      <rect x="38" y="108" width="28" height="48" rx="12" fill={p.body} />
      <rect x="134" y="108" width="28" height="48" rx="12" fill={p.body} />
      <rect x="44" y="116" width="16" height="32" rx="8" fill={p.screen} />
      <rect x="140" y="116" width="16" height="32" rx="8" fill={p.accent} />
    </g>
  );
}

function SoundBar(p: Palette) {
  return (
    <g>
      <rect x="26" y="84" width="148" height="42" rx="12" fill={p.body} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={48 + i * 18} cy="105" r="7" fill={p.screen} opacity="0.55" />
      ))}
      <circle cx="156" cy="105" r="5" fill={p.accent} />
      <rect x="60" y="134" width="80" height="8" rx="4" fill={p.shade} opacity="0.5" />
    </g>
  );
}

function Printer(p: Palette) {
  return (
    <g>
      <rect x="62" y="40" width="76" height="30" rx="4" fill={p.shade} />
      <rect x="42" y="70" width="116" height="58" rx="9" fill={p.body} />
      <rect x="54" y="84" width="42" height="8" rx="4" fill={p.screen} opacity="0.6" />
      <circle cx="142" cy="88" r="5" fill={p.accent} />
      {/* output sheet */}
      <rect x="66" y="126" width="68" height="38" rx="4" fill="#ffffff" />
      <rect x="76" y="138" width="40" height="5" rx="2.5" fill={p.body} opacity="0.35" />
      <rect x="76" y="149" width="28" height="5" rx="2.5" fill={p.body} opacity="0.22" />
    </g>
  );
}

function Projector(p: Palette) {
  return (
    <g>
      {/* beam */}
      <path d="M126 84 L176 56 v92 L126 118 Z" fill={p.screen} opacity="0.45" />
      <rect x="38" y="76" width="90" height="52" rx="10" fill={p.body} />
      <circle cx="112" cy="102" r="15" fill={p.shade} />
      <circle cx="112" cy="102" r="8" fill={p.accent} />
      <rect x="52" y="90" width="30" height="6" rx="3" fill={p.screen} opacity="0.6" />
      <rect x="52" y="104" width="18" height="6" rx="3" fill={p.screen} opacity="0.35" />
    </g>
  );
}

function Ups(p: Palette) {
  return (
    <g>
      <rect x="52" y="52" width="96" height="112" rx="10" fill={p.body} />
      <rect x="64" y="66" width="72" height="34" rx="5" fill={p.shade} />
      {/* power bolt */}
      <path d="M104 70 l-18 24 h12 l-6 20 l20 -26 h-12 Z" fill={p.accent} />
      {[0, 1].map((i) => (
        <rect key={i} x={68 + i * 38} y="118" width="26" height="26" rx="5" fill={p.screen} opacity="0.7" />
      ))}
    </g>
  );
}

function Shredder(p: Palette) {
  return (
    <g>
      <rect x="70" y="34" width="60" height="34" rx="4" fill="#ffffff" />
      <rect x="80" y="46" width="34" height="4" rx="2" fill={p.body} opacity="0.3" />
      <rect x="38" y="72" width="124" height="34" rx="8" fill={p.body} />
      <rect x="56" y="86" width="88" height="7" rx="3.5" fill={p.shade} />
      <circle cx="150" cy="82" r="4" fill={p.accent} />
      {/* shreds */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={58 + i * 15} y="112" width="7" height={i % 2 ? 46 : 34} rx="3.5" fill={p.screen} opacity="0.75" />
      ))}
    </g>
  );
}

function MoneyCounter(p: Palette) {
  return (
    <g>
      <rect x="40" y="86" width="120" height="60" rx="10" fill={p.body} />
      <rect x="56" y="102" width="40" height="10" rx="5" fill={p.screen} opacity="0.65" />
      <circle cx="140" cy="107" r="6" fill={p.accent} />
      {/* note stack feeding in */}
      <rect x="66" y="44" width="68" height="24" rx="4" fill={p.screen} />
      <rect x="72" y="56" width="56" height="22" rx="4" fill={p.screenDim} />
      <circle cx="100" cy="60" r="7" fill={p.body} opacity="0.45" />
      <rect x="62" y="150" width="76" height="8" rx="4" fill={p.shade} opacity="0.55" />
    </g>
  );
}

function Charger(p: Palette) {
  return (
    <g>
      <rect x="64" y="40" width="72" height="66" rx="12" fill={p.body} />
      <rect x="82" y="24" width="9" height="20" rx="4.5" fill={p.shade} />
      <rect x="109" y="24" width="9" height="20" rx="4.5" fill={p.shade} />
      <path d="M104 58 l-16 22 h11 l-5 18 l18 -24 h-11 Z" fill={p.accent} />
      {/* cable */}
      <path d="M100 106 c0 26 -34 20 -34 42 c0 14 12 20 24 20" stroke={p.body} strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="88" y="158" width="22" height="14" rx="4" fill={p.shade} />
    </g>
  );
}

function KeyboardMouse(p: Palette) {
  return (
    <g>
      <rect x="24" y="86" width="112" height="56" rx="9" fill={p.body} />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={34 + col * 16}
            y={96 + row * 15}
            width="12"
            height="10"
            rx="2.5"
            fill={row === 2 && col === 2 ? p.accent : p.screen}
            opacity={row === 2 && col === 2 ? 1 : 0.6}
          />
        ))
      )}
      <rect x="148" y="86" width="34" height="56" rx="17" fill={p.body} />
      <rect x="163" y="96" width="4" height="14" rx="2" fill={p.accent} />
    </g>
  );
}

function Tools(p: Palette) {
  return (
    <g>
      {/* wrench */}
      <path
        d="M62 138 L112 88 a22 22 0 1 0 -18 -18 L44 120 a13 13 0 0 0 18 18 Z"
        fill={p.body}
      />
      <circle cx="118" cy="62" r="9" fill={p.screen} />
      {/* screwdriver */}
      <rect x="118" y="112" width="14" height="46" rx="4" fill={p.shade} transform="rotate(-38 125 135)" />
      <rect x="140" y="96" width="12" height="26" rx="3" fill={p.accent} transform="rotate(-38 146 109)" />
    </g>
  );
}

function GenericBox(p: Palette) {
  return (
    <g>
      <path d="M100 44 L158 70 L100 96 L42 70 Z" fill={p.screen} />
      <path d="M42 70 L100 96 v58 L42 128 Z" fill={p.body} />
      <path d="M158 70 L100 96 v58 l58 -26 Z" fill={p.shade} />
      <rect x="88" y="52" width="24" height="7" rx="3.5" fill={p.accent} />
    </g>
  );
}

/* --------------------------------------------------------------- mapping -- */

type Artwork = (p: Palette) => ReactElement;

const BY_CATEGORY: Record<string, Artwork> = {
  smartphones: Smartphone,
  "feature-phones": FeaturePhone,
  tablets: Tablet,
  laptops: Laptop,
  desktops: DesktopTower,
  monitors: MonitorScreen,
  "cctv-security-cameras": CctvCamera,
  "gps-trackers": GpsTracker,
  networking: Router,
  audio: Headphones,
  "sound-bars": SoundBar,
  printers: Printer,
  scanners: Printer,
  "toner-ink": Printer,
  projectors: Projector,
  ups: Ups,
  "paper-shredders": Shredder,
  "money-counting-machines": MoneyCounter,
  "home-appliances": GenericBox,
  "phone-accessories": Charger,
  "computer-accessories": KeyboardMouse,
  "installation-services": Tools,
};

/**
 * A few product names describe a different shape from their category: the
 * ThinkCentre all-in-ones sit in "Desktops" but look like a monitor, and the
 * accessory categories mix chargers with keyboards. Name wins where it is
 * unambiguous.
 */
function pickArtwork(categorySlug: string | null | undefined, name: string): Artwork {
  const n = name.toLowerCase();

  if (n.includes("all-in-one") || n.includes("all in one") || n.includes(" aio")) return AllInOne;
  if (n.includes("monitor")) return MonitorScreen;
  if (n.includes("keyboard") || n.includes("mouse")) return KeyboardMouse;
  if (n.includes("charger") || n.includes("cable") || n.includes("power bank")) return Charger;
  if (n.includes("headphone") || n.includes("earbud") || n.includes("headset")) return Headphones;
  if (n.includes("speaker") || n.includes("sound bar") || n.includes("soundbar")) return SoundBar;
  if (n.includes("router") || n.includes("wi-fi") || n.includes("wifi")) return Router;
  if (n.includes("tablet") || n.includes("ipad") || n.includes("megapad")) return Tablet;
  if (n.includes("installation") || n.includes("setup") || n.includes("service")) return Tools;

  return (categorySlug && BY_CATEGORY[categorySlug]) || GenericBox;
}

interface ProductIllustrationProps {
  name: string;
  categorySlug?: string | null;
  /** Unique per render site -- SVG ids are global. */
  patternId: string;
  className?: string;
}

export function ProductIllustration({
  name,
  categorySlug,
  patternId,
  className,
}: ProductIllustrationProps) {
  const Artwork = pickArtwork(categorySlug, name);
  const seed = hash(`${categorySlug ?? ""}:${name}`);
  const palette = VARIANTS[seed % VARIANTS.length];
  // Rotate the backdrop a little per product so a row of the same category does
  // not look like the identical image repeated.
  const tilt = ((seed >> 3) % 3) - 1;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className ?? "h-full w-full"}
      role="img"
      aria-label={name}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`${patternId}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="#e2e8f0" />
        </pattern>
        <clipPath id={`${patternId}-clip`}>
          <rect x="0" y="0" width="200" height="200" rx="10" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${patternId}-clip)`}>
        <rect width="200" height="200" fill="#f8fafc" />
        <rect width="200" height="200" fill={`url(#${patternId}-dots)`} opacity="0.55" />
        {/* soft ground so the device does not float */}
        <ellipse cx="100" cy="168" rx="62" ry="12" fill="#e2e8f0" />
        <g transform={`rotate(${tilt} 100 100)`}>{Artwork(palette)}</g>
      </g>
    </svg>
  );
}
