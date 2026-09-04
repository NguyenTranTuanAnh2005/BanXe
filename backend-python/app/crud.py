from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app import models, schemas


# --- Car CRUD with Advanced Filters ---
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
    sort_by: Optional[str] = None
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
    # Algorithmic Market Estimation based on year, brand, mileage & condition
    current_year = 2024
    age = max(0, current_year - valuation_in.manufacture_year)
    
    # Base estimated new price approximation based on brand
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

    # Depreciation factors
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

    val_min = round(estimated_base * 0.92, -6) # round to millions
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


# --- Seed Sample Data ---
def seed_initial_data(db: Session):
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
                description="Mẫu sedan hạng sang thể thao với động cơ 2.0L Turbo 258 mã lực, gói ngoại thất AMG năng động."
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
                description="Thiết kế đậm chất thể thao, vận hành mạnh mẽ linh hoạt chuẩn cảm giác lái BMW."
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
                description="Xe thể thao thuần điện 100% đẳng cấp thế giới, tăng tốc 0-100 km/h chỉ trong 4.0s."
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
                description="Sedan sang trọng tiết kiệm nhiên liệu tối ưu với động cơ Hybrid tiên tiến."
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
                description="Vua bán tải đa dụng, công nghệ hiện đại vượt trội và khả năng off-road đỉnh cao."
            )
        ]
        db.add_all(sample_cars)
        db.commit()
