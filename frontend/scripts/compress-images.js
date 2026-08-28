/**
 * Recompresses the catalogue photos in public/products/.
 *
 * The downloaded originals are full-resolution Commons uploads -- several are
 * 4000px+ and over a megabyte each, which is dead weight in git and pointless
 * on a page whose largest product image renders around 700px. next/image
 * resizes on the fly anyway, so the stored file only needs to be big enough to
 * be the source for that.
 *
 * Filenames and extensions are preserved, so nothing in the database or in
 * seed.py needs repointing.
 *
 * Usage:
 *   node scripts/compress-images.js            # compress in place
 *   node scripts/compress-images.js --dry-run  # report savings only
 */

const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "products");
const MAX_EDGE = 1600; // generous headroom above the largest rendered size
const JPEG_QUALITY = 80;
const DRY = process.argv.includes("--dry-run");

function kb(bytes) {
  return Math.round(bytes / 1024);
}

async function main() {
  const files = (await fs.readdir(DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log("No images found in", DIR);
    return;
  }

  let before = 0;
  let after = 0;
  let skipped = 0;
  const grew = [];

  for (const file of files) {
    const full = path.join(DIR, file);
    const original = await fs.readFile(full);
    before += original.length;

    const ext = path.extname(file).toLowerCase();
    let pipeline = sharp(original).rotate(); // honour EXIF orientation

    const meta = await sharp(original).metadata();
    if (Math.max(meta.width || 0, meta.height || 0) > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true, effort: 8 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: JPEG_QUALITY });
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });
    }

    // A download can be subtly malformed ("Invalid SOS parameters" and friends).
    // One bad file must not abort the run for the other 160.
    let output;
    try {
      output = await pipeline.toBuffer();
    } catch (err) {
      console.log(`  ${file.padEnd(52)} SKIPPED - ${String(err.message).slice(0, 46)}`);
      after += original.length;
      skipped += 1;
      continue;
    }

    // Never write a file that got bigger -- some are already well optimised.
    if (output.length >= original.length) {
      after += original.length;
      skipped += 1;
      grew.push(file);
      continue;
    }

    after += output.length;
    if (!DRY) await fs.writeFile(full, output);

    const saved = Math.round((1 - output.length / original.length) * 100);
    console.log(
      `  ${file.padEnd(52)} ${String(kb(original.length)).padStart(5)} KB -> ${String(
        kb(output.length)
      ).padStart(5)} KB  (-${saved}%)`
    );
  }

  console.log(
    `\n${files.length} file(s): ${kb(before)} KB -> ${kb(after)} KB ` +
      `(saved ${kb(before - after)} KB, ${Math.round((1 - after / before) * 100)}%)`
  );
  if (skipped) console.log(`left alone (already optimal): ${skipped} -- ${grew.join(", ")}`);
  if (DRY) console.log("\nDry run -- no files written.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
