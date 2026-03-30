from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload


from app.db.models import Folder, FolderPlace, Place, TagPlace




class FoldersStorage:
    def __init__(self, session):
        self.session = session

    def get_user_folders(
        self,
        *,
        user_id,
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
            user_id,
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
            items.append(
                {
                    "id": place.id,
                    "name": place.title,
                    "city": place.city.city,
                    "cover_photo": place.photos[0].url if place.photos else None,
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

    def create_folder(
            self,
            user_id,
            name: str,
    ):
        # проверка уникальности имени у пользователя
        existing_stmt = select(Folder).where(
            Folder.id_user == user_id,
            Folder.name == name,
        )
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing:
            raise ValueError("Folder with this name already exists")

        folder = Folder(
            name=name,
            id_user=user_id,
        )

        self.session.add(folder)
        self.session.flush()  # чтобы получить id

        return {
            "id": folder.id,
            "name": folder.name,
        }