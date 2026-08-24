"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Ad } from "@/lib/types";

interface Props {
  ad: Ad;
  sizes?: string;
  active?: boolean;
  /** Controlled mute state, shared across mirrored instances of the same ad. Falls back to internal state when omitted. */
  muted?: boolean;
  onToggleMute?: () => void;
  /** When false, this instance never outputs audio even when "unmuted" -- used to avoid doubled/echoing sound when the same ad is mirrored in multiple spots at once. The mute icon still reflects the shared state. */
  audible?: boolean;
  videoRef?: (el: HTMLVideoElement | null) => void;
}

function recordClick(adId: number) {
  apiFetch(`/ads/${adId}/click`, { method: "POST" }).catch(() => {});
}

function AdBadge() {
  return (
    <span className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
      Ad
    </span>
  );
}

function AdvertiserLabel({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => recordClick(ad.id)}
      className="absolute bottom-2.5 left-2.5 z-10 max-w-[65%] truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20"
    >
      {ad.advertiser_name}
    </a>
  );
}

export function AdMedia({ ad, sizes = "100vw", active = true, muted: mutedProp, onToggleMute, audible = true, videoRef }: Props) {
  const [localMuted, setLocalMuted] = useState(true);
  const muted = mutedProp ?? localMuted;

  if (ad.media_type === "video") {
    const toggleSound = () => {
      if (onToggleMute) {
        // Parent owns click recording when mute state is shared/controlled.
        onToggleMute();
      } else {
        setLocalMuted((m) => {
          if (m) recordClick(ad.id);
          return !m;
        });
      }
    };

    return (
      <div className="group absolute inset-0">
        <video
          ref={videoRef}
          src={ad.media_url}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          autoPlay={active}
          loop
          muted={muted || !audible}
          playsInline
          onClick={toggleSound}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <AdBadge />
        <AdvertiserLabel ad={ad} />

        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Unmute ad" : "Mute ad"}
          className={`absolute bottom-2.5 right-2.5 z-10 rounded-full p-2 text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors ${
            muted ? "animate-pulse bg-black/50 hover:bg-black/70" : "bg-accent-500/90 hover:bg-accent-500"
          }`}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="group absolute inset-0">
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => recordClick(ad.id)} className="absolute inset-0">
        <Image
          src={ad.media_url}
          alt={ad.advertiser_name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </a>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

      <AdBadge />
      <AdvertiserLabel ad={ad} />
    </div>
  );
}
