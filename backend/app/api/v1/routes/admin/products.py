import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_admin
from app.core.utils import generate_unique_slug
from app.models.product import Product, ProductImage
from app.models.user import User
from app.schemas.common import Page
from app.schemas.product import ProductCreate, ProductListItem, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["admin-products"], dependencies=[Depends(require_admin)])


@router.get("", response_model=Page[ProductListItem])
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[ProductListItem]:
    stmt = select(Product).options(selectinload(Product.images), selectinload(Product.category))
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()

    stmt = stmt.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    products = (await db.execute(stmt)).scalars().all()

    return Page[ProductListItem](
        items=[ProductListItem.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)) -> Product:
    slug = await generate_unique_slug(db, Product, payload.name)
    product = Product(**payload.model_dump(), slug=slug)
    db.add(product)
    await db.commit()

    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .where(Product.id == product.id)
    )
    return (await db.execute(stmt)).scalar_one()


async def _get_product_or_404(db: AsyncSession, product_id: int) -> Product:
    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .where(Product.id == product_id)
    )
    product = (await db.execute(stmt)).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/{product_id}", response_model=ProductRead)
async def admin_get_product(product_id: int, db: AsyncSession = Depends(get_db)) -> Product:
    return await _get_product_or_404(db, product_id)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(product_id: int, payload: ProductUpdate, db: AsyncSession = Depends(get_db)) -> Product:
    product = await _get_product_or_404(db, product_id)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != product.name:
        product.slug = await generate_unique_slug(db, Product, data["name"], exclude_id=product.id)
    for key, value in data.items():
        setattr(product, key, value)
    await db.commit()
    return await _get_product_or_404(db, product_id)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)) -> None:
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await db.delete(product)
    await db.commit()


@router.post("/{product_id}/images", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def add_product_image(
    product_id: int, url: str, alt_text: str | None = None, db: AsyncSession = Depends(get_db)
) -> Product:
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    position = (
        await db.execute(select(func.count()).where(ProductImage.product_id == product_id))
    ).scalar_one()
    db.add(ProductImage(product_id=product_id, url=url, alt_text=alt_text, position=position))
    await db.commit()
    return await _get_product_or_404(db, product_id)


@router.delete("/{product_id}/images/{image_id}", response_model=ProductRead)
async def delete_product_image(product_id: int, image_id: int, db: AsyncSession = Depends(get_db)) -> Product:
    image = await db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    await db.delete(image)
    await db.commit()
    return await _get_product_or_404(db, product_id)
