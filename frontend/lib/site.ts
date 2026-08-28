export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://francisgadgetstechnologies.com").replace(/\/$/, "");
export const SITE_NAME = "Francis Gadgets Technologies";
export const SITE_DESCRIPTION =
  "Genuine phones, laptops, desktops, CCTV & security cameras, GPS trackers and computer accessories -- fast delivery across Uganda.";

/**
 * What a product shows as its picture.
 *
 *   true  -- the photograph stored against the product (current default),
 *            falling back to the drawn illustration where a product has no
 *            usable photo, so nothing ever renders as a broken box
 *   false -- the drawn illustration for every product
 *
 * The photographs are never deleted by this setting: every one stays in the
 * database and on disk under `frontend/public/products/`. It only decides what
 * gets rendered, so switching is instant and lossless either way.
 *
 * Per-product override: pass ProductThumb's `preferPhoto` prop.
 */
export const SHOW_PRODUCT_PHOTOS = true;
