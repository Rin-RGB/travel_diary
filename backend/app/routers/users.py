from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user
from app.db.models import User
from app.db.storage.storage import Storage

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    storage = Storage()

    def _load(ctx):
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.id == current_user.id)
            .limit(1)
        )
        user = ctx.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return None

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": {
                "id": user.role.id,
                "role": user.role.role,
            },
            "created_at": user.created_at,
        }

    result = storage.run(_load)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return result