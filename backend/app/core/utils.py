import secrets
from datetime import datetime, timezone

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def generate_unique_slug(db: AsyncSession, model, text: str, exclude_id: int | None = None) -> str:
    base_slug = slugify(text)[:200] or "item"
    slug = base_slug
    attempt = 0
    while True:
        stmt = select(model.id).where(model.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(model.id != exclude_id)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing is None:
            return slug
        attempt += 1
        slug = f"{base_slug}-{secrets.token_hex(3)}"
        if attempt > 10:
            return f"{base_slug}-{int(datetime.now(timezone.utc).timestamp())}"


def generate_order_number() -> str:
    stamp = datetime.now(timezone.utc).strftime("%y%m%d")
    return f"FGT-{stamp}-{secrets.token_hex(3).upper()}"


def generate_payment_reference() -> str:
    return f"FGT-PAY-{secrets.token_hex(8).upper()}"
