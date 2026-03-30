from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.db.storage.storage import Storage
from app.schemas.auth import UserAuthResponse
from app.schemas.folder import FoldersListResponse

router = APIRouter(prefix="/api/v1/folders", tags=["Folders"])


@router.get("", response_model=FoldersListResponse)
def get_folders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    storage = Storage()

    items, total = storage.run(
        lambda ctx: ctx.folders.get_user_folders(
            user_id=current_user.id,
            page=page,
            limit=limit,
        )
    )

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
    }