from sqlalchemy import select

from app.core.reference_data import PLACE_STATUSES, USER_ROLES
from app.db.models import PlaceStatus, UserRole


def load_reference_data(session) -> None:
    PLACE_STATUSES.clear()
    USER_ROLES.clear()

    for item in session.execute(select(PlaceStatus)).scalars():
        PLACE_STATUSES[item.status] = item.id

    for item in session.execute(select(UserRole)).scalars():
        USER_ROLES[item.role] = item.id

    required_statuses = ("approved", "pending", "revision")
    required_roles = ("admin", "user")

    for name in required_statuses:
        if name not in PLACE_STATUSES:
            raise RuntimeError(f"Status '{name}' not found")

    for name in required_roles:
        if name not in USER_ROLES:
            raise RuntimeError(f"Role '{name}' not found")