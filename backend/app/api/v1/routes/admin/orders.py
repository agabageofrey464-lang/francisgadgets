import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.order import Order, OrderStatus
from app.schemas.common import Page
from app.schemas.order import OrderCurrencyUpdate, OrderRead, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["admin-orders"], dependencies=[Depends(require_admin)])


@router.get("", response_model=Page[OrderRead])
async def admin_list_orders(
    db: AsyncSession = Depends(get_db),
    status_filter: OrderStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[OrderRead]:
    stmt = select(Order).options(selectinload(Order.items))
    if status_filter is not None:
        stmt = stmt.where(Order.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()

    stmt = stmt.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    orders = (await db.execute(stmt)).scalars().all()

    return Page[OrderRead](
        items=[OrderRead.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{order_id}", response_model=OrderRead)
async def admin_get_order(order_id: int, db: AsyncSession = Depends(get_db)) -> Order:
    stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    order = (await db.execute(stmt)).scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderRead)
async def update_order_status(order_id: int, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)) -> Order:
    stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    order = (await db.execute(stmt)).scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return order


@router.patch("/{order_id}/currency", response_model=OrderRead)
async def update_order_currency(order_id: int, payload: OrderCurrencyUpdate, db: AsyncSession = Depends(get_db)) -> Order:
    stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    order = (await db.execute(stmt)).scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.currency = payload.currency.upper()
    await db.commit()
    await db.refresh(order)
    return order
