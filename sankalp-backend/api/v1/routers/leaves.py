from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from middleware.auth_middleware import get_current_user, require_supervisor, require_worker
from database.connection import get_database
from services.audit_service import audit_service
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/leaves", tags=["Leaves"])


def _fmt(doc: dict) -> dict:
    doc["id"] = str(doc["_id"]); doc.pop("_id", None)
    for f in ["createdAt", "updatedAt", "decidedAt"]:
        if f in doc and hasattr(doc[f], "isoformat"):
            doc[f] = doc[f].isoformat()
    return doc


# ── Worker: submit leave ──────────────────────────────────────────
@router.post("", summary="Submit a leave application")
async def submit_leave(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")

    db = get_database()
    doc = {
        "workerId":   worker_id,
        "workerName": current_user.get("name", ""),
        "leaveType":  body.get("leaveType", "Personal Leave"),
        "startDate":  body.get("startDate"),
        "endDate":    body.get("endDate"),
        "reason":     body.get("reason", ""),
        "status":     "pending",
        "createdAt":  datetime.utcnow(),
        "updatedAt":  datetime.utcnow(),
    }
    result = await db.leaves.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


# ── Worker: my leave history ──────────────────────────────────────
@router.get("/me", summary="Get current worker's leave history")
async def get_my_leaves(current_user: dict = Depends(get_current_user)):
    worker_id = current_user.get("workerId")
    if not worker_id:
        return []
    db = get_database()
    leaves = await db.leaves.find({"workerId": worker_id}).sort("createdAt", -1).to_list(100)
    return [_fmt(l) for l in leaves]


# ── Manager: all pending leaves ───────────────────────────────────
@router.get("/pending", summary="Get all pending leave requests")
async def get_pending_leaves(_: dict = Depends(require_supervisor)):
    db = get_database()
    leaves = await db.leaves.find({"status": "pending"}).sort("createdAt", -1).to_list(200)
    return [_fmt(l) for l in leaves]


# ── Manager: all leaves ───────────────────────────────────────────
@router.get("", summary="Get all leave requests")
async def get_all_leaves(
    status: Optional[str] = Query(None),
    _: dict = Depends(require_supervisor),
):
    db = get_database()
    q = {}
    if status: q["status"] = status
    leaves = await db.leaves.find(q).sort("createdAt", -1).to_list(500)
    return [_fmt(l) for l in leaves]


# ── Manager: approve / reject ─────────────────────────────────────
@router.post("/{leave_id}/decide", summary="Approve or reject a leave request")
async def decide_leave(
    leave_id: str,
    body: dict,
    supervisor: dict = Depends(require_supervisor),
):
    from fastapi import HTTPException
    db = get_database()
    decision = body.get("decision")
    if decision not in ("approved", "rejected"):
        raise HTTPException(400, "decision must be 'approved' or 'rejected'")

    leave = await db.leaves.find_one({"_id": ObjectId(leave_id)})
    if not leave:
        raise HTTPException(404, "Leave request not found")

    await db.leaves.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {
            "status":      decision,
            "decidedBy":   supervisor.get("name"),
            "decidedAt":   datetime.utcnow(),
            "rejectReason": body.get("rejectReason", ""),
            "updatedAt":   datetime.utcnow(),
        }},
    )

    await audit_service.log(
        action=f"Leave {decision.title()}",
        performed_by=supervisor["name"],
        performed_by_id=str(supervisor["_id"]),
        description=f"Leave request {leave_id} for worker {leave.get('workerId')} {decision}",
    )

    updated = await db.leaves.find_one({"_id": ObjectId(leave_id)})
    return _fmt(updated)
