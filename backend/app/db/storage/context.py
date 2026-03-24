from sqlalchemy.orm import Session

from app.db.models import EmailCode
from app.db.storage.auth import AuthStorage
from app.db.storage.tags import TagsStorage
from app.db.storage.email_codes import EmailCodeStorage
from app.db.storage.places import PlacesStorage
from app.db.storage.folders import FoldersStorage
from app.db.storage.users import UsersStorage

# ВСЕ
class StorageContext:
    def __init__(self, session: Session) -> None:
        self.session = session

        self.auth = AuthStorage(session)
        self.places = PlacesStorage(session)
        self.folders = FoldersStorage(session)
        self.users = UsersStorage(session)
        self.tags = TagsStorage(session)
        self.email_codes = EmailCodeStorage(session)