import enum
from sqlalchemy import ForeignKey, DateTime, func, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from datetime import datetime

class RequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


# ЗАЯВКА
class Request(Base):
    __tablename__ = "request"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_place: Mapped[int] = mapped_column(
        ForeignKey("place.id", ondelete="CASCADE"),
        nullable=False
    )
    id_user: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    id_admin: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    place = relationship(
        "Place",
        back_populates="request"
    )
    user = relationship(
        "User",
        back_populates="requests_created",
        foreign_keys=[id_user]
    )

    admin = relationship(
        "User",
        back_populates="requests_moderated",
        foreign_keys=[id_admin]
    )
