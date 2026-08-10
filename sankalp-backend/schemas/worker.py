from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import re


class WorkerCreateRequest(BaseModel):
    workerId: str
    fullName: str
    phone: str
    village: str
    department: str
    dailyWage: float = Field(gt=0)
    gender: Literal["male", "female", "other"]
    age: int = Field(ge=18, le=70)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if not re.match(r"^[6-9]\d{9}$", cleaned):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return cleaned

    @field_validator("workerId")
    @classmethod
    def validate_worker_id(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z0-9\-]+$", v):
            raise ValueError("Worker ID can only contain letters, numbers, and hyphens")
        return v.upper()


class WorkerUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    department: Optional[str] = None
    dailyWage: Optional[float] = Field(default=None, gt=0)
    gender: Optional[Literal["male", "female", "other"]] = None
    age: Optional[int] = Field(default=None, ge=18, le=70)


class WorkerResponse(BaseModel):
    id: str
    workerId: str
    fullName: str
    phone: str
    village: str
    department: str
    dailyWage: float
    gender: str
    age: int
    profileImage: Optional[str] = None
    faceEnrolled: bool
    createdAt: str
    # Computed fields
    attendancePercentage: Optional[float] = 0.0
    presentDays: Optional[int] = 0
    lateDays: Optional[int] = 0
    absentDays: Optional[int] = 0
    expectedMonthlyWage: Optional[float] = 0.0


class WorkerListResponse(BaseModel):
    workers: list[WorkerResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int
