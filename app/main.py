# app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.models.otp import OTP
from app.models.profile import Profile
from app.api.api_router import api_router
from app.core.dependencies import get_current_user
import uvicorn
import os

app = FastAPI(
    title="AI Counsellor API",
    version="1.0.0"
)

# -------------------------
# Database Tables (Dev only)
# -------------------------
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database tables might already exist: {e}")

# -------------------------
# CORS Configuration
# -------------------------

ALLOWED_ORIGINS = [
    # Local development
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",

    # ✅ Vercel frontend (IMPORTANT)
    "https://ai-counsellor-rarau81-prathams-projects-384c2258.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Health & Infra Checks
# -------------------------

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    with engine.connect() as conn:
        return {"database": "connected"}

# -------------------------
# Protected Test Route
# -------------------------

@app.get("/protected")
def protected_route(current_user=Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user": current_user
    }

# -------------------------
# API Routers
# -------------------------

app.include_router(api_router)

# -------------------------
# Local Run Support
# -------------------------

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
