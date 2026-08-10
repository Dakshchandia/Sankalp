from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime


class WorkerModel(BaseModel):
    """MongoDB Worker document model."""
    id: Optional[str] = Field(default=None, alias="_id")
    workerId: str  # Unique identifier like WRK-001
    fullName: str
    phone: str
    village: str
    department: str
    dailyWage: float
    gender: Literal["male", "female", "other"]
    age: int
    profileImage: Optional[str] = None  # Stored filename
    faceEmbeddings: Optional[List[List[float]]] = None  # Face recognition embeddings
    faceEnrolled: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
