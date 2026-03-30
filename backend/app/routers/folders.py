from __future__ import annotations

from fastapi import APIRouter, Depends, Query,  HTTPException, status

from app.core.deps import get_current_user
from app.db.storage.storage import Storage
from app.schemas.auth import UserAuthResponse
from app.schemas.folder import FoldersListResponse
from app.schemas.folder import FolderDetailResponse

from uuid import UUID

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


@router.get("/{id}", response_model=FolderDetailResponse)
def get_folder_by_id(
    id: UUID,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    sort: str | None = Query(default=None),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    storage = Storage()

    try:
        result = storage.run(
            lambda ctx: ctx.folders.get_folder_with_places(
                folder_id=id,
                user_id=current_user.id,
                page=page,
                limit=limit,
                sort=sort,
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found",
        )

    return FolderDetailResponse(**result)
