from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, database

router = APIRouter(
    prefix="/api/test-drives",
    tags=["Test Drive Requests"]
)


@router.post("", response_model=schemas.TestDriveResponse, status_code=status.HTTP_201_CREATED)
def request_test_drive(test_drive: schemas.TestDriveCreate, db: Session = Depends(database.get_db)):
    """Khách hàng gửi yêu cầu đăng ký lái thử xe."""
    # Check if target car exists
    car = crud.get_car_by_id(db, car_id=test_drive.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Mẫu xe bạn chọn không tồn tại trong hệ thống.")
    return crud.create_test_drive(db=db, test_drive=test_drive)


@router.get("", response_model=List[schemas.TestDriveResponse])
def get_all_test_drives(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """[Admin API] Lấy danh sách yêu cầu đăng ký lái thử."""
    return crud.get_test_drives(db=db, skip=skip, limit=limit)
