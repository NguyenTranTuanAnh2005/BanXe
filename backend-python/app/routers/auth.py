from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication (Register & Login)"]
)


@router.post("/register", response_model=schemas.UserLoginResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(database.get_db)):
    """
    Đăng ký tài khoản người dùng mới (Khách hàng hoặc Người bán xe).
    - role: 'customer' (Khách hàng tìm mua xe)
    - role: 'seller' (Người bán / Đại lý đăng tin bán xe)
    """
    existing_username = crud.get_user_by_username(db, username=user_in.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác."
        )

    existing_email = crud.get_user_by_email(db, email=user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ Email này đã được đăng ký trong hệ thống."
        )

    # Default role to customer if not specified
    if not user_in.role or user_in.role not in ["customer", "seller", "admin"]:
        user_in.role = "customer"

    new_user = crud.create_user(db, user=user_in)
    token = f"tuananh_token_{new_user.id}_{new_user.role}"

    return {
        "token": token,
        "user": new_user
    }


@router.post("/login", response_model=schemas.UserLoginResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """
    Đăng nhập hệ thống bằng Tên đăng nhập (hoặc Email) và Mật khẩu.
    Hỗ trợ cả Khách hàng, Người bán xe và Admin.
    """
    user = crud.authenticate_user(
        db,
        username_or_email=login_data.username_or_email,
        password=login_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập / Email hoặc Mật khẩu không chính xác."
        )

    token = f"tuananh_token_{user.id}_{user.role}"

    return {
        "token": token,
        "user": user
    }


@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Lấy danh sách tài khoản trong hệ thống."""
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/user/{user_id}", response_model=schemas.UserResponse)
def get_user_detail(user_id: int, db: Session = Depends(database.get_db)):
    """Lấy thông tin chi tiết một tài khoản theo ID."""
    user = crud.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản này")
    return user
