from sqlalchemy.orm import Session

from app.db.models import EmailCode
from app.db.storage.auth import AuthStorage
from app.db.storage.tag import TagsStorage
from app.db.storage.email_code import EmailCodeStorage
from app.db.storage.place import PlacesStorage
from app.db.storage.folder import FoldersStorage
from app.db.storage.user import UsersStorage

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