from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.profile import Profile
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.profile import OnboardingRequest
from app.core.stages import STAGE
from app.core.jwt import create_access_token

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post("/complete")
def complete_onboarding(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 🚫 Prevent duplicate onboarding
    existing_profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Onboarding already completed"
        )

    # ✅ Create profile with all new fields
    profile = Profile(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        mobile_number=data.mobile_number,
        education_level=data.education_level,
        major=data.major,
        graduation_year=data.graduation_year,
        ielts_score=data.ielts_score,
        toefl_score=data.toefl_score,
        sop_status=data.sop_status,
        lor_status=data.lor_status,
        target_degree=data.target_degree,
        target_field=data.target_field,
        target_country=data.target_country,
        budget_range=data.budget_range,
        is_complete=True
    )

    # 🔄 Update user stage
    user.stage = STAGE.DISCOVERY

    db.add(profile)
    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ Generate new token with updated stage
    new_token = create_access_token(user.id, user.email, user.stage)

    return {
        "message": "Onboarding completed successfully",
        "stage": user.stage,
        "access_token": new_token,
        "token_type": "bearer"
    }


@router.put("/profile/", name="update_profile")
def update_profile(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update user profile after onboarding."""
    
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Complete onboarding first."
        )

    # Update personal info
    profile.first_name = data.first_name
    profile.last_name = data.last_name
    profile.mobile_number = data.mobile_number

    # Update education
    profile.education_level = data.education_level
    profile.major = data.major
    profile.graduation_year = data.graduation_year

    # Update test scores
    profile.ielts_score = data.ielts_score
    profile.toefl_score = data.toefl_score

    # Update application status
    profile.sop_status = data.sop_status
    profile.lor_status = data.lor_status

    # Update targets
    profile.target_degree = data.target_degree
    profile.target_field = data.target_field
    profile.target_country = data.target_country
    profile.budget_range = data.budget_range

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "mobile_number": profile.mobile_number,
            "education_level": profile.education_level,
            "major": profile.major,
            "graduation_year": profile.graduation_year,
            "ielts_score": profile.ielts_score,
            "toefl_score": profile.toefl_score,
            "sop_status": profile.sop_status,
            "lor_status": profile.lor_status,
            "target_degree": profile.target_degree,
            "target_field": profile.target_field,
            "target_country": profile.target_country,
            "budget_range": profile.budget_range,
            "is_complete": profile.is_complete,
        }
    }
