from __future__ import annotations

from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Tag, TagPlace

# ТЭГИ
class TagsStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

