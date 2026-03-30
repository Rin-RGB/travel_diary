from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# 1.1 POST /api/v1/auth/code
class SendCodeRequest(BaseModel):
    email: EmailStr

# 1.2 POST /api/v1/auth/verify
class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)

class UserAuthResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str | None
    role_id: int
    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserAuthResponse

# 1.3 `POST /api/v1/auth/refresh
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str