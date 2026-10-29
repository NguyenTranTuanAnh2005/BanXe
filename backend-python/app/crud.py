from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app import models, schemas
from app.auth_utils import hash_password, verify_password


# --- User CRUD & Authentication ---
def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserRegister) -> models.User:
    hashed_pwd = hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name or user.username,
        phone=user.phone,
        role=user.role or "customer",
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[models.User]:
    user = db.query(models.User).filter(
        or_(
            models.User.username == username_or_email,
            models.User.email == username_or_email
        )
    ).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


# --- Car CRUD with Advanced Filters & Description ---
def get_cars(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    fuel_type: Optional[str] = None,
    body_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    sort_by: Optional[str] = None,
    seller_id: Optional[int] = None
) -> List[models.Car]:
    query = db.query(models.Car)
    
    # Text search
    if search:
        query = query.filter(
            or_(
                models.Car.name.ilike(f"%{search}%"),
                models.Car.brand.ilike(f"%{search}%"),
                models.Car.description.ilike(f"%{search}%")
            )
        )
    if brand:
        query = query.filter(models.Car.brand == brand)
    if fuel_type:
        query = query.filter(models.Car.fuel_type == fuel_type)
    if body_type:
        query = query.filter(models.Car.body_type == body_type)
    if min_price is not None:
        query = query.filter(models.Car.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Car.price <= max_price)
    if min_year is not None:
        query = query.filter(models.Car.year >= min_year)
    if max_year is not None:
        query = query.filter(models.Car.year <= max_year)
    if seller_id is not None:
        query = query.filter(models.Car.seller_id == seller_id)

    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(models.Car.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(models.Car.price.desc())
    elif sort_by == 'year_desc':
        query = query.order_by(models.Car.year.desc())
    else:
        query = query.order_by(models.Car.id.desc())

    return query.offset(skip).limit(limit).all()


def get_car_by_id(db: Session, car_id: int) -> Optional[models.Car]:
    return db.query(models.Car).filter(models.Car.id == car_id).first()


def create_car(db: Session, car: schemas.CarCreate) -> models.Car:
    db_car = models.Car(**car.model_dump())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car


def update_car(db: Session, car_id: int, car_update: schemas.CarUpdate) -> Optional[models.Car]:
    db_car = get_car_by_id(db, car_id)
    if not db_car:
        return None
    
    update_data = car_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_car, key, value)

    db.commit()
    db.refresh(db_car)
    return db_car


def delete_car(db: Session, car_id: int) -> bool:
    db_car = get_car_by_id(db, car_id)
    if not db_car:
        return False
    db.delete(db_car)
    db.commit()
    return True


