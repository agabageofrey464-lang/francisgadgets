"""Rebuilds the full catalogue from `catalogue_data.py`.

Use this on a fresh clone. `seed.py` creates the admin user and a small starter
catalogue; this restores the real one -- every category, product, photo and ad
exactly as exported from a working machine.

Safe to re-run: products are matched on SKU (falling back to slug), so running
it twice updates rather than duplicates.

    python scripts/seed_catalogue.py
    python scripts/seed_catalogue.py --dry-run
"""

import asyncio
import pathlib
import sys
from datetime import datetime

HERE = pathlib.Path(__file__).resolve().parent
sys.path.append(str(HERE.parent))
sys.path.append(str(HERE))

from sqlalchemy import select  # noqa: E402

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.ad import Ad  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.product import Product, ProductImage  # noqa: E402

try:
    import catalogue_data
except ModuleNotFoundError:
    sys.exit("catalogue_data.py is missing -- run scripts/export_catalogue.py on a machine that has the catalogue")

DRY = "--dry-run" in sys.argv


async def main() -> None:
    created_c = updated_c = created_p = updated_p = created_a = 0

    async with AsyncSessionLocal() as db:
        # --- categories -------------------------------------------------
        by_slug = {c.slug: c for c in (await db.execute(select(Category))).scalars().all()}
        for row in catalogue_data.CATEGORIES:
            existing = by_slug.get(row["slug"])
            if existing is None:
                category = Category(name=row["name"], slug=row["slug"], description=row["description"])
                db.add(category)
                by_slug[row["slug"]] = category
                created_c += 1
            else:
                existing.name = row["name"]
                existing.description = row["description"]
                updated_c += 1
        if not DRY:
            await db.flush()

        # --- products ---------------------------------------------------
        products = (await db.execute(select(Product))).scalars().all()
        by_sku = {p.sku: p for p in products if p.sku}
        by_pslug = {p.slug: p for p in products}

        for row in catalogue_data.PRODUCTS:
            existing = by_sku.get(row["sku"]) if row["sku"] else None
            if existing is None:
                existing = by_pslug.get(row["slug"])

            category = by_slug.get(row["category_slug"])
            fields = dict(
                name=row["name"],
                slug=row["slug"],
                description=row["description"],
                price=row["price"],
                compare_at_price=row["compare_at_price"],
                sku=row["sku"],
                stock_quantity=row["stock_quantity"],
                is_active=row["is_active"],
                category_id=category.id if category is not None else None,
            )

            if existing is None:
                product = Product(**fields)
                db.add(product)
                created_p += 1
            else:
                for key, value in fields.items():
                    setattr(existing, key, value)
                product = existing
                updated_p += 1

            if DRY:
                continue

            await db.flush()

            # images are declarative: replace whatever is there with the export
            for image in (
                await db.execute(select(ProductImage).where(ProductImage.product_id == product.id))
            ).scalars().all():
                await db.delete(image)
            for img in row["images"]:
                db.add(
                    ProductImage(
                        product_id=product.id,
                        url=img["url"],
                        alt_text=img["alt_text"],
                        position=img["position"],
                    )
                )

        # --- ads --------------------------------------------------------
        existing_ads = {
            (a.advertiser_name, str(a.placement.value if hasattr(a.placement, "value") else a.placement))
            for a in (await db.execute(select(Ad))).scalars().all()
        }
        for row in catalogue_data.ADS:
            if (row["advertiser_name"], row["placement"]) in existing_ads:
                continue
            if not DRY:
                # the export stores timestamps as text; the column wants datetimes
                fields = dict(row)
                for key in ("starts_at", "ends_at"):
                    if isinstance(fields.get(key), str):
                        fields[key] = datetime.fromisoformat(fields[key])
                db.add(Ad(**fields))
            created_a += 1

        if not DRY:
            await db.commit()

    print("categories  created %d, updated %d" % (created_c, updated_c))
    print("products    created %d, updated %d" % (created_p, updated_p))
    print("ads         created %d" % created_a)
    if DRY:
        print("\nDry run -- nothing written.")
    else:
        print("\nCatalogue restored. Start the API and the shop is as it was.")


if __name__ == "__main__":
    asyncio.run(main())
