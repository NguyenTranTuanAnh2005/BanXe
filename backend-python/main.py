import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.crud import seed_initial_data
from app.routers import cars, test_drives, valuations, chatbot, auth, messages

# Auto create database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

# Seed initial car catalog and demo users data
with SessionLocal() as session:
    seed_initial_data(session)

app = FastAPI(
    title="TuanAnh Auto API Service",
    description="Hệ thống Backend FastAPI chính quản lý ô tô, tài khoản khách hàng & người bán, đăng bài kèm mô tả, tin nhắn liên hệ, AI Chatbot (gemma3:1b)",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(messages.router)
app.include_router(test_drives.router)
app.include_router(valuations.router)
app.include_router(chatbot.router)


@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "service": "TuanAnh Auto FastAPI Backend Service",
        "docs_url": "http://localhost:8000/docs"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
