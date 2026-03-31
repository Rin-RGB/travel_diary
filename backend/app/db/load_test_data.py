from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.session import engine, SessionLocal
from app.db.models import (
    Base,
    UserRole,
    PlaceStatus,
    User,
    City,
    Tag,
    Folder,
    Place,
    Photo,
    TagPlace,
    FolderPlace,
    PlaceComment,
    EmailCode,
)


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_reference_data(session: Session):
    roles = [
        UserRole(id=1, role="admin"),
        UserRole(id=2, role="user"),
    ]

    statuses = [
        PlaceStatus(id=1, status="approved"),
        PlaceStatus(id=2, status="pending"),
        PlaceStatus(id=3, status="revision"),
    ]

    session.add_all(roles + statuses)
    session.flush()


def seed_cities(session: Session):
    cities = [
        City(id=uuid4(), city="Москва"),
        City(id=uuid4(), city="Санкт-Петербург"),
        City(id=uuid4(), city="Казань"),
        City(id=uuid4(), city="Екатеринбург"),
        City(id=uuid4(), city="Нижний Новгород"),
    ]
    session.add_all(cities)
    session.flush()
    return {c.city: c for c in cities}


def seed_tags(session: Session):
    tags = [
        Tag(id=uuid4(), name="кофейня"),
        Tag(id=uuid4(), name="ресторан"),
        Tag(id=uuid4(), name="вид"),
        Tag(id=uuid4(), name="парк"),
        Tag(id=uuid4(), name="музей"),
        Tag(id=uuid4(), name="атмосферно"),
        Tag(id=uuid4(), name="для прогулки"),
        Tag(id=uuid4(), name="десерты"),
    ]
    session.add_all(tags)
    session.flush()
    return {t.name: t for t in tags}


def seed_users_and_folders(session: Session):
    admin = User(
        id=uuid4(),
        name="admin",
        email="admin@example.com",
        role_id=1,
    )

    user = User(
        id=uuid4(),
        name="test",
        email="test@example.com",
        role_id=2,
    )

    session.add_all([admin, user])
    session.flush()

    folders = [
        Folder(id=uuid4(), name="Хочу посетить", id_user=user.id),
        Folder(id=uuid4(), name="Посещено", id_user=user.id),
        Folder(id=uuid4(), name="Избранное", id_user=user.id),
        Folder(id=uuid4(), name="Мои кафе", id_user=user.id),
    ]

    session.add_all(folders)
    session.flush()

    folders_map = {f.name: f for f in folders}
    return admin, user, folders_map


def seed_places(session: Session, admin: User, user: User, cities: dict[str, City]):
    places = [
        Place(
            id=uuid4(),
            name="Skylight Coffee",
            id_admin=admin.id,
            id_user=user.id,
            address="ул. Тверская, 12",
            id_city=cities["Москва"].id,
            description="Светлая кофейня в центре города с десертами и большими окнами.",
            lat=Decimal("55.765200"),
            lon=Decimal("37.604500"),
            id_status=1,  # approved
        ),
        Place(
            id=uuid4(),
            name="Летний садик",
            id_admin=admin.id,
            id_user=user.id,
            address="наб. Кутузова, 2",
            id_city=cities["Санкт-Петербург"].id,
            description="Спокойное место для прогулки, зелень и приятная атмосфера.",
            lat=Decimal("59.948600"),
            lon=Decimal("30.337800"),
            id_status=1,  # approved
        ),
        Place(
            id=uuid4(),
            name="Museum Lab",
            id_admin=None,
            id_user=user.id,
            address="ул. Баумана, 19",
            id_city=cities["Казань"].id,
            description="Небольшой музейный проект с современными выставками.",
            lat=Decimal("55.790400"),
            lon=Decimal("49.114000"),
            id_status=2,  # pending
        ),
        Place(
            id=uuid4(),
            name="Panorama Point",
            id_admin=admin.id,
            id_user=user.id,
            address="пр. Ленина, 44",
            id_city=cities["Екатеринбург"].id,
            description="Точка с красивым видом на город, особенно вечером.",
            lat=Decimal("56.838900"),
            lon=Decimal("60.605700"),
            id_status=3,  # revision
        ),
    ]

    session.add_all(places)
    session.flush()
    return {p.name: p for p in places}


