from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

import uuid

from app.db.models.base import Base


class City(Base):
    __tablename__ = "cities"

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    city: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    # связи------------------------
    places = relationship("Place", back_populates="city")