from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.profile import Profile
from app.models.user import User
from app.models.task import Task
from app.core.stages import STAGE

def complete_onboarding(
    db: Session,
    user: User,
    data
):
    profile = Profile(
        id=uuid4(),
        user_id=user.id,
        education_level=data.education_level,
        major=data.major,
        graduation_year=data.graduation_year,
        target_degree=data.target_degree,
        target_field=data.target_field,
        target_country=data.target_country,
        budget_range=data.budget_range,
        is_complete=True
    )

    user.stage = STAGE.DISCOVERY

    db.add(profile)
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_profile(db: Session, user_id: str):
    """Get user profile with all details."""
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def update_user_profile(db: Session, user_id: str, profile_data: dict):
    """Update user profile."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        return None

    for key, value in profile_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

def create_default_tasks(db: Session, user_id: str):
    """Create default application preparation tasks for a user."""
    default_tasks = [
        {
            "title": "Research Scholarship Options",
            "priority": "High",
            "category": "Financial",
            "status": "todo"
        },
        {
            "title": "Arrange Financial Documents",
            "priority": "High",
            "category": "Financial",
            "status": "todo"
        },
        {
            "title": "Prepare CV / Resume",
            "priority": "Medium",
            "category": "Documents",
            "status": "todo"
        },
        {
            "title": "Gather Letters of Recommendation",
            "priority": "Medium",
            "category": "Documents",
            "status": "todo"
        },
        {
            "title": "Complete IELTS / TOEFL if required",
            "priority": "Medium",
            "category": "Exams",
            "status": "todo"
        },
        {
            "title": "Prepare Application Essays",
            "priority": "Low",
            "category": "Documents",
            "status": "todo"
        }
    ]

    for task_data in default_tasks:
        task = Task(
            user_id=user_id,
            **task_data
        )
        db.add(task)

    db.commit()
