from pydantic import BaseModel
from typing import Optional


class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = 1
    pageSize: int = 10
    sortBy: Optional[str] = None
    sortOrder: str = "desc"

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.pageSize
