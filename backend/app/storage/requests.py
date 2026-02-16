from sqlalchemy.orm import Session


# ДОБАВИТЬ
class RequestsStorage:
    def __init__(self, session: Session) -> None:
        self._s = session
