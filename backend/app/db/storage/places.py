from sqlalchemy.orm import Session


# МЕСТА
class PlacesStorage:
    def __init__(self, session: Session) -> None:
        self._s = session

