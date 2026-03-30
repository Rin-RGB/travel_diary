from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.core.security import validate_access_token
from app.db.storage.storage import Storage
from app.schemas.auth import UserAuthResponse

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> UserAuthResponse:
    token = credentials.credentials

    try:
        user_id = validate_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    storage = Storage()

    def _load(ctx):
        user = ctx.auth.get_user_by_id(user_id=user_id)
        if user is None:
            return None
        return UserAuthResponse.model_validate(user)

    user = storage.run(_load)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user