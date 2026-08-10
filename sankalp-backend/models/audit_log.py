from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AuditLogModel(BaseModel):
    """MongoDB AuditLog document model. Every supervisor action is recorded here."""
    id: Optional[str] = Field(default=None, alias="_id")
    action: str       # e.g., "Worker Created", "Attendance Approved"
    performedBy: str  # Supervisor name or ID
    performedById: str
    description: str  # Human-readable description
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = None  # Extra context (workerId, etc.)

    class Config:
        populate_by_name = True
