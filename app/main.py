# app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.models.user import User  # ensure model is imported so metadata is registered
from app.models.otp import OTP    # ensure OTP table is registered
from app.models.profile import Profile  # ensure Profile table is registered
from app.api.api_router import api_router
from app.core.dependencies import get_current_user
import uvicorn

app = FastAPI(
    title="AI Counsellor API",
    version="1.0.0"
)

# -------------------------
# Database Tables (Dev)
# -------------------------

# Create tables automatically in development if they don't exist.
# In production, you should manage schema via migrations instead.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database tables might already exist: {e}")

# -------------------------
# CORS (Frontend Access)
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        # Common dev ports (Vite / Create React App / custom)
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        # Additional ports for development
        "http://127.0.0.1:61866",
        "http://localhost:61866",
        "http://127.0.0.1:55662",
        "http://localhost:55662",
    ],
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
    """
    Allows running directly:
        python app/main.py

    Recommended for development:
        python -m uvicorn app.main:app --reload
    """
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
