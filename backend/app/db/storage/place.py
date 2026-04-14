from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import func, select, literal
from sqlalchemy.orm import Session, selectinload

from app.core.reference_data import PLACE_STATUSES
from app.db.models import Place, Photo, TagPlace, PlaceStatus


from datetime import datetime, timezone


class PlacesStorage:
    def __init__(self, session: Session) -> None:
        self.session = session

    # ОПУБЛИКОВАННЫЕ места
    def get_published(
        self,
        page: int = 1,
        limit: int = 10,
        q: str = None,
        city: UUID = None,
        tags: list[UUID] | None = None,
        sort: str = None,
    ) -> tuple[list[Place], int]:

        if page < 1:
            raise ValueError("Page must be greater than 0")
        if limit < 1:
            raise ValueError("Limit must be greater than 0")

        published_id = PLACE_STATUSES["approved"]

        stmt = select(Place).where(Place.id_status == published_id)

        # поиск
        if q:
            stmt = stmt.where(Place.name.ilike(f"%{q}%"))

        # фильтр по городу
        if city:
            stmt = stmt.where(Place.id_city == city)

        # фильтр по тегам
        if tags:
            tags = list(set(tags))

            tags_subquery = (
                select(TagPlace.id_place)
                .where(TagPlace.id_tag.in_(tags))
                .group_by(TagPlace.id_place)
                .having(func.count(func.distinct(TagPlace.id_tag)) == literal(len(tags)))
            )

            stmt = stmt.where(Place.id.in_(tags_subquery))

        # сортировка
        # пока что только по дате
        stmt = stmt.order_by(Place.created_at.desc())

        # всего мест
        total_stmt = stmt.with_only_columns(func.count(Place.id)).order_by(None)
        total = self.session.scalar(total_stmt) or 0

        stmt = (
            stmt.options(
                selectinload(Place.city),
                selectinload(Place.photos),
                selectinload(Place.tag_places).selectinload(TagPlace.tag),
            )
            .offset((page - 1) * limit) # страница
            .limit(limit)
        )

        items = list(self.session.scalars(stmt).all())
        return items, total

    def get_published_by_id(self, place_id: UUID) -> Place | None:
        published_status_id = PLACE_STATUSES["approved"]

        stmt = (
            select(Place)
            .where(
                Place.id == place_id,
                Place.id_status == published_status_id,
            )
            .options(
                selectinload(Place.city),
                selectinload(Place.photos),
                selectinload(Place.tag_places).selectinload(TagPlace.tag),
            )
        )

        return self.session.scalar(stmt)


    def get_by_id(self, place_id: UUID) -> Place | None:
        stmt = (
            select(Place)
            .where(Place.id == place_id)
            .options(
                selectinload(Place.city),
                selectinload(Place.photos),
                selectinload(Place.status),
                selectinload(Place.tag_places).selectinload(TagPlace.tag),
            )
        )

        return self.session.scalar(stmt)

    def create_place(self, data, admin_id: UUID) -> Place:
        status = self.session.execute(
            select(PlaceStatus).where(PlaceStatus.status == "approved")
        ).scalar_one()

        place = Place(
            id=uuid4(),
            name=data.name,
            address=data.address,
            id_city=data.city_id,
            description=data.description,
            lat=data.lat,
            lon=data.lon,
            id_status=status.id,
            id_admin=admin_id,
            created_at=datetime.now(timezone.utc),
        )

        self.session.add(place)
        self.session.flush()

        for tag_id in data.tags:
            self.session.add(
                TagPlace(
                    id_place=place.id,
                    id_tag=tag_id,
                )
            )

        for i, url in enumerate(data.photo_urls):
            self.session.add(
                Photo(
                    id=uuid4(),
                    url=url,
                    is_cover=(i == 0),
                    id_place=place.id,
                )
            )

        self.session.flush()

        result = self.get_by_id(place.id)
        if result is None:
            raise ValueError("Place was not created")

        return result

    def update_place(self, place_id: UUID, data) -> Place:
        place = self.get_by_id(place_id)
        if place is None:
            raise ValueError("Place not found")

        if data.name is not None:
            place.name = data.name
        if data.address is not None:
            place.address = data.address
        if data.city_id is not None:
            place.id_city = data.city_id
        if data.description is not None:
            place.description = data.description
        if data.lat is not None:
            place.lat = data.lat
        if data.lon is not None:
            place.lon = data.lon

        if data.tags is not None:
            self.session.query(TagPlace).filter(
                TagPlace.id_place == place_id
            ).delete()

            for tag_id in data.tags:
                self.session.add(
                    TagPlace(
                        id_place=place_id,
                        id_tag=tag_id,
                    )
                )

        if data.photo_urls is not None:
            self.session.query(Photo).filter(
                Photo.id_place == place_id
            ).delete()

            for i, url in enumerate(data.photo_urls):
                self.session.add(
                    Photo(
                        id=uuid4(),
                        url=url,
                        is_cover=(i == 0),
                        id_place=place_id,
                    )
                )

        self.session.flush()

        result = self.get_by_id(place_id)
        if result is None:
            raise ValueError("Place not found")

        return result

    def delete_place(self, place_id: UUID) -> None:
        place = self.session.get(Place, place_id)
        if place is None:
            raise ValueError("Place not found")

        self.session.delete(place)