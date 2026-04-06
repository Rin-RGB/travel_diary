from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import User, UserRole


class UsersStorage:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_me(self, user_id: UUID) -> User | None:
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.id == user_id)
            .limit(1)
        )
        return self.session.execute(stmt).scalar_one_or_none()

    def update_me(self, user_id: UUID, name: str | None) -> User:
        user = self.get_me(user_id)

        if user is None:
            raise ValueError("User not found")

        user.name = name
        self.session.flush()

        return user

    def delete_me(self, user_id: UUID) -> None:
        stmt = select(User).where(User.id == user_id).limit(1)
        user = self.session.execute(stmt).scalar_one_or_none()

        if user is None:
            raise ValueError("User not found")

        self.session.delete(user)
        self.session.flush()

    def update_role(self, user_id: UUID, role_name: str) -> User:
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.id == user_id)
            .limit(1)
        )
        user = self.session.execute(stmt).scalar_one_or_none()

        if user is None:
            raise ValueError("User not found")

        role_stmt = (
            select(UserRole)
            .where(UserRole.role == role_name)
            .limit(1)
        )
        role = self.session.execute(role_stmt).scalar_one_or_none()

        if role is None:
            raise ValueError("Role not found")

        user.role_id = role.id
        self.session.flush()
        self.session.refresh(user, attribute_names=["role"])

        return user

    def get_roles(self) -> list[UserRole]:
        stmt = select(UserRole).order_by(UserRole.role.asc())
        return list(self.session.execute(stmt).scalars().all())