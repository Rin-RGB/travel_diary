from datetime import datetime, timedelta, timezone
from sqlalchemy import and_, desc, select, update
from sqlalchemy.orm import Session
from app.core.reference_data import USER_ROLES
from app.db.models import EmailCode, User, Folder



class AuthStorage:
    def __init__(self, session: Session) -> None:
        self.session = session

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
        self.session.execute(
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
        self.session.add(email_code)
        self.session.flush()

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

        email_code = self.session.execute(stmt).scalar_one_or_none()
        if email_code is None:
            raise ValueError("Invalid or expired code")

        email_code.is_used = True

        user_stmt = (
            select(User)
            .where(User.email == email)
            .limit(1)
        )
        user = self.session.execute(user_stmt).scalar_one_or_none()

        if user is None:
            local_part = email.split("@")[0]

            user = User(
                name=local_part,
                email=email,
                role_id=USER_ROLES["user"],
            )

            self.session.add(user)
            self.session.flush()

            # Создание 3 системных папок УРА я не забыла
            system_folders = [
                Folder(name="Хочу посетить", id_user=user.id),
                Folder(name="Посещено", id_user=user.id),
                Folder(name="Избранное", id_user=user.id),
            ]
            self.session.add_all(system_folders)
        self.session.flush()

        return user

    def get_user_by_email(self, *, email: str) -> User | None:
        stmt = (
            select(User)
            .where(User.email == email)
            .limit(1)
        )
        return self.session.execute(stmt).scalar_one_or_none()

    def get_user_by_id(self, *, user_id) -> User | None:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .limit(1)
        )
        return self.session.execute(stmt).scalar_one_or_none()