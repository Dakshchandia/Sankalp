from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from typing import Optional
from services.attendance_service import attendance_service, _serialize_attendance
from middleware.auth_middleware import require_supervisor, get_current_user
from database.connection import get_database

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/verify-self", summary="Worker: verify own face identity")
async def worker_verify_self(
    face_image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Worker-only face verification endpoint.
    Compares the captured image against the worker's enrolled face embeddings.
    Returns match result without creating an attendance record.
    """
    from services.face_recognition_service import face_recognition_service
    from config.settings import settings

    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")

    image_bytes = await face_image.read()
    db = get_database()

    # Generate embedding from uploaded image
    embedding = face_recognition_service.generate_embedding(image_bytes)
    if embedding is None:
        from schemas.attendance import FaceRecognitionResponse
        return FaceRecognitionResponse(success=False, message="No face detected in the image.")

    # Load this specific worker's face embeddings
    worker = await db.workers.find_one({"workerId": worker_id.upper()})
    if not worker or not worker.get("faceEmbeddings"):
        from schemas.attendance import FaceRecognitionResponse
        return FaceRecognitionResponse(
            success=False,
            message="Your face is not enrolled yet. Please contact your supervisor."
        )

    stored_embeddings = worker["faceEmbeddings"]
    tolerance = 1.0 - (settings.CONFIDENCE_THRESHOLD / 100.0)
    is_match, confidence = face_recognition_service.compare_face(
        embedding, stored_embeddings, tolerance=tolerance
    )

    from schemas.attendance import FaceRecognitionResponse
    if is_match:
        from datetime import datetime, timezone, timedelta
        # India is UTC+5:30
        ist = timezone(timedelta(hours=5, minutes=30))
        now = datetime.now(ist)
        date_str = now.strftime("%Y-%m-%d")
        
        # Check if already marked today
        existing = await db.attendance.find_one({"workerId": worker_id, "date": date_str})
        if not existing:
            await db.attendance.insert_one({
                "workerId": worker_id,
                "workerName": worker.get("fullName", ""),
                "date": date_str,
                "time": now.strftime("%I:%M %p"),
                "status": "present",
                "confidence": round(confidence, 2),
                "reviewStatus": "verified",
                "source": "worker-self",
                "createdAt": now
            })

        return FaceRecognitionResponse(
            success=True,
            workerId=worker_id,
            workerName=worker.get("fullName", ""),
            workerImage=worker.get("profileImage"),
            confidence=round(confidence, 2),
            message="Identity verified and attendance marked successfully.",
        )
    elif confidence >= 40.0:
        return FaceRecognitionResponse(
            success=False,
            requiresReview=True,
            workerName=worker.get("fullName", ""),
            confidence=round(confidence, 2),
            message=f"Low confidence ({confidence:.1f}%). Please try again in better lighting.",
        )
    else:
        return FaceRecognitionResponse(
            success=False,
            confidence=round(confidence, 2),
            message=f"Face does not match enrolled profile ({confidence:.1f}%). Verification failed.",
        )


@router.post("/mark", summary="Mark attendance using face recognition")
async def mark_attendance(
    face_image: UploadFile = File(..., description="Captured face image"),
    session_id: str = Form(...),
    supervisor: dict = Depends(require_supervisor),
):
    """
    Core face recognition endpoint.
    Processes captured image and marks attendance or sends to manual review.
    """
    image_bytes = await face_image.read()
    return await attendance_service.mark_attendance(image_bytes, supervisor)


@router.post("/sessions/start", summary="Start attendance session")
async def start_session(supervisor: dict = Depends(require_supervisor)):
    return await attendance_service.start_session(str(supervisor["_id"]))


@router.post("/sessions/{session_id}/end", summary="End attendance session")
async def end_session(session_id: str, supervisor: dict = Depends(require_supervisor)):
    await attendance_service.end_session(str(supervisor["_id"]))
    return {"message": "Session ended"}


@router.get("/sessions/active", summary="Get active session for supervisor")
async def get_active_session(supervisor: dict = Depends(require_supervisor)):
    return await attendance_service.get_active_session(str(supervisor["_id"]))


@router.get("/today", summary="Get today's attendance feed")
async def get_today_feed(_: dict = Depends(get_current_user)):
    return await attendance_service.get_today_feed()


@router.get("/me/summary", summary="Worker: get own attendance summary")
async def get_my_summary(current_user: dict = Depends(get_current_user)):
    """Worker-scoped: returns summary stats for the authenticated worker only."""
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")
    db = get_database()
    from datetime import date as dt
    month_start = dt.today().replace(day=1).isoformat()
    today = dt.today().isoformat()

    all_records = await db.attendance.find({"workerId": worker_id}).to_list(500)
    month_records = [r for r in all_records if r.get("date", "") >= month_start]

    present  = sum(1 for r in all_records if r["status"] in ("present", "late"))
    absent   = sum(1 for r in all_records if r["status"] == "absent")
    total    = present + absent
    pct      = round((present / total * 100), 1) if total > 0 else 0

    month_present = sum(1 for r in month_records if r["status"] in ("present", "late"))
    month_absent  = sum(1 for r in month_records if r["status"] == "absent")

    # Worker profile for wage calc
    worker = await db.workers.find_one({"workerId": worker_id})
    daily_wage = worker.get("dailyWage", 0) if worker else 0
    expected_wage = daily_wage * month_present

    return {
        "workerId": worker_id,
        "totalPresent": present,
        "totalAbsent": absent,
        "attendancePercentage": pct,
        "monthPresent": month_present,
        "monthAbsent": month_absent,
        "expectedWage": round(expected_wage, 2),
        "dailyWage": daily_wage,
    }


@router.get("/me/history", summary="Worker: get own attendance history for graph")
async def get_my_history(
    range: str = Query("30d", regex="^(7d|30d)$"),
    current_user: dict = Depends(get_current_user),
):
    """Worker-scoped: returns daily attendance records for graph."""
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")
    from datetime import date as dt, timedelta
    days = 7 if range == "7d" else 30
    date_from = (dt.today() - timedelta(days=days)).isoformat()
    db = get_database()
    records = await db.attendance.find({
        "workerId": worker_id,
        "date": {"$gte": date_from}
    }).sort("date", 1).to_list(200)
    return [_serialize_attendance(r) for r in records]


@router.get("/me", summary="Worker: get own attendance history")
async def get_my_attendance(
    status: Optional[str] = Query(None),
    dateFrom: Optional[str] = Query(None),
    dateTo: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Worker-scoped: returns only the authenticated worker's attendance."""
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")
    filters = {"status": status, "dateFrom": dateFrom, "dateTo": dateTo}
    return await attendance_service.get_worker_attendance(worker_id, filters)


@router.get("/worker/{worker_id}", summary="Get attendance history for a worker")
async def get_worker_attendance(
    worker_id: str,
    status: Optional[str] = Query(None),
    dateFrom: Optional[str] = Query(None),
    dateTo: Optional[str] = Query(None),
    _: dict = Depends(get_current_user),
):
    filters = {"status": status, "dateFrom": dateFrom, "dateTo": dateTo}
    return await attendance_service.get_worker_attendance(worker_id, filters)


@router.get("", summary="Get all attendance records with filters")
async def get_attendance(
    date: Optional[str] = Query(None),
    dateFrom: Optional[str] = Query(None),
    dateTo: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    workerId: Optional[str] = Query(None),
    _: dict = Depends(get_current_user),
):
    from database.connection import get_database
    db = get_database()
    query: dict = {}
    if date:
        query["date"] = date
    if dateFrom:
        query.setdefault("date", {})["$gte"] = dateFrom
    if dateTo:
        query.setdefault("date", {})["$lte"] = dateTo
    if status:
        query["status"] = status
    if workerId:
        query["workerId"] = workerId.upper()

    records = await db.attendance.find(query).sort("createdAt", -1).limit(200).to_list(length=200)
    for r in records:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        if "createdAt" in r:
            r["createdAt"] = r["createdAt"].isoformat()
    return records
