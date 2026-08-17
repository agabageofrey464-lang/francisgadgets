from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.ad import Ad
from app.schemas.ad import AdCreate, AdRead, AdUpdate

router = APIRouter(prefix="/ads", tags=["admin-ads"], dependencies=[Depends(require_admin)])


@router.get("", response_model=list[AdRead])
async def list_ads(db: AsyncSession = Depends(get_db)) -> list[Ad]:
    result = await db.execute(select(Ad).order_by(Ad.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=AdRead, status_code=status.HTTP_201_CREATED)
async def create_ad(payload: AdCreate, db: AsyncSession = Depends(get_db)) -> Ad:
    ad = Ad(**payload.model_dump())
    db.add(ad)
    await db.commit()
    await db.refresh(ad)
    return ad


async def _get_ad_or_404(db: AsyncSession, ad_id: int) -> Ad:
    ad = await db.get(Ad, ad_id)
    if ad is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad not found")
    return ad


@router.patch("/{ad_id}", response_model=AdRead)
async def update_ad(ad_id: int, payload: AdUpdate, db: AsyncSession = Depends(get_db)) -> Ad:
    ad = await _get_ad_or_404(db, ad_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ad, key, value)
    await db.commit()
    await db.refresh(ad)
    return ad


@router.delete("/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ad(ad_id: int, db: AsyncSession = Depends(get_db)) -> None:
    ad = await _get_ad_or_404(db, ad_id)
    await db.delete(ad)
    await db.commit()
