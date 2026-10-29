from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(
    prefix="/api/messages",
    tags=["Messages (Tin nhắn liên hệ người bán)"]
)


@router.post("", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(message_in: schemas.MessageCreate, db: Session = Depends(database.get_db)):
    """
    Gửi tin nhắn liên hệ từ khách hàng đến người đăng bán xe.
    """
    # Verify car exists
    car = crud.get_car_by_id(db, message_in.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu xe ô tô này để gửi tin nhắn")

    new_msg = crud.create_message(db, message_in=message_in)
    
    # Enrich with car_name for response
    response_data = schemas.MessageResponse.model_validate(new_msg)
    response_data.car_name = car.name
    return response_data


@router.get("", response_model=List[schemas.MessageResponse])
def get_messages(
    seller_id: Optional[int] = Query(None, description="Lọc tin nhắn gửi đến người bán này"),
    sender_id: Optional[int] = Query(None, description="Lọc tin nhắn do khách hàng này gửi"),
    car_id: Optional[int] = Query(None, description="Lọc tin nhắn theo mẫu xe cụ thể"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """
    Lấy danh sách tin nhắn khách hàng gửi cho người bán hoặc xe.
    """
    msgs = crud.get_messages(
        db,
        seller_id=seller_id,
        sender_id=sender_id,
        car_id=car_id,
        skip=skip,
        limit=limit
    )

    results = []
    for m in msgs:
        resp = schemas.MessageResponse.model_validate(m)
        if m.car:
            resp.car_name = m.car.name
        results.append(resp)
    return results


@router.put("/{message_id}/read", response_model=schemas.MessageResponse)
def mark_read(message_id: int, db: Session = Depends(database.get_db)):
    """Đánh dấu tin nhắn đã được đọc."""
    msg = crud.mark_message_read(db, message_id=message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin nhắn này")
    resp = schemas.MessageResponse.model_validate(msg)
    if msg.car:
        resp.car_name = msg.car.name
    return resp


@router.put("/{message_id}/reply", response_model=schemas.MessageResponse)
def reply_message(message_id: int, reply_data: schemas.MessageReply, db: Session = Depends(database.get_db)):
    """Người bán phản hồi tin nhắn của khách hàng."""
    msg = crud.reply_message(db, message_id=message_id, reply_text=reply_data.reply)
    if not msg:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin nhắn này")
    resp = schemas.MessageResponse.model_validate(msg)
    if msg.car:
        resp.car_name = msg.car.name
    return resp


@router.delete("/{message_id}", status_code=status.HTTP_200_OK)
def delete_message(message_id: int, db: Session = Depends(database.get_db)):
    """Xóa tin nhắn."""
    success = crud.delete_message(db, message_id=message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin nhắn để xóa")
    return {"message": "Đã xóa tin nhắn thành công"}
