"""
Attendance Service — core business logic for face recognition attendance marking.
"""
from database.connection import get_database
from services.face_recognition_service import face_recognition_service
from services.audit_service import audit_service
from utils.image_handler import save_attendance_snapshot
from config.settings import settings
from schemas.attendance import FaceRecognitionResponse, AttendanceResponse
from fastapi import HTTPException
from datetime import datetime, date
from bson import ObjectId
import uuid
import logging

logger = logging.getLogger(__name__)

# In-memory session store (use Redis in production)
_active_sessions: dict[str, dict] = {}


class AttendanceService:

    async def start_session(self, supervisor_id: str) -> dict:
        """Start a new attendance session for a supervisor."""
        session_id = str(uuid.uuid4())
        _active_sessions[supervisor_id] = {
            "sessionId": session_id,
            "startedAt": datetime.utcnow().isoformat(),
            "supervisorId": supervisor_id,
        }
        return {"sessionId": session_id, "startedAt": _active_sessions[supervisor_id]["startedAt"]}

    async def end_session(self, supervisor_id: str) -> None:
        """End the current attendance session."""
        _active_sessions.pop(supervisor_id, None)

    async def get_active_session(self, supervisor_id: str) -> dict:
        session = _active_sessions.get(supervisor_id)
        if session:
            return {"sessionId": session["sessionId"], "isActive": True}
        return {"sessionId": None, "isActive": False}

    async def mark_attendance(
        self, image_bytes: bytes, supervisor: dict
    ) -> FaceRecognitionResponse:
        """
        Core face recognition pipeline:
        1. Generate embedding from captured image
        2. Compare against all enrolled workers
        3. Mark attendance or send to manual review
        """
        db = get_database()

        # Step 1: Generate face embedding
        embedding = face_recognition_service.generate_embedding(image_bytes)

        if embedding is None:
            # Check if it's a no-face or multi-face issue
            detection = face_recognition_service.detect_face_in_bytes(image_bytes)
            return FaceRecognitionResponse(
                success=False,
                message=detection.get("error", "No face detected in the frame"),
            )

        # Step 2: Load all enrolled workers
        workers = await db.workers.find(
            {"faceEnrolled": True, "faceEmbeddings": {"$ne": None}}
        ).to_list(length=None)

        if not workers:
            return FaceRecognitionResponse(
                success=False,
                message="No workers enrolled for face recognition yet.",
            )

        # Step 3: Find best match
        best_match = None
        best_confidence = 0.0
        tolerance = 1.0 - (settings.CONFIDENCE_THRESHOLD / 100.0)

        for worker in workers:
            stored_embeddings = worker.get("faceEmbeddings", [])
            if not stored_embeddings:
                continue
            is_match, confidence = face_recognition_service.compare_face(
                embedding, stored_embeddings, tolerance=tolerance
            )
            if confidence > best_confidence:
                best_confidence = confidence
                if is_match:
                    best_match = worker

        today_str = date.today().isoformat()
        current_time = datetime.now().strftime("%H:%M:%S")

        # Step 4: Handle unrecognized face
        if best_match is None:
            return FaceRecognitionResponse(
                success=False,
                confidence=round(best_confidence, 2),
                message=f"Face not recognized. Confidence: {best_confidence:.1f}%",
            )

        worker_id = best_match["workerId"]

        # Step 5: Check for duplicate attendance today
        existing = await db.attendance.find_one({
            "workerId": worker_id,
            "date": today_str,
            "reviewStatus": {"$ne": "rejected"},
        })
        if existing:
            return FaceRecognitionResponse(
                success=False,
                workerName=best_match["fullName"],
                confidence=round(best_confidence, 2),
                message=f"{best_match['fullName']} attendance already marked today.",
            )

        # Step 6: Determine status based on time
        now_time = datetime.now().time()
        late_time = datetime.strptime(settings.LATE_AFTER_TIME, "%H:%M").time()
        att_status = "late" if now_time > late_time else "present"

        # Step 7: Save attendance snapshot
        snapshot_path = None
        try:
            snapshot_path = await save_attendance_snapshot(image_bytes)
        except Exception:
            pass  # Continue even if snapshot saving fails

        # Step 8: Determine review status
        requires_review = best_confidence < settings.CONFIDENCE_THRESHOLD
        review_status = "pending" if requires_review else "auto_approved"
        if requires_review:
            att_status = "pending_review"

        # Step 9: Create attendance record
        attendance_doc = {
            "workerId": worker_id,
            "workerName": best_match["fullName"],
            "date": today_str,
            "time": current_time,
            "status": att_status,
            "confidence": round(best_confidence, 2),
            "capturedImage": snapshot_path,
            "reviewStatus": review_status,
            "supervisorId": str(supervisor.get("_id", "")),
            "createdAt": datetime.utcnow(),
        }

        result = await db.attendance.insert_one(attendance_doc)
        attendance_id = str(result.inserted_id)

        # Step 10: Create manual review entry if needed
        if requires_review:
            await db.manual_reviews.insert_one({
                "attendanceId": attendance_id,
                "workerId": worker_id,
                "decision": None,
                "remarks": None,
                "createdAt": datetime.utcnow(),
            })

        # Step 11: Audit log
        await audit_service.log(
            action="Attendance Marked",
            performed_by=supervisor.get("name", "System"),
            performed_by_id=str(supervisor.get("_id", "")),
            description=f"Attendance {'auto-approved' if not requires_review else 'sent for review'} for {best_match['fullName']} ({worker_id}). Confidence: {best_confidence:.1f}%",
            metadata={"workerId": worker_id, "confidence": best_confidence},
        )

        return FaceRecognitionResponse(
            success=True,
            workerId=worker_id,
            workerName=best_match["fullName"],
            workerImage=best_match.get("profileImage"),
            confidence=round(best_confidence, 2),
            status=att_status,
            requiresReview=requires_review,
            attendanceId=attendance_id,
            message="Attendance marked successfully" if not requires_review else "Sent to manual review",
        )

    async def get_today_feed(self) -> list:
        """Return all attendance records for today, newest first."""
        db = get_database()
        today_str = date.today().isoformat()
        records = await db.attendance.find(
            {"date": today_str}
        ).sort("createdAt", -1).to_list(length=100)
        return [_serialize_attendance(r) for r in records]

    async def get_worker_attendance(self, worker_id: str, filters: dict = {}) -> list:
        """Get attendance history for a specific worker."""
        db = get_database()
        query: dict = {"workerId": worker_id.upper()}
        if filters.get("status"):
            query["status"] = filters["status"]
        if filters.get("dateFrom"):
            query.setdefault("date", {})["$gte"] = filters["dateFrom"]
        if filters.get("dateTo"):
            query.setdefault("date", {})["$lte"] = filters["dateTo"]

        records = await db.attendance.find(query).sort("date", -1).to_list(length=200)
        return [_serialize_attendance(r) for r in records]


def _serialize_attendance(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    if "createdAt" in doc:
        doc["createdAt"] = doc["createdAt"].isoformat()
    return doc


attendance_service = AttendanceService()
