import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AdPlacement(str, enum.Enum):
    HOMEPAGE_TOP = "homepage_top"
    HOMEPAGE_MID = "homepage_mid"
    PRODUCT_LIST = "product_list"
    SIDEBAR = "sidebar"


class AdMediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class Ad(Base):
    __tablename__ = "ads"

    id: Mapped[int] = mapped_column(primary_key=True)
    advertiser_name: Mapped[str] = mapped_column(String(150), nullable=False)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[AdMediaType] = mapped_column(
        Enum(AdMediaType, name="ad_media_type"), nullable=False, default=AdMediaType.IMAGE
    )
    link_url: Mapped[str] = mapped_column(String(500), nullable=False)
    placement: Mapped[AdPlacement] = mapped_column(Enum(AdPlacement, name="ad_placement"), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    click_count: Mapped[int] = mapped_column(default=0, nullable=False)
    impression_count: Mapped[int] = mapped_column(default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
