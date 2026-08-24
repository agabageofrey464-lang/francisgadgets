from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.order import OrderStatus
from app.schemas.user import AddressBase


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    email: EmailStr
    phone: str
    items: list[OrderItemCreate] = Field(min_length=1)
    shipping_address: AddressBase
    shipping_fee: Decimal = Decimal("0")


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    unit_price: Decimal
    quantity: int
    subtotal: Decimal


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    email: EmailStr
    phone: str
    status: OrderStatus
    currency: str
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    shipping_address: dict
    payment_provider: str | None
    payment_reference: str | None
    paid_at: datetime | None
    created_at: datetime
    items: list[OrderItemRead] = []


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderCurrencyUpdate(BaseModel):
    currency: str = Field(min_length=3, max_length=3)
