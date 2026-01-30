from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import uuid

from app.db.session import get_db
from app.models.profile import Profile
from app.models.shortlist import Shortlist
from app.models.locked_university import LockedUniversity
from app.models.university import University
from app.models.user import User
from app.models.cached_recommendation import CachedRecommendation
from app.core.dependencies import get_current_user
from app.core.stages import STAGE
from app.services.ai_service import get_university_recommendations

router = APIRouter(prefix="/universities", tags=["University Discovery"])


def _generate_university_id(name: str) -> str:
    """Generate a unique ID from university name."""
    return name.replace(' ', '_').lower()[:50]


def _save_ai_universities_to_db(db: Session, universities: List[Dict], user_id: uuid.UUID) -> List[Dict]:
    """
    Save AI-generated universities to the database so they can be shortlisted.
    Returns the updated university list with database UUIDs.
    """
    saved_universities = []
    
    for uni in universities:
        uni_name = uni.get("name", "Unknown University")
        
        # Check if university already exists in database
        existing = db.query(University).filter(University.name.ilike(uni_name)).first()
        
        if existing:
            # Use existing university
            saved_universities.append({
                **uni,
                "id": str(existing.id),
            })
        else:
            # Create new university record
            new_uni = University(
                id=uuid.uuid4(),
                name=uni_name,
                country=uni.get("country", "Unknown"),
                degree=uni.get("degree", "Bachelors"),
                field=uni.get("field", "Various"),
                tuition_min=int(uni.get("estimated_tuition", 20000)),
                tuition_max=int(uni.get("estimated_tuition", 20000)) + 10000,
                difficulty=uni.get("difficulty", "MEDIUM").upper(),
                generated_by_ai=True,
            )
            db.add(new_uni)
            db.flush()  # Get the ID without committing
            
            saved_universities.append({
                **uni,
                "id": str(new_uni.id),
            })
    
    db.commit()
    return saved_universities


@router.get("/discover")
def discover_universities(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Discover personalized university recommendations using AI based on user's profile."""
    # Stage enforcement - allow access from DISCOVERY, SHORTLISTING, LOCKED, or APPLICATION stages
    allowed_stages = [STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]
    if user.stage not in allowed_stages:
        raise HTTPException(
            status_code=403,
            detail="You must complete onboarding to access university discovery"
        )

    # Fetch profile
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="User profile not found"
        )

    print(f"[University Discovery] Getting AI recommendations for user {user.id}")
    
    # Get university recommendations from AI
    universities = get_university_recommendations(
        budget_range=profile.budget_range,
        target_country=profile.target_country,
        target_field=profile.target_field,
        target_degree=profile.target_degree,
        major=profile.major,
    )
    
    if not universities:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate university recommendations. Please try again later."
        )

    print(f"[University Discovery] AI returned {len(universities)} universities")

    # Save AI universities to database so they can be shortlisted
    universities = _save_ai_universities_to_db(db, universities, user.id)

    # Process and enrich university data
    result_universities = []
    for uni in universities:
        # Ensure all required fields are present
        uni_data = {
            "id": uni.get("id"),  # Now contains database UUID
            "name": uni.get("name", "Unknown University"),
            "country": uni.get("country", "Unknown"),
            "degree": uni.get("degree", profile.target_degree or "Bachelors"),
            "field": uni.get("field", profile.target_field or profile.major or "Various"),
            "estimated_tuition": str(uni.get("estimated_tuition", 0)),
            "difficulty": uni.get("difficulty", "MEDIUM").upper(),
            "is_shortlisted": False,
        }
        result_universities.append(uni_data)

    # Get shortlisted university IDs for this user
    shortlisted_ids = set(
        s.university_id for s in 
        db.query(Shortlist).filter(Shortlist.user_id == user.id).all()
    )
    
    # Mark shortlisted universities
    for uni in result_universities:
        if uni.get("id") in shortlisted_ids:
            uni["is_shortlisted"] = True
    
    # Limit to 12 universities
    result_universities = result_universities[:12]
    
    return {
        "count": len(result_universities),
        "universities": result_universities,
        "cached": False,
        "source": "ai_recommendation"
    }


