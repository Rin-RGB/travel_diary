from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


# общ
class CityResponse(BaseModel):
    id: UUID
    city: str

    model_config = ConfigDict(from_attributes=True)

class TagResponse(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)

class PhotoResponse(BaseModel):
    id: UUID
    url: str
    is_cover: bool

    model_config = ConfigDict(from_attributes=True)


# 2.1 GET /api/v1/places
# 2.2 GET /api/v1/places/feed
class PlaceListItemResponse(BaseModel):
    id: UUID
    name: str
    city: CityResponse
    cover_photo: Optional[str]
    tags: list[TagResponse]

class PlacesListResponse(BaseModel):
    items: list[PlaceListItemResponse]
    page: int
    limit: int
    total: int


# 2.3 GET /api/v1/places/:id
class PlaceDetailResponse(BaseModel):
    id: UUID
    name: str
    address: str
    city: CityResponse
    description: str
    lat: float | None = None
    lon: float | None = None
    photos: list[PhotoResponse]
    tags: list[TagResponse]


# 2.4 POST /api/v1/places
class PlaceCreateRequest(BaseModel):
    name: str
    address: str
    city_id: UUID
    description: str
    lat: float | None = None
    lon: float | None = None
    tags: list[UUID]
    photo_urls: list[str]


class PlaceStatusResponse(BaseModel):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)


# 2.4 POST /api/v1/places
# 2.5 PATCH /api/v1/places/:id
class PlaceAdminResponse(BaseModel):
    id: UUID
    name: str
    address: str
    city: CityResponse
    description: str
    lat: float | None = None
    lon: float | None = None
    tags: list[TagResponse]
    photos: list[PhotoResponse]
    status: PlaceStatusResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 2.5 PATCH /api/v1/places/:id
class PlaceUpdateRequest(BaseModel):
    name: str | None = None
    address: str | None = None
    city_id: UUID | None = None
    description: str | None = None
    lat: float | None = None
    lon: float | None = None
    tags: list[UUID] | None = None
    photo_urls: list[str] | None = None


