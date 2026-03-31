from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_admin
from app.db.storage.storage import Storage
from app.schemas.auth import UserAuthResponse
from app.schemas.place_status import PlaceStatusResponse

router = APIRouter(prefix="/api/v1/place_statuses", tags=["Place Statuses"])


@router.get("", response_model=list[PlaceStatusResponse])
def get_place_statuses(
    current_user: UserAuthResponse = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        statuses = ctx.place_statuses.get_all()
        return [
            PlaceStatusResponse(
                id=status_obj.id,
                status=status_obj.status,
            )
            for status_obj in statuses
        ]

    return storage.run(_f)


@router.get("/{status_id}", response_model=PlaceStatusResponse)
def get_place_status(
    status_id: UUID,
    current_user: UserAuthResponse = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        status_obj = ctx.place_statuses.get_by_id(status_id)
        return PlaceStatusResponse(
            id=status_obj.id,
            status=status_obj.status,
        )

    try:
        return storage.run(_f)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )