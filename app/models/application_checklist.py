import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ChecklistItemStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"


class ApplicationChecklist(Base):
    __tablename__ = "application_checklists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    locked_university_id = Column(UUID(as_uuid=True), ForeignKey("locked_universities.id"), nullable=False)

    item_name = Column(String, nullable=False)  # SOP, LOR, Transcripts, IELTS/GRE
    status = Column(SQLEnum(ChecklistItemStatus), default=ChecklistItemStatus.PENDING, nullable=False)
    
    notes = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship to documents
    documents = relationship("ApplicationDocument", back_populates="checklist_item", cascade="all, delete-orphan")
