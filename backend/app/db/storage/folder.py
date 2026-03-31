from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from uuid import UUID

from uuid import uuid4

from app.db.models import Folder, FolderPlace, Place, TagPlace

from app.core.reference_data import PLACE_STATUSES




class FoldersStorage:
    def __init__(self, session):
        self.session = session

    def get_user_folders(
        self,
        *,
        user_id: UUID,
        page: int = 1,
        limit: int = 10,
    ):
        # считаем общее количество папок
        total_stmt = select(func.count(Folder.id)).where(
            Folder.id_user == user_id
        )
        total = self.session.execute(total_stmt).scalar_one()

        # основной запрос
        stmt = (
            select(
                Folder,
                func.count(FolderPlace.id_place).label("places_count")
            )
            .outerjoin(
                FolderPlace,
                FolderPlace.id_folder == Folder.id
            )
            .where(Folder.id_user == user_id)
            .group_by(Folder.id)
            .order_by(Folder.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )

        rows = self.session.execute(stmt).all()

        items = []
        for folder, places_count in rows:
            items.append({
                "id": folder.id,
                "name": folder.name,
                "places_count": places_count,
            })

        return items, total

    def get_folder_with_places(
            self,
            folder_id,
            user_id: UUID,
            page: int,
            limit: int,
            sort: str | None = None,
    ):
        if page < 1:
            raise ValueError("Page must be greater than 0")
        if limit < 1:
            raise ValueError("Limit must be greater than 0")

        folder_stmt = select(Folder).where(
            Folder.id == folder_id,
            Folder.id_user == user_id,
        )
        folder = self.session.execute(folder_stmt).scalar_one_or_none()

        if folder is None:
            return None

        stmt = (
            select(Place)
            .join(FolderPlace, FolderPlace.id_place == Place.id)
            .options(
                selectinload(Place.city),
                selectinload(Place.photos),
                selectinload(Place.tag_places).selectinload(TagPlace.tag),
            )
            .where(FolderPlace.id_folder == folder_id)
        )

        if sort == "old":
            stmt = stmt.order_by(Place.created_at.asc())
        else:
            stmt = stmt.order_by(Place.created_at.desc())

        total_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = self.session.execute(total_stmt).scalar_one()

        stmt = stmt.offset((page - 1) * limit).limit(limit)
        places = self.session.execute(stmt).scalars().all()

        items = []
        for place in places:
            cover_photo = next(
                (photo.url for photo in place.photos if photo.is_cover),
                None,
            )

            if cover_photo is None and place.photos:
                cover_photo = place.photos[0].url

            items.append(
                {
                    "id": place.id,
                    "name": place.name,
                    "city": place.city.city,
                    "cover_photo": cover_photo,
                    "tags": [tp.tag.name for tp in place.tag_places],
                }
            )

        return {
            "id": folder.id,
            "name": folder.name,
            "places": items,
            "page": page,
            "limit": limit,
            "total": total,
        }



    def create(self, *, user_id: UUID, name: str) -> Folder:
        # проверка название совпадения с существующими
        existing_stmt = select(Folder).where(
            Folder.id_user == user_id,
            Folder.name == name,
        )
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing is not None:
            raise ValueError("Folder with this name already exists")

        folder = Folder(
            id=uuid4(),
            name=name,
            id_user=user_id,
        )

        self.session.add(folder)
        self.session.flush()  # чтобы получить id

        return folder

    def update_name(self, *, folder_id: UUID, user_id: UUID, name: str) -> Folder:
        stmt = select(Folder).where(Folder.id == folder_id)
        folder = self.session.execute(stmt).scalar_one_or_none()

        if not folder:
            raise ValueError("Folder not found")

        if folder.id_user != user_id:
            raise PermissionError("No access to this folder")

        # проверка совпадения имен
        existing_stmt = select(Folder).where(
            Folder.id_user == user_id,
            Folder.name == name,
            Folder.id != folder_id,
        )
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing is not None:
            raise ValueError("Folder with this name already exists")

        folder.name = name

        self.session.flush()

        return folder

    def add_place(
            self,
            *,
            folder_id: UUID,
            place_id: UUID,
            user_id: UUID,
    ) -> None:
        folder_stmt = select(Folder).where(Folder.id == folder_id)
        folder = self.session.execute(folder_stmt).scalar_one_or_none()

        if not folder:
            raise ValueError("Folder not found")

        if folder.id_user != user_id:
            raise PermissionError("No access to this folder")

        place_stmt = select(Place).where(
            Place.id == place_id,
            Place.id_status == PLACE_STATUSES["approved"],
        )
        place = self.session.execute(place_stmt).scalar_one_or_none()

        if not place:
            raise ValueError("Place not found")

        exists_stmt = select(FolderPlace).where(
            FolderPlace.id_folder == folder_id,
            FolderPlace.id_place == place_id,
        )
        exists = self.session.execute(exists_stmt).scalar_one_or_none()

        if exists:
            return

        folder_place = FolderPlace(
            id_folder=folder_id,
            id_place=place_id,
        )
        self.session.add(folder_place)
        self.session.flush()

    def remove_place(
            self,
            *,
            folder_id: UUID,
            place_id: UUID,
            user_id: UUID,
    ) -> None:
        folder_stmt = select(Folder).where(Folder.id == folder_id)
        folder = self.session.execute(folder_stmt).scalar_one_or_none()

        if not folder:
            raise ValueError("Folder not found")

        if folder.id_user != user_id:
            raise PermissionError("No access to this folder")

        folder_place_stmt = select(FolderPlace).where(
            FolderPlace.id_folder == folder_id,
            FolderPlace.id_place == place_id,
        )
        folder_place = self.session.execute(folder_place_stmt).scalar_one_or_none()

        if not folder_place:
            raise ValueError("Place is not in folder")

        self.session.delete(folder_place)
        self.session.flush()