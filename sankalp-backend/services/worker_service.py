from database.connection import get_database
from utils.image_handler import save_profile_image, delete_image
from services.face_recognition_service import face_recognition_service
from services.audit_service import audit_service
from schemas.worker import WorkerCreateRequest, WorkerResponse, WorkerListResponse
from fastapi import HTTPException, status, UploadFile
from typing import Optional
from bson import ObjectId
from datetime import datetime, date
import math


def _serialize_worker(doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    doc.pop("faceEmbeddings", None)  # Never expose embeddings
    if "createdAt" in doc:
        doc["createdAt"] = doc["createdAt"].isoformat()
    if "updatedAt" in doc and doc["updatedAt"]:
        doc["updatedAt"] = doc["updatedAt"].isoformat()
    return doc


async def _compute_attendance_stats(db, worker_id: str) -> dict:
    """Compute attendance statistics for a worker in the current month."""
    today = date.today()
    month_start = today.replace(day=1).isoformat()
    month_end = today.isoformat()

    records = await db.attendance.find({
        "workerId": worker_id,
        "date": {"$gte": month_start, "$lte": month_end},
        "reviewStatus": {"$ne": "rejected"},
    }).to_list(length=None)

    present = sum(1 for r in records if r["status"] == "present")
    late = sum(1 for r in records if r["status"] == "late")
    absent = sum(1 for r in records if r["status"] == "absent")
    total_marked = present + late + absent

    working_days = 26  # Standard working days per month
    attendance_pct = ((present + late) / working_days * 100) if working_days > 0 else 0

    return {
        "presentDays": present,
        "lateDays": late,
        "absentDays": absent,
        "attendancePercentage": round(attendance_pct, 1),
    }


class WorkerService:
    """Worker CRUD and face enrollment business logic."""

    async def create_worker(
        self,
        data: WorkerCreateRequest,
        profile_image: Optional[UploadFile],
        created_by: dict,
    ) -> WorkerResponse:
        db = get_database()

        # Check duplicate worker ID
        existing = await db.workers.find_one({"workerId": data.workerId.upper()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Worker ID '{data.workerId}' already exists.",
            )

        # Save profile image if provided
        image_path = None
        if profile_image and profile_image.filename:
            image_path = await save_profile_image(profile_image)

        worker_doc = {
            "workerId": data.workerId.upper(),
            "fullName": data.fullName,
            "phone": data.phone,
            "village": data.village,
            "department": data.department,
            "dailyWage": data.dailyWage,
            "gender": data.gender,
            "age": data.age,
            "profileImage": image_path,
            "faceEmbeddings": None,
            "faceEnrolled": False,
            "createdAt": datetime.utcnow(),
        }

        result = await db.workers.insert_one(worker_doc)
        worker_doc["_id"] = result.inserted_id

        # Generate 30 days of mock past attendance for the new worker
        import random
        from datetime import timedelta, timezone
        
        ist = timezone(timedelta(hours=5, minutes=30))
        now_ist = datetime.now(ist)
        
        mock_attendance = []
        # Go back 30 days from yesterday
        for i in range(1, 31):
            past_date = now_ist - timedelta(days=i)
            # Skip Sundays (isoweekday() == 7)
            if past_date.isoweekday() == 7:
                continue
                
            status_choice = random.choices(["present", "late", "absent"], weights=[80, 15, 5])[0]
            
            time_str = "-"
            confidence = 0.0
            
            if status_choice == "late":
                time_str = f"09:{random.randint(10, 59):02d} AM"
                confidence = round(random.uniform(85.0, 99.9), 1)
            elif status_choice == "present":
                time_str = f"07:{random.randint(30, 59):02d} AM"
                confidence = round(random.uniform(85.0, 99.9), 1)
                
            mock_attendance.append({
                "workerId": data.workerId.upper(),
                "workerName": data.fullName,
                "date": past_date.strftime("%Y-%m-%d"),
                "time": time_str,
                "status": status_choice,
                "confidence": confidence,
                "reviewStatus": "verified",
                "source": "mock-seed",
                "createdAt": past_date.replace(hour=8, minute=0, second=0, microsecond=0)
            })
            
        if mock_attendance:
            await db.attendance.insert_many(mock_attendance)

        # Generate 3 mock past leave requests for the new worker
        mock_leaves = [
            {
                "workerId": data.workerId.upper(),
                "workerName": data.fullName,
                "leaveType": "Sick Leave",
                "startDate": (now_ist - timedelta(days=10)).isoformat(),
                "endDate": (now_ist - timedelta(days=8)).isoformat(),
                "reason": "Severe fever and body ache. Need rest.",
                "status": "approved",
                "decidedBy": "Admin",
                "decidedAt": (now_ist - timedelta(days=9)).isoformat(),
                "createdAt": (now_ist - timedelta(days=11)).isoformat(),
                "updatedAt": (now_ist - timedelta(days=9)).isoformat(),
            },
            {
                "workerId": data.workerId.upper(),
                "workerName": data.fullName,
                "leaveType": "Personal Leave",
                "startDate": (now_ist - timedelta(days=3)).isoformat(),
                "endDate": (now_ist - timedelta(days=3)).isoformat(),
                "reason": "Need to attend a family wedding in my hometown.",
                "status": "rejected",
                "decidedBy": "Admin",
                "decidedAt": (now_ist - timedelta(days=2)).isoformat(),
                "rejectReason": "Not enough notice given. Please apply 7 days in advance.",
                "createdAt": (now_ist - timedelta(days=4)).isoformat(),
                "updatedAt": (now_ist - timedelta(days=2)).isoformat(),
            },
            {
                "workerId": data.workerId.upper(),
                "workerName": data.fullName,
                "leaveType": "Emergency Leave",
                "startDate": (now_ist + timedelta(days=2)).isoformat(),
                "endDate": (now_ist + timedelta(days=4)).isoformat(),
                "reason": "Urgent house repairs required due to monsoon damage.",
                "status": "pending",
                "createdAt": (now_ist - timedelta(hours=5)).isoformat(),
                "updatedAt": (now_ist - timedelta(hours=5)).isoformat(),
            }
        ]
        await db.leaves.insert_many(mock_leaves)

        # Create audit log
        await audit_service.log(
            action="Worker Created",
            performed_by=created_by["name"],
            performed_by_id=str(created_by["_id"]),
            description=f"Registered worker {data.fullName} ({data.workerId})",
            metadata={"workerId": data.workerId},
        )

        serialized = _serialize_worker(worker_doc)
        return WorkerResponse(**serialized, attendancePercentage=0, presentDays=0,
                              lateDays=0, absentDays=0, expectedMonthlyWage=0)

    async def get_workers(
        self,
        search: Optional[str] = None,
        village: Optional[str] = None,
        department: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "createdAt",
        sort_order: str = "desc",
    ) -> WorkerListResponse:
        db = get_database()
        query: dict = {}

        if search:
            query["$or"] = [
                {"fullName": {"$regex": search, "$options": "i"}},
                {"workerId": {"$regex": search, "$options": "i"}},
                {"village": {"$regex": search, "$options": "i"}},
                {"department": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
            ]
        if village:
            query["village"] = village
        if department:
            query["department"] = department

        total = await db.workers.count_documents(query)
        sort_dir = -1 if sort_order == "desc" else 1
        skip = (page - 1) * page_size

        cursor = db.workers.find(query).sort(sort_by, sort_dir).skip(skip).limit(page_size)
        workers_raw = await cursor.to_list(length=page_size)

        workers = []
        for doc in workers_raw:
            stats = await _compute_attendance_stats(db, doc["workerId"])
            serialized = _serialize_worker(doc)
            expected_wage = doc["dailyWage"] * stats["presentDays"]
            workers.append(WorkerResponse(
                **serialized,
                **stats,
                expectedMonthlyWage=expected_wage,
            ))

        return WorkerListResponse(
            workers=workers,
            total=total,
            page=page,
            pageSize=page_size,
            totalPages=math.ceil(total / page_size),
        )

    async def get_worker(self, worker_id: str) -> WorkerResponse:
        db = get_database()
        doc = await db.workers.find_one({"workerId": worker_id.upper()})
        if not doc:
            raise HTTPException(status_code=404, detail=f"Worker '{worker_id}' not found.")

        stats = await _compute_attendance_stats(db, doc["workerId"])
        serialized = _serialize_worker(doc)
        expected_wage = doc["dailyWage"] * stats["presentDays"]
        return WorkerResponse(**serialized, **stats, expectedMonthlyWage=expected_wage)

    async def delete_worker(self, worker_id: str, deleted_by: dict) -> None:
        db = get_database()
        doc = await db.workers.find_one({"workerId": worker_id.upper()})
        if not doc:
            raise HTTPException(status_code=404, detail="Worker not found.")

        # Delete profile image
        if doc.get("profileImage"):
            delete_image(doc["profileImage"])

        await db.workers.delete_one({"workerId": worker_id.upper()})
        await db.attendance.delete_many({"workerId": worker_id.upper()})

        await audit_service.log(
            action="Worker Deleted",
            performed_by=deleted_by["name"],
            performed_by_id=str(deleted_by["_id"]),
            description=f"Deleted worker {doc['fullName']} ({worker_id})",
        )

    async def enroll_face(
        self, worker_id: str, image_bytes_list: list[bytes], enrolled_by: dict
    ) -> dict:
        db = get_database()
        doc = await db.workers.find_one({"workerId": worker_id.upper()})
        if not doc:
            raise HTTPException(status_code=404, detail="Worker not found.")

        embeddings = []
        for image_bytes in image_bytes_list:
            embedding = face_recognition_service.generate_embedding(image_bytes)
            if embedding is None:
                raise HTTPException(
                    status_code=400,
                    detail="Could not detect a clear face in one of the images. Please retake the photo.",
                )
            embeddings.append(embedding)

        await db.workers.update_one(
            {"workerId": worker_id.upper()},
            {"$set": {"faceEmbeddings": embeddings, "faceEnrolled": True, "updatedAt": datetime.utcnow()}},
        )

        await audit_service.log(
            action="Face Enrolled",
            performed_by=enrolled_by["name"],
            performed_by_id=str(enrolled_by["_id"]),
            description=f"Enrolled face for worker {doc['fullName']} ({worker_id})",
        )

        return {"success": True, "message": "Face enrolled successfully"}


worker_service = WorkerService()
