"use client";

import { useEffect, useState } from "react";

import { AdMedia } from "@/components/storefront/AdMedia";
import { apiFetch } from "@/lib/api";
import type { Ad, AdPlacement } from "@/lib/types";

interface Props {
  placement: AdPlacement;
  /** Styles the media box itself (aspect ratio, rounding). */
  className?: string;
  /** Styles the wrapper, so the slot can stretch inside a flex column. */
  containerClassName?: string;
}

export function AdSlot({ placement, className, containerClassName = "" }: Props) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Ad[]>("/ads", { params: { placement } })
      .then((ads) => {
        if (!cancelled) setAd(ads[Math.floor(Math.random() * ads.length)] ?? null);
      })
      .catch(() => {
        if (!cancelled) setAd(null);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!ad) return null;

  return (
    <div className={containerClassName}>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">Sponsored</p>
      <div
        className={
          className ?? "relative aspect-[1920/300] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md ring-1 ring-black/5"
        }
      >
        <AdMedia ad={ad} />
      </div>
    </div>
  );
}
