import enum
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

# роль
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


# ПОЛЬЗОВАТЕЛЬ
class User(Base):
    __tablename__ = "users" # таблица в бд

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)


    places_created = relationship(
        "Place",
        back_populates="created_by",
        cascade="all, delete-orphan"
    )
    folders = relationship(
        "Folder",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    requests_created = relationship(
        "Request",
        back_populates="user",
        foreign_keys="Request.id_user",
        cascade="all, delete-orphan"
    )

    requests_moderated = relationship(
        "Request",
        back_populates="admin",
        foreign_keys="Request.id_admin"
    )