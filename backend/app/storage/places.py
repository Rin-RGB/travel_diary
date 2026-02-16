from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Place

# МЕСТА
class PlacesStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

    def create_place( # добавление
        self,
        *,
        name: str,
        description: str,
        address: str,
        photo: str | None,
        created_by_user_id: int,
        is_published: bool = False,
    ) -> Place:
        place = Place(
            name=name,
            description=description,
            address=address,
            photo=photo,
            id_created_by=created_by_user_id,
            is_published=is_published,
        )
        self._s.add(place)
        self._s.flush()
        return place

    def get_place(self, *, place_id: int) -> Place | None: # место по айди
        stmt = select(Place).where(Place.id == place_id)
        return self._s.execute(stmt).scalar_one_or_none()
