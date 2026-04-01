from uuid import UUID

from sqlalchemy import select
from app.db.models import Tag


class TagsStorage:
    def __init__(self, session):
        self.session = session

    def get_all(self) -> list[Tag]:
        stmt = select(Tag).order_by(Tag.name.asc())
        return self.session.execute(stmt).scalars().all()

    def create(self, name: str) -> Tag:
        existing_stmt = select(Tag).where(Tag.name == name)
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing is not None:
            raise ValueError("Tag already exists")

        tag = Tag(name=name)
        self.session.add(tag)
        self.session.flush()

        return tag

    def update_name(self, tag_id: UUID, name: str) -> Tag:
        stmt = select(Tag).where(Tag.id == tag_id)
        tag = self.session.execute(stmt).scalar_one_or_none()

        if tag is None:
            raise ValueError("Tag not found")

        existing_stmt = select(Tag).where(
            Tag.name == name,
            Tag.id != tag_id,
        )
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing is not None:
            raise ValueError("Tag already exists")

        tag.name = name
        self.session.flush()

        return tag

    def delete(self, tag_id: UUID) -> None:
        stmt = select(Tag).where(Tag.id == tag_id)
        tag = self.session.execute(stmt).scalar_one_or_none()

        if tag is None:
            raise ValueError("Tag not found")

        self.session.delete(tag)
        self.session.flush()