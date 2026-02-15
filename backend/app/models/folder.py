from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


# ПАПКА
class Folder(Base):
    __tablename__ = "folder"
    __table_args__ = (
        UniqueConstraint("id_user", "name", name="uq_folder_user_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    id_user: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    user = relationship("User", back_populates="folders")
    places = relationship("FolderPlace", back_populates="folder", cascade="all, delete-orphan")
