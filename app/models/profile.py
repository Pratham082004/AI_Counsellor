import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # Personal Information
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)

    # Education Background
    education_level = Column(String, nullable=False)
    major = Column(String, nullable=False)
    graduation_year = Column(Integer, nullable=False)
    gpa = Column(Float, nullable=True)

    # Test Scores
    ielts_score = Column(Float, nullable=True)
    toefl_score = Column(Float, nullable=True)
    gre_score = Column(Integer, nullable=True)
    gmat_score = Column(Integer, nullable=True)

    # Application Status
    sop_status = Column(String, default="NOT_STARTED")  # NOT_STARTED, DRAFT, SUBMITTED, APPROVED
    lor_status = Column(String, default="NOT_STARTED")  # NOT_STARTED, DRAFT, SUBMITTED, APPROVED

    # Target Information
    target_degree = Column(String, nullable=False)
    target_field = Column(String, nullable=False)
    target_country = Column(String, nullable=False)
    target_intake = Column(String, nullable=True)

    budget_range = Column(String, nullable=False)
    funding_plan = Column(String, nullable=True)

    is_complete = Column(Boolean, default=False)
