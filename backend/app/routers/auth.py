from __future__ import annotations

import random

from fastapi import APIRouter, HTTPException, Response, status
from jose import JWTError

from app.core.security import (
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
)
from app.db.storage.storage import Storage
from app.schemas.auth import (
    AuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SendCodeRequest,
    UserAuthResponse,
    VerifyCodeRequest,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


def _generate_code() -> str:
    return str(random.randint(100000, 999999))


@router.post("/code", status_code=status.HTTP_204_NO_CONTENT)
def send_code(body: SendCodeRequest):
    storage = Storage()
    code = _generate_code()

    storage.run(
        lambda ctx: ctx.auth.create_code(
            email=body.email,
            code=code,
            ttl_minutes=5,
        )
    )

    print(f"[AUTH CODE] {body.email}: {code}")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/verify", response_model=AuthResponse)
def verify_code(body: VerifyCodeRequest):
    storage = Storage()

    def _verify(ctx):
        user = ctx.auth.verify(
            email=body.email,
            code=body.code,
        )

        user_data = UserAuthResponse.model_validate(user)

        return {
            "access_token": create_access_token(str(user_data.id)),
            "refresh_token": create_refresh_token(str(user_data.id)),
            "user": user_data,
        }

    try:
        result = storage.run(_verify)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return AuthResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=result["user"],
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh_token(body: RefreshTokenRequest):
    storage = Storage()

    try:
        user_id = validate_refresh_token(body.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    def _load(ctx):
        user = ctx.auth.get_user_by_id(user_id=user_id)
        if user is None:
            return None
        return str(user.id)

    user_id_from_db = storage.run(_load)

    if user_id_from_db is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    new_access_token = create_access_token(user_id_from_db)
    return RefreshTokenResponse(access_token=new_access_token)