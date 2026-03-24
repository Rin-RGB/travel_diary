from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.models.base import Base


class User(Base):
    __tablename__ = "users"

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    role_id: Mapped[int] = mapped_column(
        ForeignKey("user_roles.id", ondelete="RESTRICT"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # связи------------------------
    role = relationship("UserRole", back_populates="users")

    folders = relationship(
        "Folder",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    created_places = relationship(
        "Place",
        back_populates="user",
        foreign_keys="Place.user_id"
    )

    moderated_places = relationship(
        "Place",
        back_populates="admin",
        foreign_keys="Place.admin_id"
    )

    place_comments = relationship(
        "PlaceComment",
        back_populates="admin",
        cascade="all, delete-orphan"
    )