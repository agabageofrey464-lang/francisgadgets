from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.ad import Ad, AdPlacement
from app.schemas.ad import AdRead

router = APIRouter(prefix="/ads", tags=["ads"])


@router.get("", response_model=list[AdRead])
async def list_active_ads(
    placement: AdPlacement = Query(...), db: AsyncSession = Depends(get_db)
) -> list[Ad]:
    now = datetime.now(timezone.utc)
    stmt = select(Ad).where(
        Ad.placement == placement,
        Ad.is_active.is_(True),
        Ad.starts_at <= now,
        Ad.ends_at >= now,
    )
    ads = (await db.execute(stmt)).scalars().all()
    for ad in ads:
        ad.impression_count += 1
    await db.commit()
    return list(ads)


@router.post("/{ad_id}/click", status_code=status.HTTP_204_NO_CONTENT)
async def record_ad_click(ad_id: int, db: AsyncSession = Depends(get_db)) -> None:
    ad = await db.get(Ad, ad_id)
    if ad is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad not found")
    ad.click_count += 1
    await db.commit()
