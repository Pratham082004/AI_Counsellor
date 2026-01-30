from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.onboarding import router as onboarding_router
from app.api.ai_api import router as universities_router
from app.api.shortlist_api import router as shortlist_router
from app.api.applications_api import router as applications_router
from app.api.ai_counsellor import router as ai_counsellor_router
from app.api.tasks_api import router as tasks_router
from app.api.dashboard_api import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(onboarding_router)
api_router.include_router(universities_router)
api_router.include_router(shortlist_router)
api_router.include_router(applications_router)
api_router.include_router(ai_counsellor_router)
api_router.include_router(tasks_router)
api_router.include_router(dashboard_router)
