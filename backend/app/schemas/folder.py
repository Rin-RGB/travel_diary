from uuid import UUID

from pydantic import BaseModel


class FolderItemResponse(BaseModel):
    id: UUID
    name: str
    places_count: int


class FoldersListResponse(BaseModel):
    items: list[FolderItemResponse]
    page: int
    limit: int
    total: int


class FolderPlaceItem(BaseModel):
    id: UUID
    name: str
    city: str
    cover_photo: str | None
    tags: list[str]


class FolderDetailResponse(BaseModel):
    id: UUID
    name: str
    places: list[FolderPlaceItem]
    page: int
    limit: int
    total: int

class FolderCreateRequest(BaseModel):
    name: str


class FolderCreateResponse(BaseModel):
    id: UUID
    name: str