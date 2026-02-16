from __future__ import annotations

from sqlalchemy.orm import Session


class AdminStorage:
    # ДОБАВИТЬ
    def __init__(self, session: Session) -> None:
        self._s = session
