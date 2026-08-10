from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


class UserModel(BaseModel):
    """MongoDB User document model."""
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password: str  # bcrypt hashed — never expose in responses
    role: Literal["supervisor", "worker"] = "supervisor"
    workerId: Optional[str] = None  # Only for worker-role users
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
