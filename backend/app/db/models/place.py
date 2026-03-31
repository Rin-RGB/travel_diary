from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, DateTime, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.models.base import Base


class Place(Base):
    __tablename__ = "places"

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                          primary_key=True,
                                          default=uuid.uuid4,
                                          )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    id_admin: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    id_user: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    address: Mapped[str] = mapped_column(Text, nullable=False)

    id_city: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="RESTRICT"),
        nullable=False
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)

    lat: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    lon: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)

    id_status: Mapped[int] = mapped_column(
        ForeignKey("place_statuses.id", ondelete="RESTRICT"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # связи------------------------
    admin = relationship(
        "User",
        back_populates="moderated_places",
        foreign_keys=[id_admin]
    )

    user = relationship(
        "User",
        back_populates="created_places",
        foreign_keys=[id_user]
    )

    city = relationship("City", back_populates="places")
    status = relationship("PlaceStatus", back_populates="places")

    photos = relationship(
        "Photo",
        back_populates="place",
        cascade="all, delete-orphan"
    )

    folder_places = relationship(
        "FolderPlace",
        back_populates="place",
        cascade="all, delete-orphan"
    )

    tag_places = relationship(
        "TagPlace",
        back_populates="place",
        cascade="all, delete-orphan"
    )

    comments = relationship(
        "PlaceComment",
        back_populates="place",
        cascade="all, delete-orphan"
    )