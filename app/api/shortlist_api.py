from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.shortlist import Shortlist
from app.models.locked_university import LockedUniversity
from app.models.university import University
from app.models.user import User
from app.models.application_checklist import ApplicationChecklist
from app.core.dependencies import get_current_user
from app.core.stages import STAGE
from app.core.jwt import create_access_token

router = APIRouter(prefix="/shortlist", tags=["Shortlist"])


@router.post("/{university_id}")
def add_to_shortlist(
    university_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Try to find university by ID (can be UUID or string ID)
    uni = None
    try:
        # Try as UUID first
        uid = UUID(university_id)
        uni = db.query(University).filter(University.id == uid).first()
    except (ValueError, TypeError):
        # Fall back to string ID lookup (for AI-generated universities)
        uni = db.query(University).filter(University.id == university_id).first()

    if not uni:
        raise HTTPException(status_code=404, detail="University not found. Please use an ID from the discovery stage.")

    # Check max shortlist (7 universities)
    count = (
        db.query(Shortlist)
        .filter(Shortlist.user_id == user.id)
        .count()
    )

    if count >= 7:
        raise HTTPException(status_code=400, detail="Maximum 7 universities allowed in shortlist")

    # Prevent duplicates
    exists = (
        db.query(Shortlist)
        .filter(
            Shortlist.user_id == user.id,
            Shortlist.university_id == uni.id
        )
        .first()
    )

    if exists:
        raise HTTPException(status_code=400, detail="University already shortlisted")

    shortlist = Shortlist(
        user_id=user.id,
        university_id=uni.id
    )

    db.add(shortlist)
    db.commit()

    # Auto stage transition (first shortlist triggers SHORTLISTING stage)
    new_count = (
        db.query(Shortlist)
        .filter(Shortlist.user_id == user.id)
        .count()
    )

    stage_changed = False
    if new_count == 1 and user.stage == STAGE.DISCOVERY:
        user.stage = STAGE.SHORTLISTING
        db.commit()
        stage_changed = True

    response = {
        "message": "University added to shortlist",
        "shortlist_count": new_count,
        "stage": user.stage
    }

    # Return new token if stage changed
    if stage_changed:
        new_token = create_access_token(user.id, user.email, user.stage)
        response["access_token"] = new_token
        response["token_type"] = "bearer"

    return response


@router.get("/")
def get_shortlist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = (
        db.query(Shortlist)
        .filter(Shortlist.user_id == user.id)
        .all()
    )

    # Fetch full university details
    shortlisted_universities = []
    for item in items:
        uni = db.query(University).filter(University.id == item.university_id).first()
        if uni:
            shortlisted_universities.append({
                "id": str(uni.id),
                "name": uni.name,
                "country": uni.country,
                "degree": uni.degree,
                "field": uni.field,
                "estimated_tuition": (uni.tuition_min + uni.tuition_max) // 2,
                "difficulty": uni.difficulty,
                "shortlisted_at": item.created_at.isoformat() if getattr(item, "created_at", None) else None
            })

    return {
        "count": len(shortlisted_universities),
        "shortlisted_universities": shortlisted_universities
    }


@router.delete("/{university_id}")
def remove_from_shortlist(
    university_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Try to find university by ID (can be UUID or string ID)
    uni = None
    try:
        # Try as UUID first
        uid = UUID(university_id)
        uni = db.query(University).filter(University.id == uid).first()
    except (ValueError, TypeError):
        # Fall back to string ID lookup (for AI-generated universities)
        uni = db.query(University).filter(University.id == university_id).first()

    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    item = (
        db.query(Shortlist)
        .filter(
            Shortlist.user_id == user.id,
            Shortlist.university_id == uni.id
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Not found in shortlist")

    db.delete(item)
    db.commit()

    return {"message": "Removed from shortlist"}


# =========================
# LOCK UNIVERSITY ENDPOINT
# =========================
@router.post("/lock/{university_id}", tags=["Lock University"])
def lock_university(
    university_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Lock a university choice and advance to APPLICATION stage."""
    
    # Try to find university by ID (can be UUID or string ID)
    uni = None
    try:
        # Try as UUID first
        uid = UUID(university_id)
        uni = db.query(University).filter(University.id == uid).first()
    except (ValueError, TypeError):
        # Fall back to string ID lookup (for AI-generated universities)
        uni = db.query(University).filter(University.id == university_id).first()

    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    
    # Verify university is shortlisted
    shortlist_item = (
        db.query(Shortlist)
        .filter(
            Shortlist.user_id == user.id,
            Shortlist.university_id == uni.id
        )
        .first()
    )

    if not shortlist_item:
        raise HTTPException(status_code=400, detail="University must be in shortlist before locking")

    # Check if already locked
    existing_lock = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    if existing_lock:
        raise HTTPException(status_code=400, detail="You already have a locked university")

    # Create lock record with university data snapshot
    locked = LockedUniversity(
        user_id=user.id,
        university_id=uni.id,
        university_data={
            "id": str(uni.id),
            "name": uni.name,
            "country": uni.country,
            "degree": uni.degree,
            "field": uni.field,
            "tuition_min": uni.tuition_min,
            "tuition_max": uni.tuition_max,
            "difficulty": uni.difficulty,
        }
    )

    db.add(locked)

    # Transition stage to LOCKED
    user.stage = STAGE.LOCKED
    db.commit()

    return {
        "message": "University locked successfully! You can now proceed to the application stage.",
        "locked_university": {
            "id": str(uni.id),
            "name": uni.name,
            "country": uni.country,
            "degree": uni.degree,
            "field": uni.field
        },
        "stage": user.stage
    }


@router.delete("/lock/", tags=["Lock University"])
def unlock_university(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Unlock the current university choice and return to SHORTLISTING stage."""

    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    if not locked:
        raise HTTPException(status_code=400, detail="No locked university to unlock")

    # Delete all application checklists associated with this locked university
    # This must be done before deleting the locked university record
    db.query(ApplicationChecklist).filter(
        ApplicationChecklist.locked_university_id == locked.id
    ).delete()

    # Delete the lock record
    db.delete(locked)

    # Revert stage to SHORTLISTING
    user.stage = STAGE.SHORTLISTING
    db.commit()

    return {
        "message": "University unlocked successfully. You can now modify your shortlist or lock a different university.",
        "stage": user.stage
    }


@router.get("/lock/", tags=["Lock University"])
def get_locked_university(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get the locked university for the current user."""

    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    if not locked:
        return {"locked_university": None, "stage": user.stage}

    uni = db.query(University).filter(University.id == locked.university_id).first()

    if not uni:
        return {"locked_university": None, "stage": user.stage}

    return {
        "locked_university": {
            "id": str(uni.id),
            "name": uni.name,
            "country": uni.country,
            "degree": uni.degree,
            "field": uni.field,
            "estimated_tuition": (uni.tuition_min + uni.tuition_max) // 2,
            "difficulty": uni.difficulty,
            "locked_at": locked.locked_at.isoformat() if locked.locked_at else None
        },
        "stage": user.stage
    }
