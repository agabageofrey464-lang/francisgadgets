"""Rewrites wikimedia `Special:FilePath` image URLs to their direct CDN URLs.

`https://commons.wikimedia.org/wiki/Special:FilePath/<name>` is a *redirect*
endpoint. It costs two redirects per image, rate-limits hard (HTTP 429) once a
page asks for a dozen of them at once, and times out under any real traffic --
so product photos render as broken boxes. The file it redirects to lives on
`upload.wikimedia.org`, which serves the bytes directly and reliably.

This resolves each one once and stores the direct URL, keeping the photos the
catalogue was seeded with rather than swapping in unrelated pictures.

Usage:
    python scripts/resolve_image_urls.py            # rewrite the database
    python scripts/resolve_image_urls.py --dry-run  # report only, change nothing
    python scripts/resolve_image_urls.py --print-map  # emit a python dict for seed.py
"""

import asyncio
import sys
from pathlib import Path
from urllib.parse import urlparse, urlunparse

sys.path.append(str(Path(__file__).resolve().parent.parent))

import httpx
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.product import ProductImage

REDIRECT_MARKER = "commons.wikimedia.org/wiki/Special:FilePath"

# Wikimedia's User-Agent policy requires a tool name AND contact details; a
# generic or browser-like UA is answered with HTTP 403. This is also why the
# images failed in the browser: Next's image optimizer sends its own UA, which
# Wikimedia rejects -- one more reason to store the direct upload.* URL, which
# is served from a CDN that does not apply this check.
HEADERS = {
    "User-Agent": (
        "FrancisGadgetsTechnologies/1.0 "
        "(https://francisgadgetstechnologies.com; info@francisgadgetstechnologies.com)"
    )
}

# Polite spacing between requests -- this is someone else's free CDN.
DELAY_SECONDS = 0.4


def strip_tracking(url: str) -> str:
    """Wikimedia appends utm_* params on redirect; they are noise in a stored URL."""
    parts = urlparse(url)
    return urlunparse(parts._replace(query=""))


async def resolve(client: httpx.AsyncClient, url: str) -> str | None:
    """Follow the redirect chain and return the direct CDN URL, or None if it fails."""
    try:
        resp = await client.get(url, follow_redirects=True)
    except httpx.HTTPError as exc:
        print(f"  !! network error: {exc}")
        return None

    if resp.status_code != 200:
        print(f"  !! HTTP {resp.status_code}")
        return None

    final = strip_tracking(str(resp.url))
    if "upload.wikimedia.org" not in final:
        print(f"  !! unexpected host: {final}")
        return None
    return final


async def main() -> None:
    dry_run = "--dry-run" in sys.argv
    print_map = "--print-map" in sys.argv

    async with AsyncSessionLocal() as db:
        images = (
            (await db.execute(select(ProductImage).where(ProductImage.url.contains(REDIRECT_MARKER))))
            .scalars()
            .all()
        )

        if not images:
            print("No Special:FilePath URLs left in the catalogue -- nothing to do.")
            return

        print(f"Found {len(images)} image(s) using the redirect endpoint.\n")

        resolved: dict[str, str] = {}
        failed: list[str] = []

        async with httpx.AsyncClient(headers=HEADERS, timeout=30.0) as client:
            for i, image in enumerate(images, start=1):
                original = image.url

                # The same file can back several rows; resolve each URL once.
                if original in resolved:
                    image.url = resolved[original]
                    continue

                print(f"[{i}/{len(images)}] {original.rsplit('/', 1)[-1][:70]}")
                direct = await resolve(client, original)

                if direct is None:
                    failed.append(original)
                else:
                    resolved[original] = direct
                    if not dry_run:
                        image.url = direct
                    print(f"  -> {direct}")

                await asyncio.sleep(DELAY_SECONDS)

        if not dry_run:
            await db.commit()

        print(f"\nResolved {len(resolved)} unique URL(s); {len(failed)} could not be resolved.")
        if failed:
            print("Left unchanged (they will render as the 'Photo coming soon' tile):")
            for url in failed:
                print(f"  - {url}")
        if dry_run:
            print("\nDry run -- database not modified.")

        if print_map:
            print("\n# --- paste into scripts/seed.py as RESOLVED_WIKI_URLS ---")
            print("RESOLVED_WIKI_URLS = {")
            for original, direct in sorted(resolved.items()):
                filename = original.split("Special:FilePath/", 1)[1].split("?", 1)[0]
                print(f'    "{filename}": "{direct}",')
            print("}")


if __name__ == "__main__":
    asyncio.run(main())
