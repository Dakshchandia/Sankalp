from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class AttendanceModel(BaseModel):
    """MongoDB Attendance document model."""
    id: Optional[str] = Field(default=None, alias="_id")
    workerId: str
    workerName: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM:SS format
    status: Literal["present", "late", "absent", "pending_review"]
    confidence: float = 0.0
    capturedImage: Optional[str] = None  # Stored filename
    reviewStatus: Literal["auto_approved", "pending", "approved", "rejected"] = "auto_approved"
    supervisorId: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class ManualReviewModel(BaseModel):
    """MongoDB ManualReview document model."""
    id: Optional[str] = Field(default=None, alias="_id")
    attendanceId: str
    workerId: str
    reviewedBy: Optional[str] = None
    decision: Optional[Literal["approved", "rejected"]] = None
    remarks: Optional[str] = None
    timestamp: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
