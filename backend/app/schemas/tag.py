from uuid import UUID
from pydantic import BaseModel, Field


# 6.1 GET /api/v1/tags
class TagResponse(BaseModel):
    id: UUID
    name: str


# 6.2 POST /api/v1/tags
class TagCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class TagCreateResponse(BaseModel):
    id: UUID
    name: str


# 6.3 PATCH /api/v1/tags/:id
class TagUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class TagUpdateResponse(BaseModel):
    id: UUID
    name: str
