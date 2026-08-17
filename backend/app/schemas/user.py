from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime


class UserUpdateMe(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class AddressBase(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: str | None = None
    city: str
    state: str
    country: str = "Uganda"
    postal_code: str | None = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressRead(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
