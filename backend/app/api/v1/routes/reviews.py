from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=list[ReviewRead])
async def list_reviews(product_id: int = Query(...), db: AsyncSession = Depends(get_db)) -> list[Review]:
    stmt = (
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


@router.post("/products/{product_id}", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = (
        await db.execute(
            select(Review).where(Review.product_id == product_id, Review.user_id == current_user.id)
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already reviewed this product")

    review = Review(product_id=product_id, user_id=current_user.id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    await db.commit()

    stmt = select(Review).options(selectinload(Review.user)).where(Review.id == review.id)
    return (await db.execute(stmt)).scalar_one()
