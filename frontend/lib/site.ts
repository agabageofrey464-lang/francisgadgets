export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://francisgadgetstechnologies.com").replace(/\/$/, "");
export const SITE_NAME = "Francis Gadgets Technologies";
export const SITE_DESCRIPTION =
  "Genuine phones, laptops, desktops, CCTV & security cameras, GPS trackers and computer accessories -- fast delivery across Uganda.";

/**
 * What a product shows as its picture.
 *
 *   false -- the drawn house illustration (current default)
 *   true  -- the photograph stored against the product
 *
 * The photographs are NOT deleted when this is false: every one is still in the
 * database and on disk under `frontend/public/products/`. This only decides
 * what gets rendered, so flipping it back is instant and lossless.
 *
 * It is false today because most stored photos show a similar device rather
 * than the actual unit on the shelf (a Nokia keypad phone for a Tecno one), and
 * a wrong photo misleads a buyer in a way an illustration does not. Set it to
 * true once real product photography is in place -- or override per product
 * with ProductThumb's `preferPhoto` prop.
 */
export const SHOW_PRODUCT_PHOTOS = false;
