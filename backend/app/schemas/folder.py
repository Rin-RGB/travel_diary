from uuid import UUID
from pydantic import BaseModel, Field


# 4.1 GET /api/v1/folders
class FolderItemResponse(BaseModel):
    id: UUID
    name: str
    places_count: int


class FoldersListResponse(BaseModel):
    items: list[FolderItemResponse]
    page: int
    limit: int
    total: int


# 4.2 GET /api/v1/folders/:id
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


# 4.3 POST /api/v1/folders
class FolderCreateRequest(BaseModel):
    name: str


class FolderCreateResponse(BaseModel):
    id: UUID
    name: str


# 4.4 PATCH /api/v1/folders/:id
class FolderUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class FolderUpdateResponse(BaseModel):
    id: UUID
    name: str