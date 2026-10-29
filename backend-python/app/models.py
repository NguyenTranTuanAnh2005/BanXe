from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default="customer") # 'customer', 'seller', 'admin'
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cars = relationship("Car", back_populates="seller", cascade="all, delete-orphan", foreign_keys="Car.seller_id")


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    brand = Column(String(50), nullable=False, index=True)
    price = Column(Float, nullable=False)
    year = Column(Integer, nullable=False)
    fuel_type = Column(String(30), nullable=False, default="Xăng")
    body_type = Column(String(50), nullable=True, default="Sedan") # 'Sedan', 'SUV', 'Thể thao', 'Bán tải'
    image_url = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="Có sẵn")
    description = Column(Text, nullable=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_drives = relationship("TestDrive", back_populates="car", cascade="all, delete-orphan")
    seller = relationship("User", back_populates="cars", foreign_keys=[seller_id])
    messages = relationship("Message", back_populates="car", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_name = Column(String(100), nullable=False)
    sender_phone = Column(String(20), nullable=True)
    sender_email = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Integer, default=0) # 0: unread, 1: read
    reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    car = relationship("Car", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    seller = relationship("User", foreign_keys=[seller_id])


class TestDrive(Base):
    __tablename__ = "test_drives"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    preferred_date = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    status = Column(String(30), default="Chờ xác nhận")
    created_at = Column(DateTime, default=datetime.utcnow)

    car = relationship("Car", back_populates="test_drives")


class UsedCarValuation(Base):
    __tablename__ = "used_car_valuations"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    brand = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    manufacture_year = Column(Integer, nullable=False)
    mileage_km = Column(Integer, nullable=False)
    condition_rating = Column(String(50), nullable=False) # 'Rất tốt', 'Khá', 'Trung bình'
    estimated_value_min = Column(Float, nullable=False)
    estimated_value_max = Column(Float, nullable=False)
    status = Column(String(30), default="Chờ định giá")
    created_at = Column(DateTime, default=datetime.utcnow)
