from __future__ import annotations

from fastapi import APIRouter, Depends, Query,  HTTPException, status,  Response

from app.core.deps import get_current_user
from app.db.storage.storage import Storage
from app.schemas.auth import UserAuthResponse
from app.schemas.folder import FoldersListResponse, FolderCreateRequest
from app.schemas.folder import FolderDetailResponse, FolderCreateResponse
from app.schemas.folder import FolderUpdateResponse, FolderUpdateRequest
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

@router.post("", status_code=status.HTTP_201_CREATED, response_model=FolderCreateResponse)
def create_folder(
    body: FolderCreateRequest,
    current_user=Depends(get_current_user),
):
    storage = Storage()

    folder = storage.run(
        lambda ctx: ctx.folders.create(
            user_id=current_user.id,
            name=body.name,
        )
    )

    return FolderCreateResponse(
        id=folder.id,
        name=folder.name,
    )

@router.patch("/{folder_id}", response_model=FolderUpdateResponse)
def update_folder(
    folder_id: UUID,
    body: FolderUpdateRequest,
    current_user=Depends(get_current_user),
):
    storage = Storage()

    try:
        folder = storage.run(
            lambda ctx: ctx.folders.update_name(
                folder_id=folder_id,
                user_id=current_user.id,
                name=body.name,
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return FolderUpdateResponse(
        id=folder.id,
        name=folder.name,
    )

@router.post("/{folder_id}/places/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_place_to_folder(
    folder_id: UUID,
    place_id: UUID,
    current_user=Depends(get_current_user),
):
    storage = Storage()

    try:
        storage.run(
            lambda ctx: ctx.folders.add_place(
                folder_id=folder_id,
                place_id=place_id,
                user_id=current_user.id,
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{folder_id}/places/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_place_from_folder(
    folder_id: UUID,
    place_id: UUID,
    current_user=Depends(get_current_user),
):
    storage = Storage()

    try:
        storage.run(
            lambda ctx: ctx.folders.remove_place(
                folder_id=folder_id,
                place_id=place_id,
                user_id=current_user.id,
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
