from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


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


class PlaceDetailResponse(BaseModel):
    id: UUID
    name: str
    address: str
    city: CityResponse
    description: str
    lat: float  | None = None
    lon: float  | None = None
    photos: list[PhotoResponse]
    tags: list[TagResponse]