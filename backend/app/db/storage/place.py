from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select, literal
from sqlalchemy.orm import Session, selectinload

from app.core.reference_data import PLACE_STATUSES
from app.db.models import Place, TagPlace


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
        tags: list[str] = None,
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