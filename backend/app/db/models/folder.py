from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.models.base import Base


class Folder(Base):
    __tablename__ = "folders"
    __table_args__ = (
        UniqueConstraint("id_user", "name", name="uq_folders_user_name"),
    )  # У пользователя только одна папка с таким именем

    # поля------------------------
    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    id_user: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # связи------------------------
    user = relationship("User", back_populates="folders")

    folder_places = relationship(
        "FolderPlace",
        back_populates="folder",
        cascade="all, delete-orphan"
    )