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