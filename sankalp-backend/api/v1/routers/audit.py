from fastapi import APIRouter, Depends, Query
from typing import Optional
from services.audit_service import audit_service
from middleware.auth_middleware import require_supervisor

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("", summary="Get all audit logs")
async def get_audit_logs(
    search: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(50, ge=1, le=200),
    _: dict = Depends(require_supervisor),
):
    """Return paginated audit logs for supervisor accountability."""
    return await audit_service.get_logs(search=search, action=action, page=page, page_size=pageSize)
