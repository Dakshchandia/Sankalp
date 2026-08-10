"""
Attendance Repository — raw database access layer for attendance records.
"""
from database.connection import get_database
from typing import Optional
from datetime import date


class AttendanceRepository:

    async def find_today(self) -> list:
        db = get_database()
        today = date.today().isoformat()
        return await db.attendance.find({"date": today}).sort("createdAt", -1).to_list(length=500)

    async def find_by_worker(self, worker_id: str, limit: int = 100) -> list:
        db = get_database()
        return await db.attendance.find(
            {"workerId": worker_id.upper()}
        ).sort("date", -1).limit(limit).to_list(length=limit)

    async def find_duplicate(self, worker_id: str, date_str: str) -> Optional[dict]:
        db = get_database()
        return await db.attendance.find_one({
            "workerId": worker_id.upper(),
            "date": date_str,
            "reviewStatus": {"$ne": "rejected"},
        })

    async def insert(self, doc: dict) -> str:
        db = get_database()
        result = await db.attendance.insert_one(doc)
        return str(result.inserted_id)

    async def count_by_status(self, date_str: str) -> dict:
        db = get_database()
        pipeline = [
            {"$match": {"date": date_str, "reviewStatus": {"$ne": "rejected"}}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
        result = await db.attendance.aggregate(pipeline).to_list(length=None)
        return {item["_id"]: item["count"] for item in result}


attendance_repository = AttendanceRepository()
