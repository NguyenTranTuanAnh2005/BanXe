from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(
    prefix="/api/cars",
    tags=["Cars Management (CRUD & Smart Search)"]
)


@router.get("", response_model=List[schemas.CarResponse])
def read_cars(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên xe, hãng hoặc mô tả"),
    brand: Optional[str] = Query(None, description="Lọc theo hãng xe"),
    fuel_type: Optional[str] = Query(None, description="Lọc theo loại nhiên liệu"),
    body_type: Optional[str] = Query(None, description="Lọc theo kiểu dáng/dòng xe (Sedan, SUV, Thể thao, Bán tải)"),
    min_price: Optional[float] = Query(None, description="Giá thấp nhất"),
    max_price: Optional[float] = Query(None, description="Giá cao nhất"),
    min_year: Optional[int] = Query(None, description="Năm sản xuất từ"),
    max_year: Optional[int] = Query(None, description="Năm sản xuất đến"),
    sort_by: Optional[str] = Query(None, description="Sắp xếp: price_asc, price_desc, year_desc"),
    seller_id: Optional[int] = Query(None, description="Lọc xe do người bán này đăng"),
    db: Session = Depends(database.get_db)
):
    """Lấy danh sách xe ô tô hỗ trợ Tìm kiếm thông minh và Bộ lọc nhiều tiêu chí."""
    return crud.get_cars(
        db,
        skip=skip,
        limit=limit,
        search=search,
        brand=brand,
        fuel_type=fuel_type,
        body_type=body_type,
        min_price=min_price,
        max_price=max_price,
        min_year=min_year,
        max_year=max_year,
        sort_by=sort_by,
        seller_id=seller_id
    )


@router.get("/{car_id}", response_model=schemas.CarResponse)
def read_car(car_id: int, db: Session = Depends(database.get_db)):
    """Xem chi tiết một chiếc xe ô tô."""
    car = crud.get_car_by_id(db, car_id=car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin xe ô tô này")
    return car


@router.post("", response_model=schemas.CarResponse, status_code=status.HTTP_201_CREATED)
def create_car(car: schemas.CarCreate, db: Session = Depends(database.get_db)):
    """[Admin API] Thêm mới một chiếc xe vào MySQL Database."""
    return crud.create_car(db=db, car=car)


@router.put("/{car_id}", response_model=schemas.CarResponse)
def update_car(car_id: int, car_update: schemas.CarUpdate, db: Session = Depends(database.get_db)):
    """[Admin API] Chỉnh sửa thông tin xe ô tô trong MySQL Database."""
    updated_car = crud.update_car(db=db, car_id=car_id, car_update=car_update)
    if not updated_car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe để cập nhật")
    return updated_car


@router.delete("/{car_id}", status_code=status.HTTP_200_OK)
def delete_car(car_id: int, db: Session = Depends(database.get_db)):
    """[Admin API] Xóa trực tiếp một xe khỏi MySQL Database."""
    success = crud.delete_car(db=db, car_id=car_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe để xóa")
    return {"message": f"Đã xóa thành công xe có ID {car_id} khỏi hệ thống MySQL"}
