from sqlalchemy.orm import Session

from app.storage.auth import AuthStorage
from app.storage.places import PlacesStorage
from app.storage.folders import FoldersStorage
from app.storage.requests import RequestsStorage
from app.storage.admin import AdminStorage
from app.storage.users import UsersStorage

# ВСЕ
class StorageContext:
    def __init__(self, session: Session) -> None:
        self.session = session

        self.auth = AuthStorage(session)
        self.places = PlacesStorage(session)
        self.folders = FoldersStorage(session)
        self.requests = RequestsStorage(session)
        self.admin = AdminStorage(session)
        self.users = UsersStorage(session)