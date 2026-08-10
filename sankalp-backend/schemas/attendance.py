from pydantic import BaseModel
from typing import Optional, Literal


class AttendanceResponse(BaseModel):
    id: str
    workerId: str
    workerName: str
    workerImage: Optional[str] = None
    date: str
    time: str
    status: str
    confidence: float
    capturedImage: Optional[str] = None
    reviewStatus: str
    supervisorId: Optional[str] = None
    createdAt: str


class FaceRecognitionResponse(BaseModel):
    success: bool
    workerId: Optional[str] = None
    workerName: Optional[str] = None
    workerImage: Optional[str] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    message: Optional[str] = None
    requiresReview: bool = False
    attendanceId: Optional[str] = None


class ManualReviewResponse(BaseModel):
    id: str
    attendanceId: str
    attendance: AttendanceResponse
    worker: dict
    reviewedBy: Optional[str] = None
    decision: Optional[str] = None
    remarks: Optional[str] = None
    timestamp: Optional[str] = None
    createdAt: str


class ReviewDecisionRequest(BaseModel):
    decision: Literal["approved", "rejected"]
    remarks: Optional[str] = None


class SessionResponse(BaseModel):
    sessionId: str
    startedAt: str


class ActiveSessionResponse(BaseModel):
    sessionId: Optional[str]
    isActive: bool
