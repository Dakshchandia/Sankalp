"""
Analytics Service — rule-based insights and chart data generation.
No AI/ML — pure aggregation and rule logic.
"""
from database.connection import get_database
from datetime import date, datetime, timedelta
from typing import List
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:

    async def get_summary(self) -> dict:
        """Get today's attendance summary for dashboard cards."""
        db = get_database()
        today = date.today().isoformat()

        total_workers = await db.workers.count_documents({})
        today_records = await db.attendance.find(
            {"date": today, "reviewStatus": {"$ne": "rejected"}}
        ).to_list(length=None)

        present = sum(1 for r in today_records if r["status"] == "present")
        late = sum(1 for r in today_records if r["status"] == "late")
        absent = sum(1 for r in today_records if r["status"] == "absent")
        pending = sum(1 for r in today_records if r["status"] == "pending_review")

        # Workers not yet marked (absent)
        marked_today = len(today_records)
        actual_absent = max(0, total_workers - marked_today)

        attendance_pct = ((present + late) / total_workers * 100) if total_workers > 0 else 0

        # Today's payroll estimate
        worker_wages = {w["workerId"]: w["dailyWage"]
                        async for w in db.workers.find({}, {"workerId": 1, "dailyWage": 1})}
        today_payroll = sum(
            worker_wages.get(r["workerId"], 0)
            for r in today_records
            if r["status"] in ("present", "late")
        )

        # Average arrival time
        times = [r["time"] for r in today_records if r["time"]]
        avg_arrival = self._average_time(times)

        # Monthly payroll
        month_start = date.today().replace(day=1).isoformat()
        month_records = await db.attendance.find({
            "date": {"$gte": month_start},
            "status": {"$in": ["present", "late"]},
            "reviewStatus": {"$ne": "rejected"},
        }).to_list(length=None)
        month_payroll = sum(worker_wages.get(r["workerId"], 0) for r in month_records)

        pending_reviews = await db.manual_reviews.count_documents({"decision": None})

        return {
            "totalWorkers": total_workers,
            "presentToday": present,
            "absentToday": actual_absent,
            "lateToday": late,
            "attendancePercentage": round(attendance_pct, 1),
            "expectedPayrollToday": round(today_payroll, 2),
            "expectedPayrollMonth": round(month_payroll, 2),
            "avgArrivalTime": avg_arrival,
            "pendingReviews": pending_reviews,
        }

    async def get_daily_trend(self, days: int = 30) -> list:
        """Return daily attendance counts for the last N days."""
        db = get_database()
        result = []

        for i in range(days - 1, -1, -1):
            day = (date.today() - timedelta(days=i)).isoformat()
            records = await db.attendance.find(
                {"date": day, "reviewStatus": {"$ne": "rejected"}}
            ).to_list(length=None)

            present = sum(1 for r in records if r["status"] == "present")
            late = sum(1 for r in records if r["status"] == "late")
            absent = sum(1 for r in records if r["status"] == "absent")
            total = present + late + absent
            pct = ((present + late) / total * 100) if total > 0 else 0

            result.append({
                "date": day,
                "present": present,
                "late": late,
                "absent": absent,
                "total": total,
                "percentage": round(pct, 1),
            })

        return result

    async def get_department_stats(self) -> list:
        """Return attendance breakdown by department."""
        db = get_database()
        today = date.today().isoformat()

        pipeline = [
            {"$match": {"date": today, "reviewStatus": {"$ne": "rejected"}}},
            {"$lookup": {
                "from": "workers",
                "localField": "workerId",
                "foreignField": "workerId",
                "as": "worker",
            }},
            {"$unwind": {"path": "$worker", "preserveNullAndEmptyArrays": True}},
            {"$group": {
                "_id": "$worker.department",
                "present": {"$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}},
                "late": {"$sum": {"$cond": [{"$eq": ["$status", "late"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$status", "absent"]}, 1, 0]}},
                "total": {"$sum": 1},
            }},
        ]

        docs = await db.attendance.aggregate(pipeline).to_list(length=None)
        result = []
        for doc in docs:
            pct = ((doc["present"] + doc["late"]) / doc["total"] * 100) if doc["total"] > 0 else 0
            result.append({
                "department": doc["_id"] or "Unknown",
                "present": doc["present"],
                "late": doc["late"],
                "absent": doc["absent"],
                "total": doc["total"],
                "percentage": round(pct, 1),
            })
        return sorted(result, key=lambda x: x["percentage"], reverse=True)

    async def get_village_stats(self) -> list:
        """Return attendance breakdown by village."""
        db = get_database()
        today = date.today().isoformat()

        pipeline = [
            {"$match": {"date": today, "reviewStatus": {"$ne": "rejected"}}},
            {"$lookup": {
                "from": "workers",
                "localField": "workerId",
                "foreignField": "workerId",
                "as": "worker",
            }},
            {"$unwind": {"path": "$worker", "preserveNullAndEmptyArrays": True}},
            {"$group": {
                "_id": "$worker.village",
                "present": {"$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$status", "absent"]}, 1, 0]}},
                "total": {"$sum": 1},
            }},
        ]

        docs = await db.attendance.aggregate(pipeline).to_list(length=None)
        result = []
        for doc in docs:
            pct = (doc["present"] / doc["total"] * 100) if doc["total"] > 0 else 0
            result.append({
                "village": doc["_id"] or "Unknown",
                "present": doc["present"],
                "absent": doc["absent"],
                "total": doc["total"],
                "percentage": round(pct, 1),
            })
        return sorted(result, key=lambda x: x["percentage"], reverse=True)

    async def generate_insights(self) -> list:
        """Generate rule-based textual insights."""
        db = get_database()
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        insights = []

        # Today's attendance count
        today_records = await db.attendance.find(
            {"date": today, "reviewStatus": {"$ne": "rejected"}}
        ).to_list(length=None)
        yesterday_records = await db.attendance.find(
            {"date": yesterday, "reviewStatus": {"$ne": "rejected"}}
        ).to_list(length=None)

        today_pct = len([r for r in today_records if r["status"] in ("present", "late")])
        yesterday_pct = len([r for r in yesterday_records if r["status"] in ("present", "late")])

        if today_pct > yesterday_pct:
            diff = today_pct - yesterday_pct
            insights.append({
                "type": "success",
                "title": "Attendance Improved",
                "description": f"Attendance increased by {diff} workers compared to yesterday.",
            })
        elif today_pct < yesterday_pct:
            diff = yesterday_pct - today_pct
            insights.append({
                "type": "warning",
                "title": "Attendance Dropped",
                "description": f"Attendance dropped by {diff} workers compared to yesterday.",
            })

        # Department with highest attendance
        dept_stats = await self.get_department_stats()
        if dept_stats:
            top_dept = dept_stats[0]
            insights.append({
                "type": "info",
                "title": "Top Department",
                "description": f"{top_dept['department']} has the highest attendance at {top_dept['percentage']}%.",
            })

        # Workers below 80% attendance
        month_start = date.today().replace(day=1).isoformat()
        low_attendance_count = 0
        async for worker in db.workers.find({}):
            records = await db.attendance.count_documents({
                "workerId": worker["workerId"],
                "date": {"$gte": month_start},
                "status": {"$in": ["present", "late"]},
            })
            total_days = (date.today() - date.today().replace(day=1)).days + 1
            if total_days > 0 and (records / total_days * 100) < 80:
                low_attendance_count += 1

        if low_attendance_count > 0:
            insights.append({
                "type": "warning",
                "title": "Low Attendance Alert",
                "description": f"{low_attendance_count} worker(s) have attendance below 80% this month.",
            })

        # Pending reviews
        pending = await db.manual_reviews.count_documents({"decision": None})
        if pending > 0:
            insights.append({
                "type": "danger" if pending > 5 else "warning",
                "title": "Pending Reviews",
                "description": f"{pending} attendance record(s) are awaiting supervisor review.",
            })

        return insights

    def _average_time(self, times: List[str]) -> str:
        """Compute average of HH:MM:SS time strings."""
        if not times:
            return "N/A"
        try:
            total_seconds = 0
            for t in times:
                parts = t.split(":")
                total_seconds += int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2] if len(parts) > 2 else 0)
            avg = total_seconds // len(times)
            h, rem = divmod(avg, 3600)
            m, _ = divmod(rem, 60)
            return f"{h:02d}:{m:02d} {'AM' if h < 12 else 'PM'}"
        except Exception:
            return "N/A"


analytics_service = AnalyticsService()
