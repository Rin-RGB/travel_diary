from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import DateTime, func

from datetime import datetime

import uuid

from app.db.models.base import Base


class Folder(Base):
    __tablename__ = "folders"
    __table_args__ = (
        UniqueConstraint("id_user", "name", name="uq_folders_user_name"),
    )  # У пользователя только одна папка с таким именем

    # поля------------------------
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                          primary_key=True,
                                          default=uuid.uuid4,
                                          )
    name: Mapped[str] = mapped_column(String(255), nullable=False,)

    id_user: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # связи------------------------
    user = relationship("User", back_populates="folders")

    folder_places = relationship(
        "FolderPlace",
        back_populates="folder",
        cascade="all, delete-orphan"
    )