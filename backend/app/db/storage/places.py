from __future__ import annotations
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import City, Photo, Place, PlaceStatus, Tag, TagPlace


class PlacesStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

