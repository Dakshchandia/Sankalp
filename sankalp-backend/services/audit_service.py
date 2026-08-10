from database.connection import get_database
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class AuditService:
    """
    Audit logging service.
    Every important action in SANKALP creates an audit log entry.
    """

    async def log(
        self,
        action: str,
        performed_by: str,
        performed_by_id: str,
        description: str,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Insert an audit log entry.
        This is fire-and-forget — errors are logged but not raised.
        """
        try:
            db = get_database()
            await db.audit_logs.insert_one({
                "action": action,
                "performedBy": performed_by,
                "performedById": performed_by_id,
                "description": description,
                "timestamp": datetime.utcnow(),
                "metadata": metadata or {},
            })
        except Exception as e:
            logger.error(f"Audit log failed for action '{action}': {e}")

    async def get_logs(
        self,
        search: Optional[str] = None,
        action: Optional[str] = None,
        page: int = 1,
        page_size: int = 50,
    ) -> list:
        """Retrieve paginated audit logs, newest first."""
        db = get_database()
        query: dict = {}

        if action:
            query["action"] = action
        if search:
            query["$or"] = [
                {"action": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"performedBy": {"$regex": search, "$options": "i"}},
            ]

        skip = (page - 1) * page_size
        logs = await db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(page_size).to_list(length=page_size)

        result = []
        for log in logs:
            log["id"] = str(log["_id"])
            log.pop("_id", None)
            if "timestamp" in log:
                log["timestamp"] = log["timestamp"].isoformat()
            result.append(log)

        return result


audit_service = AuditService()
