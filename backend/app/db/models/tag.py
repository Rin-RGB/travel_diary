from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.models.base import Base


class Tag(Base):
    __tablename__ = "tags"

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # связи------------------------
    tag_places = relationship(
        "TagPlace",
        back_populates="tag",
        cascade="all, delete-orphan"
    )