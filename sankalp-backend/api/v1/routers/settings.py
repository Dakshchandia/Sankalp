from fastapi import APIRouter, Depends
from middleware.auth_middleware import require_supervisor
from schemas.common import MessageResponse

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", summary="Get system settings")
async def get_settings(_: dict = Depends(require_supervisor)):
    """Return current system configuration."""
    from config.settings import settings
    return {
        "confidenceThreshold": settings.CONFIDENCE_THRESHOLD,
        "lateAfterTime": settings.LATE_AFTER_TIME,
        "workStartTime": settings.WORK_START_TIME,
        "maxFileSizeMb": settings.MAX_FILE_SIZE_MB,
    }


@router.put("", response_model=MessageResponse, summary="Update system settings")
async def update_settings(
    settings_data: dict,
    _: dict = Depends(require_supervisor),
):
    """Update system configuration settings."""
    # In production, persist to database
    return MessageResponse(message="Settings updated successfully")
