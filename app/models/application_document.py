import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    checklist_item_id = Column(UUID(as_uuid=True), ForeignKey("application_checklists.id", ondelete="CASCADE"), nullable=True, index=True)
    
    document_type = Column(String, nullable=False)  # SOP, TRANSCRIPT, LOR, etc.
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    
    notes = Column(Text, nullable=True)
    is_final = Column(Integer, default=0)  # 0=draft, 1=final
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to user
    user = relationship("User", back_populates="documents")
    # Relationship to checklist item
    checklist_item = relationship("ApplicationChecklist", back_populates="documents")


class SOPDraft(Base):
    __tablename__ = "sop_drafts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    is_draft = Column(Integer, default=1)  # 1=draft, 0=finalized
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to user
    user = relationship("User", back_populates="sop_drafts")

