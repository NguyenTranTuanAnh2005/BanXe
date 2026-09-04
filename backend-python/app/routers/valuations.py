from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas, database

router = APIRouter(
    prefix="/api/valuations",
    tags=["Used Car Valuations"]
)


@router.post("", response_model=schemas.UsedCarValuationResponse, status_code=status.HTTP_201_CREATED)
def calculate_used_car_valuation(
    valuation_in: schemas.UsedCarValuationCreate,
    db: Session = Depends(database.get_db)
):
    """Tính toán khoảng giá ước tính cho xe cũ và lưu thông tin đăng ký định giá."""
    return crud.calculate_and_save_valuation(db=db, valuation_in=valuation_in)
