import {
  Cctv,
  Cpu,
  Headphones,
  Laptop,
  MapPin,
  Monitor,
  Package,
  Printer,
  Router,
  Smartphone,
  Speaker,
  Tablet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** One icon per category slug, shared by the rail, the tiles and image fallbacks. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  "feature-phones": Smartphone,
  tablets: Tablet,
  laptops: Laptop,
  desktops: Cpu,
  monitors: Monitor,
  printers: Printer,
  scanners: Printer,
  networking: Router,
  "cctv-security-cameras": Cctv,
  "gps-trackers": MapPin,
  audio: Headphones,
  "sound-bars": Speaker,
  "phone-accessories": Package,
  "computer-accessories": Package,
  "installation-services": Wrench,
};

export function categoryIcon(slug: string | undefined | null): LucideIcon {
  return (slug && CATEGORY_ICONS[slug]) || Package;
}
