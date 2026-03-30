from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Folder, FolderPlace


class FoldersStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

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
        total = self._s.execute(total_stmt).scalar_one()

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

        rows = self._s.execute(stmt).all()

        items = []
        for folder, places_count in rows:
            items.append({
                "id": folder.id,
                "name": folder.name,
                "places_count": places_count,
            })

        return items, total