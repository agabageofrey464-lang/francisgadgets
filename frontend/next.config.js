function hostFrom(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const apiHost = hostFrom(process.env.NEXT_PUBLIC_API_URL) ?? "localhost";
const apiProtocol = (process.env.NEXT_PUBLIC_API_URL ?? "").startsWith("https") ? "https" : "http";

// Explicit allow-list rather than a wildcard hostname -- Next's image optimizer
// has had DoS advisories tied to overly permissive remotePatterns.
const remotePatterns = [
  { protocol: apiProtocol, hostname: apiHost }, // backend-served /uploads (local storage backend)
  { protocol: "https", hostname: "images.unsplash.com" }, // seed/demo product images
  { protocol: "https", hostname: "commons.wikimedia.org" }, // seed/demo product images
  { protocol: "https", hostname: "upload.wikimedia.org" }, // wikimedia's underlying image CDN host
  { protocol: "https", hostname: "placehold.co" }, // branded placeholders where no verified real photo exists
];

if (process.env.NEXT_PUBLIC_IMAGE_HOST) {
  remotePatterns.push({ protocol: "https", hostname: process.env.NEXT_PUBLIC_IMAGE_HOST });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns },
};

module.exports = nextConfig;
