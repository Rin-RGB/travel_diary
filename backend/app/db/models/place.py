from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, DateTime, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class Place(Base):
    __tablename__ = "places"

    # поля------------------------
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    address: Mapped[str] = mapped_column(Text, nullable=False)

    city_id: Mapped[int] = mapped_column(
        ForeignKey("cities.id", ondelete="RESTRICT"),
        nullable=False
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)

    lat: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    lon: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)

    status_id: Mapped[int] = mapped_column(
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
        foreign_keys=[admin_id]
    )

    user = relationship(
        "User",
        back_populates="created_places",
        foreign_keys=[user_id]
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

    comment = relationship(
        "PlaceComment",
        back_populates="place",
        uselist=False,
        cascade="all, delete-orphan"
    )