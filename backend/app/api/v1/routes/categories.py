from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.schemas.category import CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


async def _attach_counts_and_images(db: AsyncSession, categories: list[Category]) -> list[CategoryRead]:
    count_rows = await db.execute(
        select(Product.category_id, func.count())
        .where(Product.is_active.is_(True))
        .group_by(Product.category_id)
    )
    counts = dict(count_rows.all())

    image_rows = await db.execute(
        select(Product.category_id, ProductImage.url)
        .join(ProductImage, ProductImage.product_id == Product.id)
        .where(Product.is_active.is_(True), ProductImage.position == 0)
        .order_by(Product.category_id, Product.created_at.asc())
    )
    images: dict[int, str] = {}
    for category_id, url in image_rows.all():
        images.setdefault(category_id, url)

    results = []
    for category in categories:
        item = CategoryRead.model_validate(category)
        item.product_count = counts.get(category.id, 0)
        item.image_url = images.get(category.id)
        results.append(item)
    return results


@router.get("", response_model=list[CategoryRead])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryRead]:
    result = await db.execute(select(Category).order_by(Category.name.asc()))
    return await _attach_counts_and_images(db, list(result.scalars().all()))


@router.get("/{slug}", response_model=CategoryRead)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)) -> CategoryRead:
    category = (await db.execute(select(Category).where(Category.slug == slug))).scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return (await _attach_counts_and_images(db, [category]))[0]
