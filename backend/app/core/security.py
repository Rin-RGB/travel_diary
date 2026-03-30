from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).timestamp()),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_token_subject(token: str) -> str:
    payload = decode_token(token)
    subject = payload.get("sub")

    if not subject:
        raise JWTError("Token subject is missing")

    return subject


def validate_access_token(token: str) -> str:
    payload = decode_token(token)

    token_type = payload.get("type")
    if token_type != "access":
        raise JWTError("Invalid token type")

    subject = payload.get("sub")
    if not subject:
        raise JWTError("Token subject is missing")

    return subject


def validate_refresh_token(token: str) -> str:
    payload = decode_token(token)

    token_type = payload.get("type")
    if token_type != "refresh":
        raise JWTError("Invalid token type")

    subject = payload.get("sub")
    if not subject:
        raise JWTError("Token subject is missing")

    return subject