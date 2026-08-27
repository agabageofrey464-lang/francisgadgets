from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryRead


class ProductImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    alt_text: str | None
    position: int


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0)
    compare_at_price: Decimal | None = None
    sku: str | None = None
    stock_quantity: int = Field(ge=0, default=0)
    category_id: int | None = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    compare_at_price: Decimal | None = None
    sku: str | None = None
    stock_quantity: int | None = None
    category_id: int | None = None
    is_active: bool | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    images: list[ProductImageRead] = []
    category: CategoryRead | None = None

    @property
    def in_stock(self) -> bool:
        return self.stock_quantity > 0


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price: Decimal
    compare_at_price: Decimal | None
    stock_quantity: int
    is_active: bool
    images: list[ProductImageRead] = []
    category: CategoryRead | None = None
    # Filled in by the listing endpoint; 0 review_count means "never rated",
    # which the storefront renders as no stars rather than as zero stars.
    rating_average: float | None = None
    review_count: int = 0
