"use client";

import { useEffect, useRef, useState } from "react";

import { AdMedia } from "@/components/storefront/AdMedia";
import { HomeMarquee } from "@/components/storefront/HomeMarquee";
import { apiFetch } from "@/lib/api";
import type { Ad, ProductListItem } from "@/lib/types";

const ROTATE_MS = 4000;
const SYNC_DRIFT_SECONDS = 0.15;

function recordClick(adId: number) {
  apiFetch(`/ads/${adId}/click`, { method: "POST" }).catch(() => {});
}

interface AdColumnProps {
  ads: Ad[];
  index: number;
  side: "left" | "right";
  muted: boolean;
  onToggleMute: () => void;
  onActiveVideoRef: (el: HTMLVideoElement | null) => void;
}

function AdColumn({ ads, index, side, muted, onToggleMute, onActiveVideoRef }: AdColumnProps) {
  return (
    <div className="relative hidden w-40 shrink-0 overflow-hidden shadow-[inset_0_0_24px_rgba(0,0,0,0.35)] sm:block md:w-56 lg:w-64">
      <div className={`pointer-events-none absolute inset-y-0 z-10 w-px bg-brand-flag ${side === "left" ? "right-0" : "left-0"}`} />

      {ads.map((ad, i) => (
        <div
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <AdMedia
            ad={ad}
            sizes="256px"
            active={i === index}
            muted={muted}
            onToggleMute={onToggleMute}
            audible={side === "left"}
            videoRef={i === index ? onActiveVideoRef : undefined}
          />
        </div>
      ))}
      {ads.length > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {ads.map((ad, i) => (
            <span
              key={ad.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroBanner({
  products = [],
  aspectClassName,
}: {
  products?: ProductListItem[];
  aspectClassName?: string;
}) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const leftVideoRef = useRef<HTMLVideoElement | null>(null);
  const rightVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    apiFetch<Ad[]>("/ads", { params: { placement: "homepage_top" } })
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ads.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [ads.length]);

  // Keep the mirrored left/right video elements for the active ad playing in lockstep.
  useEffect(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left || !right) return;

    const sync = () => {
      if (Math.abs(left.currentTime - right.currentTime) > SYNC_DRIFT_SECONDS) {
        right.currentTime = left.currentTime;
      }
    };
    const resume = () => right.play().catch(() => {});
    const pause = () => right.pause();

    left.addEventListener("timeupdate", sync);
    left.addEventListener("play", resume);
    left.addEventListener("pause", pause);
    return () => {
      left.removeEventListener("timeupdate", sync);
      left.removeEventListener("play", resume);
      left.removeEventListener("pause", pause);
    };
  }, [index, ads]);

  const toggleMute = () => {
    setMuted((m) => {
      if (m) {
        const activeAd = ads[index];
        if (activeAd) recordClick(activeAd.id);
      }
      return !m;
    });
  };

  return (
    <div className="flex w-full items-stretch">
      {ads.length > 0 && (
        <AdColumn
          ads={ads}
          index={index}
          side="left"
          muted={muted}
          onToggleMute={toggleMute}
          onActiveVideoRef={(el) => {
            leftVideoRef.current = el;
          }}
        />
      )}

      <div className={ads.length > 0 ? "min-w-0 flex-1" : "w-full"}>
        <HomeMarquee products={products} aspectClassName={aspectClassName} />
      </div>

      {ads.length > 0 && (
        <AdColumn
          ads={ads}
          index={index}
          side="right"
          muted={muted}
          onToggleMute={toggleMute}
          onActiveVideoRef={(el) => {
            rightVideoRef.current = el;
          }}
        />
      )}
    </div>
  );
}
