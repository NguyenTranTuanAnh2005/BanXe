from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    role: Optional[str] = "customer" # 'customer', 'seller', 'admin'
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserLoginResponse(BaseModel):
    token: str
    user: UserResponse


# --- Car Schemas ---
class CarBase(BaseModel):
    name: str = Field(..., example="Toyota Camry 2.5Q")
    brand: str = Field(..., example="Toyota")
    price: float = Field(..., example=1200000000)
    year: int = Field(..., example=2024)
    fuel_type: str = Field(default="Xăng", example="Xăng")
    body_type: Optional[str] = Field(default="Sedan", example="Sedan")
    image_url: Optional[str] = Field(default=None, example="https://images.unsplash.com/photo-1552519507-da3b142c6e3d")
    status: str = Field(default="Có sẵn", example="Có sẵn")
    description: Optional[str] = Field(default=None, example="Mẫu sedan hạng D cao cấp, bảo dưỡng chính hãng.")
    seller_id: Optional[int] = Field(default=None, example=1)
    contact_phone: Optional[str] = Field(default=None, example="0912345678")
    contact_name: Optional[str] = Field(default=None, example="Đại Lý Tuấn Anh")

class CarCreate(CarBase):
    pass

class CarUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None
    body_type: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    seller_id: Optional[int] = None
    contact_phone: Optional[str] = None
    contact_name: Optional[str] = None

class CarResponse(CarBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Message Schemas ---
class MessageCreate(BaseModel):
    car_id: int
    sender_id: Optional[int] = None
    sender_name: str
    sender_phone: Optional[str] = None
    sender_email: Optional[str] = None
    content: str
    seller_id: Optional[int] = None

class MessageReply(BaseModel):
    reply: str

class MessageResponse(BaseModel):
    id: int
    car_id: int
    car_name: Optional[str] = None
    sender_id: Optional[int] = None
    sender_name: str
    sender_phone: Optional[str] = None
    sender_email: Optional[str] = None
    content: str
    seller_id: Optional[int] = None
    is_read: int = 0
    reply: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- TestDrive Schemas ---
class TestDriveCreate(BaseModel):
    customer_name: str
    phone: str
    car_id: int
    preferred_date: str
    note: Optional[str] = None

class TestDriveResponse(TestDriveCreate):
    id: int
    status: str
    created_at: datetime
    car: Optional[CarResponse] = None

    class Config:
        from_attributes = True


# --- UsedCarValuation Schemas ---
class UsedCarValuationCreate(BaseModel):
    customer_name: str
    phone: str
    brand: str
    model_name: str
    manufacture_year: int
    mileage_km: int
    condition_rating: str

class UsedCarValuationResponse(UsedCarValuationCreate):
    id: int
    estimated_value_min: float
    estimated_value_max: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
