from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.models.base import Base


class TagPlace(Base):
    __tablename__ = "tag_places"

    # поля------------------------
    id_tag: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    default=uuid.uuid4,
    )

    id_place: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        primary_key=True
    )

    # связи------------------------
    tag = relationship("Tag", back_populates="tag_places")
    place = relationship("Place", back_populates="tag_places")