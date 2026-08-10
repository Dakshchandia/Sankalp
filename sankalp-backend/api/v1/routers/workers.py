from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from typing import Optional
from services.worker_service import worker_service
from middleware.auth_middleware import require_supervisor, get_current_user
from schemas.worker import WorkerCreateRequest, WorkerResponse, WorkerListResponse
from schemas.common import MessageResponse

router = APIRouter(prefix="/workers", tags=["Workers"])


@router.get("/me", summary="Worker: get own profile linked via workerId")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Worker-scoped — returns the authenticated worker's own profile."""
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")
    return await worker_service.get_worker(worker_id)


@router.get("", response_model=WorkerListResponse, summary="List all workers with filters")
async def list_workers(
    search: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    sortBy: str = Query("createdAt"),
    sortOrder: str = Query("desc"),
    _: dict = Depends(get_current_user),
):
    return await worker_service.get_workers(
        search=search, village=village, department=department,
        page=page, page_size=pageSize, sort_by=sortBy, sort_order=sortOrder,
    )


@router.get("/check-id/{worker_id}", summary="Check if worker ID is available")
async def check_worker_id(worker_id: str, _: dict = Depends(require_supervisor)):
    from database.connection import get_database
    db = get_database()
    existing = await db.workers.find_one({"workerId": worker_id.upper()})
    return {"available": existing is None}


@router.get("/{worker_id}", response_model=WorkerResponse, summary="Get worker by ID")
async def get_worker(worker_id: str, _: dict = Depends(get_current_user)):
    return await worker_service.get_worker(worker_id)


@router.post("", response_model=WorkerResponse, status_code=201, summary="Register a new worker")
async def create_worker(
    fullName: str = Form(...),
    workerId: str = Form(...),
    phone: str = Form(...),
    village: str = Form(...),
    department: str = Form(...),
    dailyWage: float = Form(...),
    gender: str = Form(...),
    age: int = Form(...),
    profileImage: Optional[UploadFile] = File(None),
    supervisor: dict = Depends(require_supervisor),
):
    data = WorkerCreateRequest(
        fullName=fullName, workerId=workerId, phone=phone,
        village=village, department=department, dailyWage=dailyWage,
        gender=gender, age=age,
    )
    return await worker_service.create_worker(data, profileImage, supervisor)


@router.put("/{worker_id}", response_model=WorkerResponse, summary="Update worker details")
async def update_worker(
    worker_id: str,
    fullName: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    village: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    dailyWage: Optional[float] = Form(None),
    gender: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    profileImage: Optional[UploadFile] = File(None),
    supervisor: dict = Depends(require_supervisor),
):
    from database.connection import get_database
    from utils.image_handler import save_profile_image
    from datetime import datetime

    db = get_database()
    doc = await db.workers.find_one({"workerId": worker_id.upper()})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Worker not found")

    updates: dict = {"updatedAt": datetime.utcnow()}
    if fullName: updates["fullName"] = fullName
    if phone: updates["phone"] = phone
    if village: updates["village"] = village
    if department: updates["department"] = department
    if dailyWage: updates["dailyWage"] = dailyWage
    if gender: updates["gender"] = gender
    if age: updates["age"] = age
    if profileImage and profileImage.filename:
        updates["profileImage"] = await save_profile_image(profileImage)

    await db.workers.update_one({"workerId": worker_id.upper()}, {"$set": updates})

    from services.audit_service import audit_service
    await audit_service.log(
        action="Worker Updated",
        performed_by=supervisor["name"],
        performed_by_id=str(supervisor["_id"]),
        description=f"Updated worker {worker_id}",
    )
    return await worker_service.get_worker(worker_id)


@router.delete("/{worker_id}", response_model=MessageResponse, summary="Delete a worker")
async def delete_worker(worker_id: str, supervisor: dict = Depends(require_supervisor)):
    await worker_service.delete_worker(worker_id, supervisor)
    return MessageResponse(message=f"Worker {worker_id} deleted successfully")


@router.post("/{worker_id}/enroll-face", summary="Enroll worker face images")
async def enroll_face(
    worker_id: str,
    face_image_0: UploadFile = File(...),
    face_image_1: Optional[UploadFile] = File(None),
    supervisor: dict = Depends(require_supervisor),
):
    images = [await face_image_0.read()]
    if face_image_1 and face_image_1.filename:
        images.append(await face_image_1.read())
    return await worker_service.enroll_face(worker_id, images, supervisor)


@router.get("/{worker_id}/attendance-summary", summary="Get attendance summary for a worker")
async def get_attendance_summary(worker_id: str, _: dict = Depends(get_current_user)):
    return await worker_service.get_worker(worker_id)
