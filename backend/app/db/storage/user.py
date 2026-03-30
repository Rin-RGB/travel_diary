from sqlalchemy import select
from sqlalchemy.orm import Session # для аннотации

from app.db.models import User

# работа с ПОЛЬЗОВАТЕЛЯМИ
class UsersStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

