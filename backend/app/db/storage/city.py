from sqlalchemy import select
from app.db.models import City


class CityStorage:
    def __init__(self, session):
        self.session = session

    def get_all(self) -> list[City]:
        stmt = select(City).order_by(City.city.asc())
        result = self.session.execute(stmt).scalars().all()
        return result

    def get_by_id(self, city_id):
        stmt = select(City).where(City.id == city_id)
        city = self.session.execute(stmt).scalar_one_or_none()

        if city is None:
            raise ValueError("City not found")

        return city

    def create(self, city: str) -> City:
        existing_stmt = select(City).where(City.city == city)
        existing = self.session.execute(existing_stmt).scalar_one_or_none()

        if existing is not None:
            raise ValueError("City already exists")

        new_city = City(city=city)

        self.session.add(new_city)
        self.session.flush()

        return new_city