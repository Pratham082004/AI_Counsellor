from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    create_user_with_otp,
    authenticate_user,
    verify_otp as verify_otp_service,
    resend_otp as resend_otp_service,
)
from app.db.session import SessionLocal
from app.core.jwt import create_access_token
from app.core.dependencies import get_current_user
from app.core.stages import STAGE
from app.models.user import User
from app.models.profile import Profile

router = APIRouter(prefix="/auth", tags=["Auth"])


class OTPVerifyRequest(BaseModel):
    email: str
    code: str


class SignupResponse(BaseModel):
    message: str


class ResendOtpRequest(BaseModel):
    email: str


class ResendOtpResponse(BaseModel):
    message: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=SignupResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    created = create_user_with_otp(db, user_data.email, user_data.password)
    if not created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return {"message": "User created. Please verify OTP sent to your email."}


@router.post("/verify-otp")
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = verify_otp_service(db, payload.email, payload.code)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    return {
        "message": "OTP verified successfully.",
        "email": user.email,
    }


@router.post("/resend-otp", response_model=ResendOtpResponse)
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    ok, msg = resend_otp_service(db, payload.email)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=msg,
        )

    return {"message": msg}

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "stage": user.stage
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "stage": user.stage
        }
    }

@router.get("/me")
def get_current_user_info(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user info including profile."""
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    profile_data = None
    if profile:
        # Return clean profile data without SQLAlchemy internal fields
        profile_data = {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "education_level": profile.education_level,
            "major": profile.major,
            "graduation_year": profile.graduation_year,
            "gpa": profile.gpa,
            "ielts_score": profile.ielts_score,
            "toefl_score": profile.toefl_score,
            "gre_score": profile.gre_score,
            "gmat_score": profile.gmat_score,
            "target_degree": profile.target_degree,
            "target_field": profile.target_field,
            "target_country": profile.target_country,
            "target_intake": profile.target_intake,
            "budget_range": profile.budget_range,
            "funding_plan": profile.funding_plan,
            "is_complete": profile.is_complete,
        }
    
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "stage": user.stage
        },
        "profile": profile_data
    }


@router.post("/debug/set-stage")
def set_user_stage(
    new_stage: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """DEBUG ONLY: Set user stage manually. For testing purposes."""
    try:
        stage_enum = STAGE(new_stage.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage. Valid stages: {[s.value for s in STAGE]}"
        )
    
    old_stage = user.stage
    user.stage = stage_enum
    db.commit()
    
    # Create new token with updated stage
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "stage": user.stage
        }
    )
    
    return {
        "message": f"Stage updated from {old_stage} to {user.stage}",
        "old_stage": old_stage,
        "new_stage": user.stage,
        "access_token": access_token
    }
