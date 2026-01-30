from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    stage = Column(String, default="ONBOARDING", nullable=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship to cached recommendations
    cached_recommendations = relationship("CachedRecommendation", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship to application documents
    documents = relationship("ApplicationDocument", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship to SOP drafts
    sop_drafts = relationship("SOPDraft", back_populates="user", cascade="all, delete-orphan")
