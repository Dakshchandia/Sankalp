from fastapi import APIRouter, Depends, HTTPException
from services.audit_service import audit_service
from middleware.auth_middleware import require_supervisor
from schemas.attendance import ReviewDecisionRequest
from database.connection import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/manual-reviews", tags=["Manual Reviews"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    for key in ["createdAt", "timestamp"]:
        if key in doc and doc[key]:
            doc[key] = doc[key].isoformat()
    return doc


@router.get("/pending", summary="Get all pending manual reviews")
async def get_pending_reviews(_: dict = Depends(require_supervisor)):
    """Return all attendance records awaiting supervisor review."""
    db = get_database()

    # Get pending reviews
    reviews = await db.manual_reviews.find({"decision": None}).sort("createdAt", -1).to_list(length=100)

    result = []
    for review in reviews:
        # Fetch attendance record
        att = await db.attendance.find_one({"_id": ObjectId(review["attendanceId"])})
        if not att:
            continue

        # Fetch worker info
        worker = await db.workers.find_one({"workerId": review["workerId"]})

        att_doc = {
            "id": str(att["_id"]),
            "workerId": att["workerId"],
            "workerName": att["workerName"],
            "date": att["date"],
            "time": att["time"],
            "status": att["status"],
            "confidence": att["confidence"],
            "capturedImage": att.get("capturedImage"),
            "reviewStatus": att["reviewStatus"],
            "createdAt": att["createdAt"].isoformat(),
        }

        worker_doc = {
            "workerId": worker["workerId"],
            "fullName": worker["fullName"],
            "profileImage": worker.get("profileImage"),
            "village": worker.get("village", ""),
            "department": worker.get("department", ""),
        } if worker else {"workerId": review["workerId"], "fullName": "Unknown", "profileImage": None, "village": "", "department": ""}

        result.append({
            "id": str(review["_id"]),
            "attendanceId": review["attendanceId"],
            "attendance": att_doc,
            "worker": worker_doc,
            "decision": review.get("decision"),
            "remarks": review.get("remarks"),
            "createdAt": review["createdAt"].isoformat(),
        })

    return result


@router.post("/{review_id}/decide", summary="Approve or reject a manual review")
async def decide_review(
    review_id: str,
    request: ReviewDecisionRequest,
    supervisor: dict = Depends(require_supervisor),
):
    """Supervisor approves or rejects a pending attendance review."""
    db = get_database()

    review = await db.manual_reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.get("decision"):
        raise HTTPException(status_code=409, detail="This review has already been decided.")

    now = datetime.utcnow()

    # Update manual review
    await db.manual_reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {
            "decision": request.decision,
            "remarks": request.remarks,
            "reviewedBy": supervisor["name"],
            "timestamp": now,
        }},
    )

    # Update attendance record
    new_status = "present" if request.decision == "approved" else "absent"
    await db.attendance.update_one(
        {"_id": ObjectId(review["attendanceId"])},
        {"$set": {
            "reviewStatus": request.decision,
            "status": new_status,
        }},
    )

    action = "Attendance Approved" if request.decision == "approved" else "Attendance Rejected"
    await audit_service.log(
        action=action,
        performed_by=supervisor["name"],
        performed_by_id=str(supervisor["_id"]),
        description=f"{action} for worker {review['workerId']}. Remarks: {request.remarks or 'None'}",
        metadata={"reviewId": review_id, "workerId": review["workerId"]},
    )

    return {"message": f"Attendance {request.decision} successfully", "decision": request.decision}
