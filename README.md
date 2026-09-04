# TuanAnh Auto - Website Bán Xe Ô Tô Full-stack & AI Chatbot

Hệ thống website thương mại điện tử chuyên cung cấp dịch vụ giới thiệu, bán xe ô tô chính hãng, tính chi phí lăn bánh, định giá xe cũ thu cũ đổi mới và trợ lý **AI Chatbot (Ollama gemma3:1b)** cho **TuanAnh Auto**.

## 🏗 Kiến trúc Hệ thống

Dự án được phân chia thành các phân hệ chính:

1. **`frontend/`**: Ứng dụng React.js kết hợp thư viện giao diện Ant Design (`antd`).
   - Showroom xem danh sách xe, tìm kiếm thông minh, so sánh xe, tính giá lăn bánh, lái thử.
   - **AI Chatbot Widget**: Tích hợp trợ lý tư vấn xe thông minh trực tiếp trên giao diện.
   - Trang **Admin Dashboard** quản lý trực tiếp dữ liệu MySQL (Xem, Thêm, Sửa, Xóa) ngay trên Table & Form của Ant Design.
2. **`backend-python/`** (Backend chính - 90% logic): Python FastAPI + SQLAlchemy + MySQL.
   - Quản lý dữ liệu xe (CRUD, Lọc xe theo hãng/giá/nhiên liệu).
   - Đăng ký lái thử & Định giá ước tính xe cũ.
   - REST API cho AI Chatbot kết nối mô hình local **Ollama (`gemma3:1b`)**.
3. **`backend-node/`** (Backend phụ - 10% logic): Node.js + Express.js.
   - Đảm nhận xử lý upload hình ảnh xe & dịch vụ thông báo real-time.

---

## 📁 Cấu trúc Thư mục

```text
BanXe(Python chính)/
├── .gitignore
├── README.md
├── database.sql            # Script SQL khởi tạo MySQL Database mẫu
├── backend-python/         # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py    # Kết nối MySQL bằng SQLAlchemy
│   │   ├── models.py      # ORM Models (User, Car, TestDrive, UsedCarValuation)
│   │   ├── schemas.py     # Pydantic Schemas
│   │   ├── crud.py        # Thao tác DB CRUD
│   │   └── routers/       # API Route Handlers
│   │       ├── cars.py
│   │       ├── test_drives.py
│   │       ├── valuations.py
│   │       └── chatbot.py  # Router AI Chatbot Ollama (gemma3:1b)
│   ├── main.py            # Entry point ứng dụng FastAPI (Port 8000)
│   └── requirements.txt   # Dependencies Python
├── backend-node/           # Express Backend (Upload & Notification)
│   ├── package.json
│   └── server.js          # Entry point Server Node.js (Port 5000)
└── frontend/               # React + Ant Design Frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx        # Giao diện chính (Tabs Khách hàng, Admin & Chatbot AI)
        ├── index.css      # CSS Tông màu sáng trang nhã & Responsive Dạng Dọc
        ├── main.jsx
        └── components/    # Thành phần giao diện Ant Design
            ├── Navbar.jsx
            ├── CarList.jsx
            ├── AdminDashboard.jsx
            ├── ChatbotWidget.jsx
            ├── CarCompareModal.jsx
            ├── OnRoadCalculatorModal.jsx
            ├── TestDriveModal.jsx
            └── UsedCarValuationModal.jsx
```

---

## 🚀 Hướng dẫn Khởi chạy Dự án (Chi tiết & Đầy đủ)

### ⚠️ Tiền đề (Prerequisite)
Trước khi khởi chạy backend-python, đảm bảo máy tính đã cài đặt Python:
1. Tải Python 3.12+ từ trang chủ: [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. ⚠️ **QUAN TRỌNG**: Khi khởi chạy installer, tích chọn ô **`Add python.exe to PATH`** ở góc dưới màn hình trước khi nhấn **Install Now**.

---

### 1. Khởi tạo Database MySQL
- Nạp file `database.sql` vào MySQL Server (qua MySQL Workbench, phpMyAdmin hoặc Command Line):
  ```sql
  SOURCE database.sql;
  ```

---

### 2. Kích hoạt AI Chatbot (Ollama Local - Tùy chọn)
- Mở cửa sổ **CMD** (Command Prompt) và chạy lệnh:
  ```cmd
  ollama run gemma3:1b
  ```

---

### 3. Chạy Backend Python (FastAPI - Port 8000)
Mở cửa sổ **Terminal 1**:
```bash
cd backend-python

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# Khởi chạy server FastAPI
python main.py
```
> 📍 Swagger Documentation sẵn sàng tại: `http://localhost:8000/docs`

---

### 4. Chạy Backend Node.js (Express - Port 5000)
Mở cửa sổ **Terminal 2**:
```bash
cd backend-node

# Cài đặt gói thư viện (Đã cài đặt sẵn)
npm install

# Khởi chạy server Node
npm start
```
> 📍 Backend Node sẵn sàng tại: `http://localhost:5000`

---

### 5. Chạy Frontend (React + Ant Design - Port 5173)
Mở cửa sổ **Terminal 3**:
```bash
cd frontend

# Cài đặt thư viện React & Antd (Đã cài đặt sẵn)
npm install

# Chạy ứng dụng Frontend
npm run dev
```
> 🌐 Truy cập website tại: `http://localhost:5173` để trải nghiệm ứng dụng.

