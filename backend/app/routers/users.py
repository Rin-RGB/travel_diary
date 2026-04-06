from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from uuid import UUID

from app.core.deps import get_current_user, get_current_admin
from app.db.models import User
from app.db.storage.storage import Storage

from app.schemas.user import UserRoleResponse, UserMeResponse, UserMeUpdateRequest, UserMeUpdateResponse, UserRoleUpdateRequest, UserRoleUpdateResponse, RoleResponse

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserMeResponse)
def get_me(current_user=Depends(get_current_user)):
    storage = Storage()

    def _f(ctx):
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

    result = storage.run(_f)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return result


@router.patch("/me", response_model=UserMeUpdateResponse)
def update_me(
    body: UserMeUpdateRequest,
    current_user = Depends(get_current_user),
):
    storage = Storage()

    def _f(ctx):
        user = ctx.users.update_me(
            user_id=current_user.id,
            name=body.name,
        )
        return UserMeUpdateResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=UserRoleResponse(
                id=user.role.id,
                role=user.role.role,
            ),
        )

    try:
        return storage.run(_f)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    current_user = Depends(get_current_user),
):
    storage = Storage()

    try:
        storage.run(lambda ctx: ctx.users.delete_me(current_user.id))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{user_id}/role", response_model=UserRoleUpdateResponse)
def update_user_role(
    user_id: UUID,
    body: UserRoleUpdateRequest,
    current_admin = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        user = ctx.users.update_role(
            user_id=user_id,
            role_name=body.role,
        )
        return UserRoleUpdateResponse(
            id=user.id,
            role=UserRoleResponse(
                id=user.role.id,
                role=user.role.role,
            ),
        )

    try:
        return storage.run(_f)
    except ValueError as e:
        if str(e) == "User not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/roles", response_model=list[RoleResponse])
def get_user_roles(
    current_admin = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        roles = ctx.users.get_roles()
        return [
            RoleResponse(
                id=role.id,
                role=role.role,
            )
            for role in roles
        ]

    return storage.run(_f)