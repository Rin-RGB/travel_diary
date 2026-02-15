from sqlalchemy import ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class FolderPlace(Base):
    __tablename__ = "folder_place"
    __table_args__ = (
        UniqueConstraint("id_folder", "id_place", name="uq_folder_place"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    id_folder: Mapped[int] = mapped_column(
        ForeignKey("folder.id", ondelete="CASCADE"),
        nullable=False
    )
    id_place: Mapped[int] = mapped_column(
        ForeignKey("place.id", ondelete="CASCADE"),
        nullable=False
    )

    # вместо position:
    date_added: Mapped["datetime"] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    folder = relationship("Folder", back_populates="places")
    place = relationship("Place", back_populates="folder_links")
