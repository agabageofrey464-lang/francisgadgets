"""Downloads remote catalogue photos into the frontend's public/ folder.

Hotlinking someone else's CDN is not a foundation for a storefront: wikimedia
rate-limits to HTTP 429 as soon as a grid of a dozen products loads at once, and
rejects clients whose User-Agent it does not like. Serving the same photos from
our own origin removes the dependency entirely -- no 429s, no 403s, no latency
spike on every product grid.

Files land in `frontend/public/products/` and rows are rewritten to the
same-origin path `/products/<file>`, which `next/image` serves without an
external fetch.

Placeholder URLs (placehold.co) are left alone on purpose: they are not photos,
and the storefront already draws its own branded "Photo coming soon" tile for
them.

Usage:
    python scripts/localize_images.py             # download + rewrite
    python scripts/localize_images.py --dry-run   # report only
"""

import asyncio
import mimetypes
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.append(str(Path(__file__).resolve().parent.parent))

import httpx
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.product import Product, ProductImage

PUBLIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "products"

# Same policy-compliant UA the resolver uses -- wikimedia 403s anything else.
HEADERS = {
    "User-Agent": (
        "FrancisGadgetsTechnologies/1.0 "
        "(https://francisgadgetstechnologies.com; info@francisgadgetstechnologies.com)"
    )
}

# Spacing between downloads. Wikimedia returns 429 on rapid bursts, and this
# script is the last time we ever have to ask them for these files.
DELAY_SECONDS = 1.0
MAX_ATTEMPTS = 3

SKIP_SUBSTRINGS = ("placehold",)


def is_remote(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def should_localize(url: str) -> bool:
    return is_remote(url) and not any(s in url for s in SKIP_SUBSTRINGS)


def extension_for(url: str, content_type: str | None) -> str:
    suffix = Path(unquote(urlparse(url).path)).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    guessed = mimetypes.guess_extension(content_type.split(";")[0].strip()) if content_type else None
    return ".jpg" if guessed in {None, ".jpe"} else guessed


def filename_for(product_slug: str, position: int, extension: str) -> str:
    stem = re.sub(r"[^a-z0-9]+", "-", product_slug.lower()).strip("-") or "product"
    suffix = "" if position == 0 else f"-{position + 1}"
    return f"{stem}{suffix}{extension}"


async def download(client: httpx.AsyncClient, url: str) -> tuple[bytes, str | None] | None:
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            resp = await client.get(url, follow_redirects=True)
        except httpx.HTTPError as exc:
            print(f"    attempt {attempt}: network error: {exc}")
        else:
            if resp.status_code == 200:
                return resp.content, resp.headers.get("content-type")
            print(f"    attempt {attempt}: HTTP {resp.status_code}")
            if resp.status_code == 429:
                # Backing off is the whole point -- give it room.
                await asyncio.sleep(DELAY_SECONDS * attempt * 4)
                continue
        await asyncio.sleep(DELAY_SECONDS * attempt)
    return None


async def main() -> None:
    dry_run = "--dry-run" in sys.argv

    if not dry_run:
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    async with AsyncSessionLocal() as db:
        products = (
            (await db.execute(select(Product).options(selectinload(Product.images)))).scalars().all()
        )

        targets: list[tuple[Product, ProductImage]] = [
            (product, image)
            for product in products
            for image in product.images
            if should_localize(image.url)
        ]

        if not targets:
            print("Every catalogue photo is already served locally -- nothing to do.")
            return

        print(f"{len(targets)} remote photo(s) to bring in-house.\n")

        # The same file backs several rows; download once, reuse the local path.
        by_url: dict[str, str] = {}
        failures: list[str] = []

        async with httpx.AsyncClient(headers=HEADERS, timeout=60.0) as client:
            for i, (product, image) in enumerate(targets, start=1):
                if image.url in by_url:
                    if not dry_run:
                        image.url = by_url[image.url]
                    continue

                print(f"[{i}/{len(targets)}] {product.slug}")
                result = await download(client, image.url)

                if result is None:
                    print("    !! giving up; leaving the remote URL in place")
                    failures.append(image.url)
                    continue

                content, content_type = result
                name = filename_for(product.slug, image.position, extension_for(image.url, content_type))
                local_path = f"/products/{name}"

                if not dry_run:
                    (PUBLIC_DIR / name).write_bytes(content)
                    image.url = local_path

                by_url[image.url] = local_path
                print(f"    -> public{local_path}  ({len(content) // 1024} KB)")
                await asyncio.sleep(DELAY_SECONDS)

        if not dry_run:
            await db.commit()

        print(f"\nBrought in-house: {len(by_url)}   failed: {len(failures)}")
        for url in failures:
            print(f"  - {url}")
        if dry_run:
            print("\nDry run -- nothing downloaded, database not modified.")
        else:
            print(f"\nFiles written to {PUBLIC_DIR}")
            print(
                "NOTE: wikimedia photos are freely licensed but most require attribution "
                "(CC BY-SA). Self-hosting does not remove that obligation -- credit the "
                "sources, or replace these with your own product photos before launch."
            )


if __name__ == "__main__":
    asyncio.run(main())
