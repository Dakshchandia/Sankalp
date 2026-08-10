from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    workerId: Optional[str] = None   # populated for worker-role accounts
    createdAt: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


TokenResponse.model_rebuild()
