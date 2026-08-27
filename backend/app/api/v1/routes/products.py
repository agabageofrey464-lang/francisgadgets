import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.schemas.common import Page
from app.schemas.product import ProductListItem, ProductRead

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=Page[ProductListItem])
async def list_products(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, description="Search term"),
    category_id: int | None = None,
    category_slug: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    in_stock: bool | None = None,
    sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc|name)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[ProductListItem]:
    stmt = select(Product).options(selectinload(Product.images), selectinload(Product.category))
    stmt = stmt.where(Product.is_active.is_(True))

    if q:
        # Shoppers search by model number and part name as often as by product
        # title, so match the description and SKU too.
        term = f"%{q}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.sku.ilike(term),
            )
        )
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if category_slug:
        from app.models.category import Category

        stmt = stmt.join(Category, Product.category_id == Category.id).where(Category.slug == category_slug)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if in_stock:
        stmt = stmt.where(Product.stock_quantity > 0)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    if sort == "price_asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort == "name":
        stmt = stmt.order_by(Product.name.asc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    products = (await db.execute(stmt)).scalars().all()

    # Review aggregates for this page only -- one grouped query, not one per row.
    ratings: dict[int, tuple[float, int]] = {}
    if products:
        rating_stmt = (
            select(Review.product_id, func.avg(Review.rating), func.count(Review.id))
            .where(Review.product_id.in_([p.id for p in products]))
            .group_by(Review.product_id)
        )
        for product_id, average, total in (await db.execute(rating_stmt)).all():
            ratings[product_id] = (float(average), int(total))

    def to_item(product: Product) -> ProductListItem:
        item = ProductListItem.model_validate(product)
        average, total = ratings.get(product.id, (None, 0))
        item.rating_average = average
        item.review_count = total
        return item

    return Page[ProductListItem](
        items=[to_item(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{slug}", response_model=ProductRead)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)) -> Product:
    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .where(Product.slug == slug, Product.is_active.is_(True))
    )
    product = (await db.execute(stmt)).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
