from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.models.base import Base


class PlaceStatus(Base):
    __tablename__ = "place_statuses"

    # поля------------------------
    id: Mapped[UUID] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # связи------------------------
    places = relationship("Place", back_populates="status")