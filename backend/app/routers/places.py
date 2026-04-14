from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Depends, status, Response

from app.db.models import Place
from app.db.storage.storage import Storage
from app.schemas.place import (
    PlaceDetailResponse,
    PlaceListItemResponse,
    PlacesListResponse,
    TagResponse,
    PhotoResponse,
    CityResponse,
    PlaceCreateRequest,
    PlaceUpdateRequest,
    PlaceAdminResponse,
    PlaceStatusResponse,
)
from app.core.deps import get_current_admin

router = APIRouter(prefix="/api/v1/places", tags=["Places"])


def _get_cover_photo_url(place: Place) -> str | None:
    for photo in place.photos:
        if photo.is_cover:
            return photo.url
    return None


def _get_tags(place: Place) -> list[TagResponse]:
    result: list[TagResponse] = []

    for tag_place in place.tag_places:
        if tag_place.tag is not None:
            result.append(
                TagResponse(
                    id=tag_place.tag.id,
                    name=tag_place.tag.name,
                )
            )

    return result


def _to_place_list_item(place: Place) -> PlaceListItemResponse:
    return PlaceListItemResponse(
        id=place.id,
        name=place.name,
        city=CityResponse(
            id=place.city.id,
            city=place.city.city,
        ),
        cover_photo=_get_cover_photo_url(place),
        tags=_get_tags(place),
    )


def _to_place_detail(place: Place) -> PlaceDetailResponse:
    return PlaceDetailResponse(
        id=place.id,
        name=place.name,
        address=place.address,
        city=CityResponse(
            id=place.city.id,
            city=place.city.city,
        ),
        description=place.description,
        lat=float(place.lat) if place.lat is not None else None,
        lon=float(place.lon) if place.lon is not None else None,
        photos=[
            PhotoResponse(
                id=photo.id,
                url=photo.url,
                is_cover=photo.is_cover,
            )
            for photo in place.photos
        ],
        tags=_get_tags(place),
    )


def _to_place_admin_detail(place: Place) -> PlaceAdminResponse:
    return PlaceAdminResponse(
        id=place.id,
        name=place.name,
        address=place.address,
        city=CityResponse(
            id=place.city.id,
            city=place.city.city,
        ),
        description=place.description,
        lat=float(place.lat) if place.lat is not None else None,
        lon=float(place.lon) if place.lon is not None else None,
        tags=_get_tags(place),
        photos=[
            PhotoResponse(
                id=photo.id,
                url=photo.url,
                is_cover=photo.is_cover,
            )
            for photo in place.photos
        ],
        status=PlaceStatusResponse(
            id=place.status.id,
            status=place.status.status,
        ),
        created_at=place.created_at,
    )


@router.get("", response_model=PlacesListResponse)
def get_places(
    q: str | None = Query(default=None),
    city: UUID | None = Query(default=None),
    tag: list[UUID] | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    sort: str | None = Query(default=None),
):
    storage = Storage()

    def _f(ctx):
        places, total = ctx.places.get_published(
            page=page,
            limit=limit,
            q=q,
            city=city,
            tags=tag,
            sort=sort,
        )
        items = [_to_place_list_item(place) for place in places]
        return items, total

    try:
        items, total = storage.run(_f)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return PlacesListResponse(
        items=items,
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/{place_id}", response_model=PlaceDetailResponse)
def get_place_by_id(place_id: UUID):
    storage = Storage()

    def _f(ctx):
        place = ctx.places.get_published_by_id(place_id)
        if place is None:
            return None
        return _to_place_detail(place)

    result = storage.run(_f)

    if result is None:
        raise HTTPException(status_code=404, detail="Place not found")

    return result


@router.post("", response_model=PlaceAdminResponse, status_code=status.HTTP_201_CREATED)
def create_place(
    data: PlaceCreateRequest,
    current_admin = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        place = ctx.places.create_place(data=data, admin_id=current_admin.id)
        return _to_place_admin_detail(place)

    try:
        return storage.run(_f)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{place_id}", response_model=PlaceAdminResponse)
def update_place(
    place_id: UUID,
    data: PlaceUpdateRequest,
    current_admin = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        place = ctx.places.update_place(place_id=place_id, data=data)
        return _to_place_admin_detail(place)

    try:
        return storage.run(_f)
    except ValueError as e:
        if str(e) == "Place not found":
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place(
    place_id: UUID,
    current_admin = Depends(get_current_admin),
):
    storage = Storage()

    def _f(ctx):
        ctx.places.delete_place(place_id)

    try:
        storage.run(_f)
    except ValueError as e:
        if str(e) == "Place not found":
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)