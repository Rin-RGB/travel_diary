from datetime import datetime

from sqlalchemy import ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.models.base import Base


class PlaceComment(Base):
    __tablename__ = "place_comments"

    # поля------------------------
    place_id: Mapped[UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        primary_key=True
    )

    admin_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    text: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # связи------------------------
    place = relationship("Place", back_populates="comment")
    admin = relationship("User", back_populates="place_comments")