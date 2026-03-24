from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class UserRole(Base):
    __tablename__ = "user_roles"

    # поля------------------------
    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # связи------------------------
    users = relationship("User", back_populates="role")