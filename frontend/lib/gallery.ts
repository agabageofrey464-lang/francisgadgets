/**
 * What appears on /gallery.
 *
 * To add a photo: drop the file in `frontend/public/gallery/` and add one
 * entry below. Nothing else needs changing -- the filter chips build
 * themselves from whatever categories are present.
 *
 * Keep captions honest. A photo of a product we sell is not a photo of a job
 * we did, and a shopper can tell the difference.
 */

export type GalleryCategory = "CCTV & Security" | "Shop" | "Installations" | "Stock";

export interface GalleryItem {
  src: string;
  /** Describes the photo for screen readers and when the image fails. */
  alt: string;
  caption: string;
  category: GalleryCategory;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  // Manufacturer imagery for the security systems we supply and fit. Labelled
  // as such -- these are the kit, not photographs of our own installations.
  {
    src: "/banners/Hikvision-ultra-series-PTZ-pc.jpg",
    alt: "Hikvision Ultra series PTZ camera",
    caption: "Hikvision Ultra series PTZ -- supplied and fitted",
    category: "CCTV & Security",
  },
  {
    src: "/banners/TandemVu-PTZ-pc.jpg",
    alt: "Hikvision TandemVu PTZ camera",
    caption: "TandemVu PTZ, for sites needing colour at night",
    category: "CCTV & Security",
  },
  {
    src: "/banners/deepinviewx-top-pc-banner.jpg",
    alt: "Hikvision DeepinView camera range",
    caption: "DeepinView range for business premises",
    category: "CCTV & Security",
  },
  {
    src: "/banners/Deepinview-banner.png",
    alt: "Hikvision DeepinView camera",
    caption: "DeepinView -- number plate and people counting",
    category: "CCTV & Security",
  },
  {
    src: "/banners/Hikvision-Anti-corrosion-series-camera-pc-banner.jpg",
    alt: "Hikvision anti-corrosion series camera",
    caption: "Anti-corrosion series, for coastal and industrial sites",
    category: "CCTV & Security",
  },
  {
    src: "/banners/AOV-SolarVu-Cameras_homepage-banner.jpg",
    alt: "AOV SolarVu solar powered camera",
    caption: "SolarVu solar cameras, for sites without mains power",
    category: "CCTV & Security",
  },
];

/** Only the categories that actually have photos, in a sensible order. */
export function galleryCategories(items: GalleryItem[] = GALLERY_ITEMS): GalleryCategory[] {
  const order: GalleryCategory[] = ["Shop", "Installations", "CCTV & Security", "Stock"];
  const present = new Set(items.map((item) => item.category));
  return order.filter((category) => present.has(category));
}
