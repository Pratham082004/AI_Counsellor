import uuid
from sqlalchemy import Column, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class AIUniversityResult(Base):
    __tablename__ = "ai_university_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    universities = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
