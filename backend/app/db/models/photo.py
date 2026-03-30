from sqlalchemy import Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

import uuid

from app.db.models.base import Base


class Photo(Base):
    __tablename__ = "photos"

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True,
                                          default=uuid.uuid4,
                                          )

    url: Mapped[str] = mapped_column(Text, nullable=False)

    is_cover: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false"
    )

    id_place: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False
    )

    # связи------------------------
    place = relationship("Place", back_populates="photos")