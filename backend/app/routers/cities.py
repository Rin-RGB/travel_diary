from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_admin
from app.db.storage.storage import Storage
from app.schemas.city import (
    CityCreateRequest,
    CityCreateResponse,
    CityItemResponse,
    CityResponse,
)

router = APIRouter(prefix="/api/v1/cities", tags=["Cities"])


@router.get("", response_model=list[CityItemResponse])
def get_cities():
    storage = Storage()

    def _load(ctx):
        cities = ctx.cities.get_all()
        return [
            CityItemResponse(
                id=city.id,
                city=city.city,
            )
            for city in cities
        ]

    return storage.run(_load)


@router.get("/{city_id}", response_model=CityResponse)
def get_city(city_id: UUID):
    storage = Storage()

    def _load(ctx):
        city = ctx.cities.get_by_id(city_id)
        return CityResponse(
            id=city.id,
            city=city.city,
        )

    try:
        return storage.run(_load)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("", response_model=CityCreateResponse, status_code=status.HTTP_201_CREATED)
def create_city(
    body: CityCreateRequest,
    current_admin=Depends(get_current_admin),
):
    storage = Storage()

    def _load(ctx):
        city = ctx.cities.create(body.city)
        return CityCreateResponse(
            id=city.id,
            city=city.city,
        )

    try:
        return storage.run(_load)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )