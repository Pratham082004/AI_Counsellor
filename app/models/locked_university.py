import uuid
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base


class LockedUniversity(Base):
    __tablename__ = "locked_universities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    # Store a snapshot of university data to avoid joins and preserve historic data
    university_data = Column(JSONB, nullable=False)

    locked_at = Column(DateTime(timezone=True), server_default=func.now())

    # Each user can only lock one university
    __table_args__ = (UniqueConstraint('user_id', name='unique_user_locked_university'),)
