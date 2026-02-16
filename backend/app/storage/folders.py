from __future__ import annotations

from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Folder, FolderPlace

# ПАПКИ
class FoldersStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

    def create_folder(self, *, user_id: int, name: str) -> Folder: # новая папка
        folder = Folder(id_user=user_id, name=name)
        self._s.add(folder)
        try: # проверка ограничения на уникальность имени с пользователем
            self._s.flush() # как коммит только без него
        except IntegrityError as e:
            raise ValueError("Folder with this name already exists") from e
        return folder

    def add_place_to_folder(self, *, user_id: int, folder_id: int, place_id: int) -> FolderPlace:
        # добавление места в папку
        folder_stmt = select(Folder).where(and_(Folder.id == folder_id, Folder.id_user == user_id))
        folder = self._s.execute(folder_stmt).scalar_one_or_none()
        if folder is None:
            raise ValueError("Folder not found for this user")

        link = FolderPlace(id_folder=folder_id, id_place=place_id)
        self._s.add(link)
        try:
            self._s.flush()
        except IntegrityError as e:
            raise ValueError("Place already added to this folder") from e
        return link

    def remove_place_from_folder(self, *, user_id: int, folder_id: int, place_id: int) -> None:
        # удаление связи папка - место
        folder_stmt = select(Folder.id).where(and_(Folder.id == folder_id, Folder.id_user == user_id))
        if self._s.execute(folder_stmt).scalar_one_or_none() is None:
            raise ValueError("Folder not found for this user")

        link_stmt = select(FolderPlace).where(
            and_(FolderPlace.id_folder == folder_id, FolderPlace.id_place == place_id)
        )
        link = self._s.execute(link_stmt).scalar_one_or_none()
        if link is None:
            return
        self._s.delete(link)
