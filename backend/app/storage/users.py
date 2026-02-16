from sqlalchemy import select
from sqlalchemy.orm import Session # для аннотации

from app.models import User

# работа с ПОЛЬЗОВАТЕЛЯМИ
class UsersStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

    def get_by_id(self, user_id: int) -> User | None: # найти по айди
        stmt = select(User).where(User.id == user_id)
        return self._s.execute(stmt).scalar_one_or_none()

    def get_by_email(self, email: str) -> User | None: # найти по почте (для авторизации)
        stmt = select(User).where(User.email == email)
        return self._s.execute(stmt).scalar_one_or_none()
