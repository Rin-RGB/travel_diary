from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, desc, select, update
from sqlalchemy.orm import Session

from app.models import EmailCode, User
from app.models.user import UserRole

# АВТОРИЗАЦИЯ
class AuthStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

    # создание кода
    def create_email_code(self, *, email: str, code: str, ttl_minutes: int = 5) -> EmailCode:
        now = datetime.now(timezone.utc) # текущее время
        expires_at = now + timedelta(minutes=ttl_minutes) # когда истекает код

        self._s.execute( # старые коды бан--- на всякий случай
            update(EmailCode)
            .where(and_(EmailCode.email == email, EmailCode.is_used.is_(False)))
            .values(is_used=True)
        )

        row = EmailCode(email=email, code=code, expires_at=expires_at)
        self._s.add(row)
        self._s.flush()
        return row

    # верификация
    def verify_email_code_and_get_user(self, *, email: str, code: str) -> User:
        now = datetime.now(timezone.utc)

        stmt = (
            select(EmailCode)
            .where(
                and_(
                    EmailCode.email == email,
                    EmailCode.code == code,
                    EmailCode.is_used.is_(False),
                    EmailCode.expires_at > now,
                )
            )
            .order_by(desc(EmailCode.id))
            .limit(1)
        ) # берем последний выданный юзеру код который еще мб использован

        email_code = self._s.execute(stmt).scalar_one_or_none()
        if email_code is None:
            raise ValueError("Invalid or expired code")

        email_code.is_used = True # используем

        user_stmt = select(User).where(User.email == email).limit(1) # ищем пользователя
        user = self._s.execute(user_stmt).scalar_one_or_none() # выполняем запрос
        # если найдено возвращаем если нет None

        # если нет пользователя
        if user is None:
            # создаем
            user = User(email=email, role=UserRole.user)
            self._s.add(user)
            self._s.flush()

        return user
