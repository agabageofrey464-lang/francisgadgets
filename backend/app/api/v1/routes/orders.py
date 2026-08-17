from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.core.utils import generate_order_number
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> Order:
    product_ids = [item.product_id for item in payload.items]
    products = (
        (await db.execute(select(Product).where(Product.id.in_(product_ids)))).scalars().all()
    )
    products_by_id = {p.id: p for p in products}

    order_items: list[OrderItem] = []
    subtotal = Decimal("0")
    for item in payload.items:
        product = products_by_id.get(item.product_id)
        if product is None or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {item.product_id} is not available"
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {product.name}"
            )
        line_subtotal = product.price * item.quantity
        subtotal += line_subtotal
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=item.quantity,
                subtotal=line_subtotal,
            )
        )
        product.stock_quantity -= item.quantity

    total = subtotal + payload.shipping_fee

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id if current_user else None,
        email=payload.email,
        phone=payload.phone,
        currency=settings.DEFAULT_CURRENCY,
        subtotal=subtotal,
        shipping_fee=payload.shipping_fee,
        total=total,
        shipping_address=payload.shipping_address.model_dump(),
        items=order_items,
    )
    db.add(order)
    await db.commit()

    stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    return (await db.execute(stmt)).scalar_one()


@router.get("/me", response_model=list[OrderRead])
async def list_my_orders(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


@router.get("/{order_number}", response_model=OrderRead)
async def get_order(
    order_number: str,
    email: str | None = Query(default=None, description="Required for guest order lookup"),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> Order:
    stmt = select(Order).options(selectinload(Order.items)).where(Order.order_number == order_number)
    order = (await db.execute(stmt)).scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    is_owner = current_user is not None and order.user_id == current_user.id
    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    is_verified_guest = email is not None and email.lower() == order.email.lower()

    if not (is_owner or is_admin or is_verified_guest):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this order")

    return order
