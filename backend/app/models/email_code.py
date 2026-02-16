from sqlalchemy import String, Boolean, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from datetime import datetime



class EmailCode(Base):
    __tablename__ = "email_code"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
# индексы
Index("idx_email_code_email", EmailCode.email)
Index("idx_email_code_expires_at", EmailCode.expires_at)
