from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


# 5.1 GET /api/v1/users/me
class UserRoleResponse(BaseModel):
    id: int
    role: str


class UserMeResponse(BaseModel):
    id: UUID
    name: str | None
    email: EmailStr
    role: UserRoleResponse
    created_at: datetime


# 5.2 PATCH /api/v1/users/me
class UserMeUpdateRequest(BaseModel):
    name: str | None = None


class UserMeUpdateResponse(BaseModel):
    id: UUID
    name: str | None
    email: EmailStr
    role: UserRoleResponse


# 5.4 PATCH /api/v1/users/:id/role
class UserRoleUpdateRequest(BaseModel):
    role: str


class UserRoleUpdateResponse(BaseModel):
    id: UUID
    role: UserRoleResponse


# 5.5 GET /api/v1/users/roles
class RoleResponse(BaseModel):
    id: int
    role: str

