from datetime import datetime, timedelta, timezone
from sqlalchemy import and_, desc, select, update
from sqlalchemy.orm import Session
from app.core.reference_data import USER_ROLES
from app.db.models import EmailCode, User


class AuthStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

    def create_code(
        self,
        *,
        email: str,
        code: str,
        ttl_minutes: int = 5,
    ) -> EmailCode:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=ttl_minutes)

        # деактивируем все предыдущие
        self._s.execute(
            update(EmailCode)
            .where(
                and_(
                    EmailCode.email == email,
                    EmailCode.is_used.is_(False),
                )
            )
            .values(is_used=True)
        )

        email_code = EmailCode(
            email=email,
            code=code,
            expires_at=expires_at,
            is_used=False,
        )
        self._s.add(email_code)
        self._s.flush()

        return email_code

    def verify(
        self,
        *,
        email: str,
        code: str,
    ) -> User:
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
            .order_by(desc(EmailCode.created_at), desc(EmailCode.id))
            .limit(1)
        )

        email_code = self._s.execute(stmt).scalar_one_or_none()
        if email_code is None:
            raise ValueError("Invalid or expired code")

        email_code.is_used = True

        user_stmt = (
            select(User)
            .where(User.email == email)
            .limit(1)
        )
        user = self._s.execute(user_stmt).scalar_one_or_none()

        if user is None:
            user = User(
                email=email,
                name=None,
                role_id=USER_ROLES["user"],
            )
            self._s.add(user)
            self._s.flush()

        return user

    def get_user_by_email(self, *, email: str) -> User | None:
        stmt = (
            select(User)
            .where(User.email == email)
            .limit(1)
        )
        return self._s.execute(stmt).scalar_one_or_none()

    def get_user_by_id(self, *, user_id) -> User | None:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .limit(1)
        )
        return self._s.execute(stmt).scalar_one_or_none()