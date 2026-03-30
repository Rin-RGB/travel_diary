from uuid import UUID

from pydantic import BaseModel


# 2.2.1 GET /api/v1/place_statuses
# 2.2.2 GET /api/v1/place_statuses/:id
class PlaceStatusResponse(BaseModel):
    id: UUID
    status: str