from sqlalchemy.orm import Session
from app.db.storage.auth import AuthStorage
from app.db.storage.place import PlacesStorage
from app.db.storage.folder import FoldersStorage
from app.db.storage.user import UsersStorage
from app.db.storage.place_statuses import PlaceStatusesStorage
from app.db.storage.city import CityStorage
from app.db.storage.tag import TagsStorage

# ВСЕ
class StorageContext:
    def __init__(self, session: Session) -> None:
        self.session = session

        self.auth = AuthStorage(session)
        self.places = PlacesStorage(session)
        self.folders = FoldersStorage(session)
        self.users = UsersStorage(session)
        self.tags = TagsStorage(session)
        self.cities = CityStorage(session)
        self.place_statuses = PlaceStatusesStorage(session)