@router.post("/lock/{university_id}")
def lock_university_by_name(
    university_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Lock a university by ID. User must be in SHORTLISTING stage."""
    # Stage enforcement
    if user.stage != STAGE.SHORTLISTING:
        raise HTTPException(status_code=403, detail="User must be in SHORTLISTING stage")

    # Find university by ID (can be UUID or string ID)
    uni = None
    try:
        # Try as UUID first
        uid = uuid.UUID(university_id)
        uni = db.query(University).filter(University.id == uid).first()
    except (ValueError, TypeError):
        # Fall back to string ID lookup
        uni = db.query(University).filter(University.id == university_id).first()

    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    # Verify university is in user's shortlist
    shortlist_item = (
        db.query(Shortlist)
        .filter(Shortlist.user_id == user.id, Shortlist.university_id == uni.id)
        .first()
    )

    if not shortlist_item:
        raise HTTPException(status_code=403, detail="University must be in shortlist before locking")

    # Prevent multiple locks
    existing_lock = db.query(LockedUniversity).filter(LockedUniversity.user_id == user.id).first()
    if existing_lock:
        raise HTTPException(status_code=400, detail="You already have a locked university")

    # Prepare university snapshot
    uni_data = {
        "id": str(uni.id),
        "name": uni.name,
        "country": uni.country,
        "degree": uni.degree,
        "field": uni.field,
        "estimated_tuition": (uni.tuition_min + uni.tuition_max) // 2,
        "difficulty": uni.difficulty,
    }

    locked = LockedUniversity(
        user_id=user.id,
        university_id=uni.id,
        university_data=uni_data,
    )

    db.add(locked)

    # Transition to LOCKED stage
    user.stage = STAGE.LOCKED
    db.commit()

    return {"message": "University locked", "locked_university": uni_data, "stage": user.stage}


@router.post('/discover/refresh')
def refresh_discovery(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Clear cached recommendations and fetch fresh ones from AI."""
    # Allow refresh from DISCOVERY, SHORTLISTING, LOCKED, or APPLICATION stages
    allowed_stages = [STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]
    if user.stage not in allowed_stages:
        raise HTTPException(status_code=403, detail="You must complete onboarding to access university discovery")

    # Get previously shown university IDs to exclude them
    previous_cached = (
        db.query(CachedRecommendation)
        .filter(CachedRecommendation.user_id == user.id)
        .all()
    )
    previous_university_names = set(rec.university_name for rec in previous_cached)

    # Clear existing cached recommendations for this user
    db.query(CachedRecommendation).filter(CachedRecommendation.user_id == user.id).delete()
    db.commit()

    # Fetch profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="User profile not found")

    print(f"[University Discovery] Refreshing AI recommendations for user {user.id}")
    
    # Get fresh university recommendations from AI
    universities = get_university_recommendations(
        budget_range=profile.budget_range,
        target_country=profile.target_country,
        target_field=profile.target_field,
        target_degree=profile.target_degree,
        major=profile.major,
    )

    if not universities:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate university recommendations. Please try again later."
        )

    # Save AI universities to database so they can be shortlisted
    universities = _save_ai_universities_to_db(db, universities, user.id)

    # Get shortlisted university IDs for this user
    shortlisted_ids = set(
        s.university_id for s in
        db.query(Shortlist).filter(Shortlist.user_id == user.id).all()
    )

    # Process and filter universities
    result_universities = []
    for uni in universities:
        uni_name = uni.get("name", "Unknown University")
        
        # Skip if previously shown
        if uni_name in previous_university_names:
            continue
            
        # Skip if shortlisted (optional - can include if desired)
        if uni.get("id") in shortlisted_ids:
            continue
        
        uni_data = {
            "id": uni.get("id"),
            "name": uni_name,
            "country": uni.get("country", "Unknown"),
            "degree": uni.get("degree", profile.target_degree or "Bachelors"),
            "field": uni.get("field", profile.target_field or profile.major or "Various"),
            "estimated_tuition": str(uni.get("estimated_tuition", 0)),
            "difficulty": uni.get("difficulty", "MEDIUM").upper(),
            "is_shortlisted": False,
        }
        result_universities.append(uni_data)
        
        if len(result_universities) >= 12:
            break

    # If we don't have enough fresh universities, add some from the original list
    if len(result_universities) < 3 and len(universities) > len(result_universities):
        for uni in universities:
            uni_name = uni.get("name", "Unknown University")
            if uni.get("id") not in shortlisted_ids:
                if not any(u["name"] == uni_name for u in result_universities):
                    result_universities.append({
                        "id": uni.get("id"),
                        "name": uni_name,
                        "country": uni.get("country", "Unknown"),
                        "degree": uni.get("degree", profile.target_degree or "Bachelors"),
                        "field": uni.get("field", profile.target_field or profile.major or "Various"),
                        "estimated_tuition": str(uni.get("estimated_tuition", 0)),
                        "difficulty": uni.get("difficulty", "MEDIUM").upper(),
                        "is_shortlisted": False,
                    })
            if len(result_universities) >= 12:
                break

    # Limit to 12 universities
    result_universities = result_universities[:12]

    return {
        "count": len(result_universities),
        "universities": result_universities,
        "cached": False,
        "source": "ai_recommendation"
    }

