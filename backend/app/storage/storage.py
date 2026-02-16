from app.db.session import SessionLocal
from app.storage.context import StorageContext


class Storage:
    def __init__(self):
        self._session_factory = SessionLocal

    def run(self, fn):
        session = self._session_factory()
        try:
            ctx = StorageContext(session=session)
            result = fn(ctx) # переданная функция (из context), действие
            session.commit()
            return result
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
