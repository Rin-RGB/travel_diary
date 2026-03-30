from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# 3.1 GET /api/v1/cities
class CityItemResponse(BaseModel):
    id: UUID
    city: str

    model_config = ConfigDict(from_attributes=True)


# 3.2 GET /api/v1/cities/:id
class CityResponse(BaseModel):
    id: UUID
    city: str

    model_config = ConfigDict(from_attributes=True)


# 3.3 POST /api/v1/cities
class CityCreateRequest(BaseModel):
    city: str = Field(min_length=1, max_length=120)


class CityCreateResponse(BaseModel):
    id: UUID
    city: str

    model_config = ConfigDict(from_attributes=True)