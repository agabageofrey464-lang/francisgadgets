from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.category import Category
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import OrderRead
from app.schemas.product import ProductListItem

router = APIRouter(prefix="/dashboard", tags=["admin-dashboard"], dependencies=[Depends(require_admin)])

LOW_STOCK_THRESHOLD = 5
PAID_STATUSES = (OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED)


class DashboardStats(BaseModel):
    total_sales: Decimal
    orders_count: int
    pending_orders: int
    customers_count: int
    products_count: int
    categories_count: int
    low_stock_products: list[ProductListItem]
    recent_orders: list[OrderRead]


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)) -> DashboardStats:
    total_sales = (
        await db.execute(select(func.coalesce(func.sum(Order.total), 0)).where(Order.status.in_(PAID_STATUSES)))
    ).scalar_one()
    orders_count = (await db.execute(select(func.count()).select_from(Order))).scalar_one()
    pending_orders = (
        await db.execute(select(func.count()).where(Order.status == OrderStatus.PENDING))
    ).scalar_one()
    customers_count = (
        await db.execute(select(func.count()).where(User.role == UserRole.CUSTOMER))
    ).scalar_one()
    products_count = (await db.execute(select(func.count()).select_from(Product))).scalar_one()
    categories_count = (await db.execute(select(func.count()).select_from(Category))).scalar_one()

    low_stock_stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .where(Product.stock_quantity <= LOW_STOCK_THRESHOLD, Product.is_active.is_(True))
        .order_by(Product.stock_quantity.asc())
        .limit(10)
    )
    low_stock_products = (await db.execute(low_stock_stmt)).scalars().all()

    recent_stmt = (
        select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc()).limit(5)
    )
    recent_orders = (await db.execute(recent_stmt)).scalars().all()

    return DashboardStats(
        total_sales=total_sales,
        orders_count=orders_count,
        pending_orders=pending_orders,
        customers_count=customers_count,
        products_count=products_count,
        categories_count=categories_count,
        low_stock_products=[ProductListItem.model_validate(p) for p in low_stock_products],
        recent_orders=[OrderRead.model_validate(o) for o in recent_orders],
    )
