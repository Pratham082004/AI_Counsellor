from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class OTP(Base):
    __tablename__ = "otps"

    email = Column(String, primary_key=True, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


