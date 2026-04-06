from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import get_current_admin
from app.db.storage.storage import Storage
from app.schemas.tag import TagResponse, TagCreateRequest, TagCreateResponse, TagUpdateRequest, TagUpdateResponse


router = APIRouter(prefix="/api/v1/tags", tags=["Tags"])


@router.get("", response_model=list[TagResponse])
def get_tags():
    storage = Storage()

    def _f(ctx):
        tags = ctx.tags.get_all()
        return [TagResponse(
            id = tag.id,
            name = tag.name,
        ) for tag in tags]

    try:
        return storage.run(_f)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )



@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    body: TagCreateRequest,
    current_admin=Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        tag = ctx.tags.create(body.name)
        return TagResponse(
            id = tag.id,
            name = tag.name,
        )
    try:
        return storage.run(_f)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )




@router.patch("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: UUID,
    body: TagUpdateRequest,
    current_admin=Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        tag = ctx.tags.update_name(
            tag_id=tag_id,
            name=body.name,
        )
        return TagResponse(
            id = tag.id,
            name = tag.name,
        )

    try:
        return storage.run(_f)
    except ValueError as e:
        if str(e) == "Tag not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )




@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: UUID,
    current_admin=Depends(get_current_admin),
):
    storage = Storage()

    try:
        storage.run(
            lambda ctx: ctx.tags.delete(tag_id)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)