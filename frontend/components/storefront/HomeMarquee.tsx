"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/AOV-SolarVu-Cameras_homepage-banner.jpg", alt: "Solar-powered Hikvision security cameras" },
  { src: "/Hikvision-Anti-corrosion-series-camera-pc-banner.jpg", alt: "Hikvision Anti-corrosion series cameras" },
  { src: "/Hikvision-ultra-series-PTZ-pc.jpg", alt: "Hikvision Ultra series PTZ camera" },
  { src: "/TandemVu-PTZ-pc.jpg", alt: "Hikvision TandemVu PTZ camera" },
  { src: "/deepinviewx-top-pc-banner.jpg", alt: "Hikvision DeepinViewX cameras" },
  { src: "/Deepinview-banner.png", alt: "Hikvision DeepinView cameras" },
];

const INTERVAL_MS = 5000;

export function HomeMarquee() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <Link
      href="/products?category=cctv-security-cameras"
      className="group relative block aspect-[1920/480] w-full overflow-hidden bg-ink-900"
    >
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.src}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </Link>
  );
}
