from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import PlaceStatus


class PlaceStatusesStorage:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_all(self) -> list[PlaceStatus]:
        stmt = select(PlaceStatus).order_by(PlaceStatus.status.asc())
        return list(self.session.scalars(stmt).all())

    def get_by_id(self, status_id: UUID) -> PlaceStatus:
        stmt = select(PlaceStatus).where(PlaceStatus.id == status_id)
        status_obj = self.session.scalar(stmt)

        if status_obj is None:
            raise ValueError("Place status not found")

        return status_obj