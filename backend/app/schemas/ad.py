from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ad import AdPlacement


class AdBase(BaseModel):
    advertiser_name: str = Field(min_length=1, max_length=150)
    image_url: str
    link_url: str
    placement: AdPlacement
    starts_at: datetime
    ends_at: datetime
    is_active: bool = True


class AdCreate(AdBase):
    pass


class AdUpdate(BaseModel):
    advertiser_name: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    placement: AdPlacement | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool | None = None


class AdRead(AdBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    click_count: int
    impression_count: int
    created_at: datetime
