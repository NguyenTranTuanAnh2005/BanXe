import json
import urllib.request
import urllib.error
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Car

router = APIRouter(prefix="/api/chat", tags=["Chatbot AI"])

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "gemma3:1b"


class ChatMessage(BaseModel):
    role: str  # 'user', 'assistant', 'system'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@router.get("/status")
def check_ollama_status():
    """Kiểm tra xem dịch vụ Ollama API và model gemma3:1b có đang chạy tại http://localhost:11434 hay không."""
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags", headers={"User-Agent": "FastAPI-Backend"})
        with urllib.request.urlopen(req, timeout=3.0) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                models = [m.get("name", "") for m in data.get("models", [])]
                
                # Check if gemma3:1b or gemma is in installed models
                has_gemma = any("gemma3:1b" in m.lower() or "gemma3" in m.lower() or "gemma" in m.lower() for m in models)
                
                return {
                    "online": True,
                    "ollama_url": OLLAMA_URL,
                    "target_model": DEFAULT_MODEL,
                    "available_models": models,
                    "gemma3_ready": has_gemma,
                    "message": "Dịch vụ Ollama đã sẵn sàng!" if has_gemma else f"Ollama đang chạy nhưng chưa thấy model '{DEFAULT_MODEL}'. Hãy gõ: ollama run gemma3:1b trong CMD."
                }
    except Exception as e:
        return {
            "online": False,
            "ollama_url": OLLAMA_URL,
            "target_model": DEFAULT_MODEL,
            "gemma3_ready": False,
            "message": "Chưa kết nối Ollama local. Vui lòng mở CMD và chạy lệnh: ollama run gemma3:1b",
            "error_details": str(e)
        }


@router.post("")
def chat_with_gemma(payload: ChatRequest, db: Session = Depends(get_db)):
    """Gửi câu hỏi tư vấn ô tô đến mô hình Ollama gemma3:1b."""
    user_prompt = payload.message.strip()
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Vui lòng nhập nội dung câu hỏi.")

    # 1. Fetch current car catalog context from DB
    try:
        cars = db.query(Car).all()
        car_summary_list = []
        for car in cars:
            price_formatted = f"{car.price:,.0f} VND" if car.price else "Liên hệ"
            body = getattr(car, 'body_type', 'Sedan') or 'Sedan'
            car_summary_list.append(f"- {car.name} ({car.brand}, Dòng: {body}, Đời {car.year}, Giá: {price_formatted}, Động cơ: {car.fuel_type}, Trạng thái: {car.status})")
        
        cars_context_str = "\n".join(car_summary_list) if car_summary_list else "Đang cập nhật danh mục xe."
    except Exception as e:
        cars_context_str = "Danh mục xe sang chính hãng Mercedes-Benz, BMW, Porsche, Toyota, Ford."

    # 2. Build System Prompt with Showroom Context
    system_prompt = (
        "Bạn là Trợ lý AI Thông Minh chuyên tư vấn bán xe ô tô của Showroom TuanAnh Auto.\n"
        "Thông tin Showroom TuanAnh Auto:\n"
        "- Địa chỉ: 88 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội.\n"
        "- Hotline: 1900 6868 - 0988 999 888 (Phục vụ 24/7).\n"
        "- Chính sách: Bảo hành 5 năm chính hãng, Hỗ trợ vay trả góp 0% lãi suất lên tới 85% giá trị xe, Đăng ký lái thử miễn phí, Định giá xe cũ trợ giá thu cũ đổi mới.\n\n"
        f"Danh sách các mẫu xe ô tô hiện có tại kho Showroom TuanAnh Auto:\n{cars_context_str}\n\n"
        "Nhiệm vụ của bạn: Trả lời ngắn gọn, thân thiện, lịch sự, chính xác bằng tiếng Việt. "
        "Gợi ý mẫu xe phù hợp với nhu cầu và ngân sách của khách hàng, giải đáp chi tiết về chi phí lăn bánh, thủ tục mua xe và khuyến mãi."
    )

    # 3. Construct message array for Ollama Chat API
    ollama_messages = [{"role": "system", "content": system_prompt}]

    # Append previous history if provided
    if payload.history:
        for msg in payload.history[-6:]:  # Keep last 6 exchanges for context
            ollama_messages.append({"role": msg.role, "content": msg.content})

    ollama_messages.append({"role": "user", "content": user_prompt})

    ollama_payload = {
        "model": DEFAULT_MODEL,
        "messages": ollama_messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9
        }
    }

    # 4. Invoke Ollama REST API
    try:
        json_data = json.dumps(ollama_payload).encode('utf-8')
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/chat",
            data=json_data,
            headers={"Content-Type": "application/json", "User-Agent": "FastAPI-Backend"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=30.0) as response:
            if response.status == 200:
                res_body = json.loads(response.read().decode('utf-8'))
                ai_reply = res_body.get("message", {}).get("content", "")
                if not ai_reply:
                    ai_reply = "Dịch vụ AI Gemma3 trả về phản hồi rỗng. Vui lòng thử lại."
                
                return {
                    "success": True,
                    "reply": ai_reply,
                    "model": DEFAULT_MODEL,
                    "source": "Ollama Local (gemma3:1b)"
                }
            else:
                raise HTTPException(status_code=500, detail=f"Ollama trả về mã lỗi HTTP {response.status}")

    except urllib.error.URLError as url_err:
        # Fallback when Ollama server is not running
        fallback_msg = (
            f"⚠️ Chưa kết nối được với mô hình AI Ollama `{DEFAULT_MODEL}` trên máy tính của bạn.\n\n"
            "👉 **Hướng dẫn kích hoạt trong 3 giây:**\n"
            "1. Mở cửa sổ **CMD** (Command Prompt) hoặc Terminal.\n"
            "2. Chạy lệnh: `ollama run gemma3:1b`\n"
            "3. Sau khi mô hình khởi chạy thành công, hãy gửi lại câu hỏi tại đây!"
        )
        return {
            "success": False,
            "reply": fallback_msg,
            "model": DEFAULT_MODEL,
            "offline": True,
            "error_info": str(url_err)
        }
    except Exception as ex:
        return {
            "success": False,
            "reply": f"Lỗi xử lý tin nhắn: {str(ex)}. Hãy chắc chắn đã chạy lệnh `ollama run gemma3:1b` trong CMD.",
            "model": DEFAULT_MODEL,
            "offline": True
        }
