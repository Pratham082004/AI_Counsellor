import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class CachedRecommendation(Base):
    __tablename__ = "cached_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)
    university_name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field = Column(String, nullable=False)
    estimated_tuition = Column(Integer, nullable=False)
    difficulty = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship to user
    user = relationship("User", back_populates="cached_recommendations")
    
    # Relationship to university
    university = relationship("University")