def seed_photos(session: Session, places: dict[str, Place]):
    photos = [
        Photo(
            id=uuid4(),
            url="https://images.unsplash.com/photo-1509042239860-f550ce710b93",
            is_cover=True,
            id_place=places["Skylight Coffee"].id,
        ),
        Photo(
            id=uuid4(),
            url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
            is_cover=False,
            id_place=places["Skylight Coffee"].id,
        ),
        Photo(
            id=uuid4(),
            url="https://images.unsplash.com/photo-1501785888041-af3ef285b470",
            is_cover=True,
            id_place=places["Летний садик"].id,
        ),
        Photo(
            id=uuid4(),
            url="https://images.unsplash.com/photo-1518998053901-5348d3961a04",
            is_cover=True,
            id_place=places["Museum Lab"].id,
        ),
        Photo(
            id=uuid4(),
            url="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
            is_cover=True,
            id_place=places["Panorama Point"].id,
        ),
    ]
    session.add_all(photos)
    session.flush()


def seed_tag_links(session: Session, places: dict[str, Place], tags: dict[str, Tag]):
    links = [
        TagPlace(id_tag=tags["кофейня"].id, id_place=places["Skylight Coffee"].id),
        TagPlace(id_tag=tags["десерты"].id, id_place=places["Skylight Coffee"].id),
        TagPlace(id_tag=tags["атмосферно"].id, id_place=places["Skylight Coffee"].id),

        TagPlace(id_tag=tags["парк"].id, id_place=places["Летний садик"].id),
        TagPlace(id_tag=tags["для прогулки"].id, id_place=places["Летний садик"].id),
        TagPlace(id_tag=tags["вид"].id, id_place=places["Летний садик"].id),

        TagPlace(id_tag=tags["музей"].id, id_place=places["Museum Lab"].id),
        TagPlace(id_tag=tags["атмосферно"].id, id_place=places["Museum Lab"].id),

        TagPlace(id_tag=tags["вид"].id, id_place=places["Panorama Point"].id),
        TagPlace(id_tag=tags["для прогулки"].id, id_place=places["Panorama Point"].id),
    ]
    session.add_all(links)
    session.flush()


def seed_folder_links(session: Session, folders: dict[str, Folder], places: dict[str, Place]):
    links = [
        FolderPlace(
            id_folder=folders["Хочу посетить"].id,
            id_place=places["Skylight Coffee"].id,
        ),
        FolderPlace(
            id_folder=folders["Хочу посетить"].id,
            id_place=places["Летний садик"].id,
        ),
        FolderPlace(
            id_folder=folders["Посещено"].id,
            id_place=places["Skylight Coffee"].id,
        ),
        FolderPlace(
            id_folder=folders["Избранное"].id,
            id_place=places["Летний садик"].id,
        ),
        FolderPlace(
            id_folder=folders["Мои кафе"].id,
            id_place=places["Skylight Coffee"].id,
        ),
    ]
    session.add_all(links)
    session.flush()


def seed_comments(session: Session, admin: User, places: dict[str, Place]):
    comments = [
        PlaceComment(
            id=uuid4(),
            id_place=places["Museum Lab"].id,
            id_admin=admin.id,
            text="Нужно добавить более точное описание и фото фасада.",
        ),
        PlaceComment(
            id=uuid4(),
            id_place=places["Panorama Point"].id,
            id_admin=admin.id,
            text="Уточни адрес и проверь координаты.",
        ),
    ]
    session.add_all(comments)
    session.flush()


def seed_email_codes(session: Session):
    now = datetime.now(timezone.utc)
    codes = [
        EmailCode(
            id=uuid4(),
            email="test@example.com",
            code="123456",
            expires_at=now + timedelta(minutes=10),
            is_used=False,
        ),
        EmailCode(
            id=uuid4(),
            email="admin@example.com",
            code="654321",
            expires_at=now + timedelta(minutes=10),
            is_used=False,
        ),
    ]
    session.add_all(codes)
    session.flush()


def seed_all():
    reset_db()

    with SessionLocal() as session:
        seed_reference_data(session)
        cities = seed_cities(session)
        tags = seed_tags(session)
        admin, user, folders = seed_users_and_folders(session)
        places = seed_places(session, admin, user, cities)
        seed_photos(session, places)
        seed_tag_links(session, places, tags)
        seed_folder_links(session, folders, places)
        seed_comments(session, admin, places)
        seed_email_codes(session)

        session.commit()

    print("DB recreated and test data inserted successfully.")


if __name__ == "__main__":
    seed_all()