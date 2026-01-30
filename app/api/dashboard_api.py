from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.shortlist import Shortlist
from app.models.task import Task
from app.models.locked_university import LockedUniversity
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Pydantic schemas
class DashboardMetrics(BaseModel):
    profile_strength: int
    shortlisted: int
    locked: int
    pending_tasks: int

class DashboardResponse(BaseModel):
    username: str
    first_name: str
    last_name: str
    metrics: DashboardMetrics
    profile: Dict[str, Any]
    journey_steps: list

@router.get("/", response_model=DashboardResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get dashboard data for the current user."""

    # Get user profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Get shortlist count
    shortlisted_count = db.query(Shortlist).filter(Shortlist.user_id == user.id).count()
    
    # Get locked universities count from LockedUniversity table
    locked_count = db.query(LockedUniversity).filter(LockedUniversity.user_id == user.id).count()

    # Get pending tasks (using correct status values)
    pending_tasks_count = db.query(Task).filter(
        Task.user_id == user.id,
        Task.status.in_(['todo', 'in_progress'])
    ).count()

    # Calculate profile strength (simplified)
    profile_strength = 100 if profile.is_complete else 75

    # Journey steps based on user stage
    journey_steps = [
        {
            "title": "Building Profile",
            "description": "Complete your academic profile",
            "status": "completed" if profile.is_complete else "active"
        },
        {
            "title": "Discovering",
            "description": "Explore and shortlist universities",
            "status": "active" if shortlisted_count > 0 else "locked"
        },
        {
            "title": "Finalizing",
            "description": "Lock your final choices",
            "status": "active" if locked_count > 0 else "locked"
        },
        {
            "title": "Preparing",
            "description": "Complete application tasks",
            "status": "active" if pending_tasks_count > 0 else "locked"
        }
    ]

    # Format profile data for frontend
    profile_data = {
        "academic": {
            "Education Level": profile.education_level,
            "Degree / Major": profile.major,
            "Graduation Year": str(profile.graduation_year),
            "GPA / Percentage": f"{profile.gpa} GPA" if profile.gpa else "Not specified"
        },
        "goals": {
            "Intended Degree": profile.target_degree,
            "Field of Study": profile.target_field,
            "Target Intake": profile.target_intake or "Not specified",
            "Countries": profile.target_country
        },
        "budget": {
            "Budget Range": profile.budget_range,
            "Funding Plan": profile.funding_plan or "Not specified"
        },
        "exams": {
            "IELTS / TOEFL": f"TOEFL: {profile.toefl_score}" if profile.toefl_score else f"IELTS: {profile.ielts_score}" if profile.ielts_score else "Not taken",
            "GRE / GMAT": f"GRE: {profile.gre_score}" if profile.gre_score else f"GMAT: {profile.gmat_score}" if profile.gmat_score else "Not taken",
            "SOP": "Completed" if profile.sop_status == "APPROVED" else "In Progress"
        }
    }

    return DashboardResponse(
        username=user.email.split('@')[0],  # Use email prefix as username
        first_name=profile.first_name or '',
        last_name=profile.last_name or '',
        metrics=DashboardMetrics(
            profile_strength=profile_strength,
            shortlisted=shortlisted_count,
            locked=locked_count,
            pending_tasks=pending_tasks_count
        ),
        profile=profile_data,
        journey_steps=journey_steps
    )
