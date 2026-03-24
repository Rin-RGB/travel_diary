from sqlalchemy.orm import Session

from app.db.storage.auth import AuthStorage
from app.db.storage.places import PlacesStorage
from app.db.storage.folders import FoldersStorage
from app.db.storage.requests import RequestsStorage
from app.db.storage.admin import AdminStorage
from app.db.storage.users import UsersStorage

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