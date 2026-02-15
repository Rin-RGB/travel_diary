from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from datetime import datetime


# МЕСТО
class Place(Base):
    __tablename__ = "place"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # ✅ новое поле
    description: Mapped[str] = mapped_column(Text, nullable=False)

    address: Mapped[str] = mapped_column(Text, nullable=False)

    photo: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    is_published: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false"
    )

    id_created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_by = relationship("User", back_populates="places_created")
    folder_links = relationship("FolderPlace", back_populates="place", cascade="all, delete-orphan")
    request = relationship("Request", back_populates="place", uselist=False, cascade="all, delete-orphan")