# --- Message CRUD (Khách gửi tin nhắn tới người bán) ---
def create_message(db: Session, message_in: schemas.MessageCreate) -> models.Message:
    # If seller_id not explicitly provided, fetch from car
    seller_id = message_in.seller_id
    if not seller_id:
        car = get_car_by_id(db, message_in.car_id)
        if car and car.seller_id:
            seller_id = car.seller_id

    db_msg = models.Message(
        car_id=message_in.car_id,
        sender_id=message_in.sender_id,
        sender_name=message_in.sender_name,
        sender_phone=message_in.sender_phone,
        sender_email=message_in.sender_email,
        content=message_in.content,
        seller_id=seller_id,
        is_read=0
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


def get_messages(
    db: Session,
    seller_id: Optional[int] = None,
    sender_id: Optional[int] = None,
    car_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Message]:
    query = db.query(models.Message)
    if seller_id is not None:
        # Match messages sent to this seller OR general messages (seller_id IS NULL)
        query = query.filter(or_(models.Message.seller_id == seller_id, models.Message.seller_id == None))
    if sender_id is not None:
        query = query.filter(models.Message.sender_id == sender_id)
    if car_id is not None:
        query = query.filter(models.Message.car_id == car_id)

    return query.order_by(models.Message.id.desc()).offset(skip).limit(limit).all()


def mark_message_read(db: Session, message_id: int) -> Optional[models.Message]:
    msg = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not msg:
        return None
    msg.is_read = 1
    db.commit()
    db.refresh(msg)
    return msg


def reply_message(db: Session, message_id: int, reply_text: str) -> Optional[models.Message]:
    msg = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not msg:
        return None
    msg.reply = reply_text
    msg.is_read = 1
    db.commit()
    db.refresh(msg)
    return msg


def delete_message(db: Session, message_id: int) -> bool:
    msg = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not msg:
        return False
    db.delete(msg)
    db.commit()
    return True


# --- TestDrive CRUD ---
def create_test_drive(db: Session, test_drive: schemas.TestDriveCreate) -> models.TestDrive:
    db_test_drive = models.TestDrive(**test_drive.model_dump())
    db.add(db_test_drive)
    db.commit()
    db.refresh(db_test_drive)
    return db_test_drive


def get_test_drives(db: Session, skip: int = 0, limit: int = 100) -> List[models.TestDrive]:
    return db.query(models.TestDrive).order_by(models.TestDrive.id.desc()).offset(skip).limit(limit).all()


# --- Used Car Valuation Logic ---
def calculate_and_save_valuation(db: Session, valuation_in: schemas.UsedCarValuationCreate) -> models.UsedCarValuation:
    current_year = 2024
    age = max(0, current_year - valuation_in.manufacture_year)
    
    brand_base_prices = {
        "Mercedes-Benz": 2200000000,
        "BMW": 2000000000,
        "Porsche": 6000000000,
        "Toyota": 1100000000,
        "Ford": 950000000,
        "Hyundai": 800000000,
        "Kia": 750000000,
        "Honda": 900000000
    }
    base_val = brand_base_prices.get(valuation_in.brand, 1000000000)

    depreciation_per_year = 0.08  # 8% per year
    mileage_penalty = (valuation_in.mileage_km / 10000) * 0.02 # 2% per 10k km

    condition_multipliers = {
        "Xuất sắc": 1.0,
        "Rất tốt": 0.95,
        "Khá": 0.88,
        "Trung bình": 0.80
    }
    cond_mult = condition_multipliers.get(valuation_in.condition_rating, 0.90)

    estimated_base = base_val * ((1 - depreciation_per_year) ** age) * (1 - mileage_penalty) * cond_mult
    estimated_base = max(100000000, estimated_base) # Min 100M VND

    val_min = round(estimated_base * 0.92, -6)
    val_max = round(estimated_base * 1.08, -6)

    db_valuation = models.UsedCarValuation(
        customer_name=valuation_in.customer_name,
        phone=valuation_in.phone,
        brand=valuation_in.brand,
        model_name=valuation_in.model_name,
        manufacture_year=valuation_in.manufacture_year,
        mileage_km=valuation_in.mileage_km,
        condition_rating=valuation_in.condition_rating,
        estimated_value_min=val_min,
        estimated_value_max=val_max,
        status="Đã định giá"
    )
    db.add(db_valuation)
    db.commit()
    db.refresh(db_valuation)
    return db_valuation


# --- Seed Initial Data (Cars + Users + Demo Accounts) ---
def seed_initial_data(db: Session):
    # 1. Seed initial users if table is empty
    if db.query(models.User).count() == 0:
        demo_users = [
            models.User(
                username="admin",
                email="admin@tuananhauto.vn",
                hashed_password=hash_password("admin123"),
                full_name="Quản Trị Viên Tuấn Anh",
                phone="19006868",
                role="admin"
            ),
            models.User(
                username="nguoiban",
                email="dealer@tuananhauto.vn",
                hashed_password=hash_password("123456"),
                full_name="Tuấn Anh Auto Showroom",
                phone="0988776655",
                role="seller"
            ),
            models.User(
                username="khachhang",
                email="khachhang@gmail.com",
                hashed_password=hash_password("123456"),
                full_name="Nguyễn Văn Khách",
                phone="0912345678",
                role="customer"
            )
        ]
        db.add_all(demo_users)
        db.commit()

    # Get seller user id if exists
    seller_user = db.query(models.User).filter(models.User.role == "seller").first()
    seller_id = seller_user.id if seller_user else None

    # 2. Seed cars if table is empty
    if db.query(models.Car).count() == 0:
        sample_cars = [
            models.Car(
                name="Mercedes-Benz C300 AMG",
                brand="Mercedes-Benz",
                price=2099000000,
                year=2024,
                fuel_type="Xăng",
                body_type="Sedan",
                image_url="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800",
                status="Có sẵn",
                description="Mẫu sedan hạng sang thể thao đỉnh cao với động cơ 2.0L Turbo 258 mã lực, mô-men xoắn 400 Nm, hộp số tự động 9 cấp 9G-TRONIC. Gói ngoại thất thể thao AMG Line, đèn Digital Light tối tân, mâm xe AMG 19 inch đa chấu, cửa sổ trời toàn cảnh Panoramic. Nội thất bọc da cao cấp, hệ thống âm thanh vòm Burmester 3D 15 loa cực đỉnh.",
                seller_id=seller_id,
                contact_phone="0988776655",
                contact_name="Tuấn Anh Auto Showroom"
            ),
            models.Car(
                name="BMW 330i M Sport",
                brand="BMW",
                price=1879000000,
                year=2024,
                fuel_type="Xăng",
                body_type="Sedan",
                image_url="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800",
                status="Có sẵn",
                description="Đỉnh cao cảm giác lái thuần chất xứ Bavaria. Động cơ BMW TwinPower Turbo 2.0L sản sinh 258hp, tăng tốc 0-100 km/h trong 5.8 giây. Trang bị gói thể thao M Sport bao gồm treo thích ứng M, phanh hiệu năng cao M Sport kẹp phanh xanh, vô lăng M và dàn âm thanh vòm Harman Kardon 16 loa công suất 464W.",
                seller_id=seller_id,
                contact_phone="0988776655",
                contact_name="Tuấn Anh Auto Showroom"
            ),
            models.Car(
                name="Porsche Taycan 4S",
                brand="Porsche",
                price=5700000000,
                year=2024,
                fuel_type="Điện",
                body_type="Thể thao",
                image_url="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800",
                status="Có sẵn",
                description="Siêu xe thể thao thuần điện 100% dẫn đầu kỷ nguyên điện hóa. Công suất cực đại lên tới 530 mã lực với Overboost và Launch Control, bứt tốc 0-100 km/h chỉ vỏn vẹn 4.0 giây. Kiến trúc điện áp 800V cho phép sạc từ 5% lên 80% chỉ trong 22.5 phút. Hệ dẫn động 4 bánh toàn thời gian AWD, đánh lái trục sau thông minh.",
                seller_id=seller_id,
                contact_phone="0988776655",
                contact_name="Tuấn Anh Auto Showroom"
            ),
            models.Car(
                name="Toyota Camry 2.5Q",
                brand="Toyota",
                price=1220000000,
                year=2023,
                fuel_type="Hybrid",
                body_type="Sedan",
                image_url="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800",
                status="Có sẵn",
                description="Sedan chuẩn mực dành cho doanh nhân thành đạt. Hệ thống động cơ xăng lai điện Hybrid thế hệ thứ 4 êm ái tuyệt đối, mức tiêu hao nhiên liệu ấn tượng chỉ khoảng 4.4L/100km. Gói công nghệ an toàn chủ động Toyota Safety Sense 2.0, hàng ghế sau chỉnh điện ngả lưng tích hợp cụm điều khiển cảm ứng trung tâm sang trọng.",
                seller_id=seller_id,
                contact_phone="0988776655",
                contact_name="Tuấn Anh Auto Showroom"
            ),
            models.Car(
                name="Ford Ranger Wildtrak 2.0L",
                brand="Ford",
                price=979000000,
                year=2024,
                fuel_type="Dầu",
                body_type="Bán tải",
                image_url="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800",
                status="Có sẵn",
                description="Vua bán tải Việt Nam sở hữu động cơ 2.0L Bi-Turbo Diesel kết hợp hộp số tự động 10 cấp điện tử. Hệ dẫn động 4x4 với 6 chế độ lái địa hình linh hoạt. Màn hình cảm ứng 12 inch SYNC 4A kết nối không dây Apple CarPlay/Android Auto, camera 360 độ sắc nét cùng hệ thống kiểm soát hành trình thích ứng Adaptive Cruise Control.",
                seller_id=seller_id,
                contact_phone="0988776655",
                contact_name="Tuấn Anh Auto Showroom"
            )
        ]
        db.add_all(sample_cars)
        db.commit()
