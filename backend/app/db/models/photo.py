from sqlalchemy import Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class Photo(Base):
    __tablename__ = "photos"

    # поля------------------------
    id: Mapped[int] = mapped_column(primary_key=True)

    url: Mapped[str] = mapped_column(Text, nullable=False)

    is_cover: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false"
    )

    place_id: Mapped[int] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False
    )

    # связи------------------------
    place = relationship("Place", back_populates="photos")