from database.connection import get_database
from utils.csv_exporter import generate_attendance_csv, generate_worker_csv
from services.audit_service import audit_service
from datetime import date
from typing import Optional


class ReportService:

    async def generate_report(self, report_type: str, filters: dict, generated_by: dict) -> dict:
        """Generate a report and return metadata."""
        db = get_database()

        await audit_service.log(
            action="Report Generated",
            performed_by=generated_by.get("name", "Unknown"),
            performed_by_id=str(generated_by.get("_id", "")),
            description=f"Generated {report_type} report",
        )

        return {
            "reportType": report_type,
            "generatedAt": date.today().isoformat(),
            "filters": filters,
            "message": "Report generated successfully",
        }

    async def export_csv(self, report_type: str, filters: dict) -> bytes:
        """Generate and return CSV bytes for download."""
        db = get_database()
        query: dict = {}

        if filters.get("dateFrom"):
            query.setdefault("date", {})["$gte"] = filters["dateFrom"]
        if filters.get("dateTo"):
            query.setdefault("date", {})["$lte"] = filters["dateTo"]
        if filters.get("department"):
            query["department"] = filters["department"]

        if report_type == "worker":
            # Worker CSV
            workers = await db.workers.find({}).to_list(length=None)
            worker_list = []
            for w in workers:
                month_start = date.today().replace(day=1).isoformat()
                present_count = await db.attendance.count_documents({
                    "workerId": w["workerId"],
                    "date": {"$gte": month_start},
                    "status": {"$in": ["present", "late"]},
                })
                working_days = 26
                att_pct = (present_count / working_days * 100) if working_days > 0 else 0
                worker_list.append({
                    **w,
                    "presentDays": present_count,
                    "attendancePercentage": att_pct,
                    "expectedMonthlyWage": w["dailyWage"] * present_count,
                    "createdAt": w["createdAt"].isoformat() if "createdAt" in w else "",
                })
            return generate_worker_csv(worker_list)
        else:
            # Attendance CSV
            if report_type == "today":
                query["date"] = date.today().isoformat()
            elif report_type == "weekly":
                from datetime import timedelta
                query.setdefault("date", {})["$gte"] = (date.today() - timedelta(days=7)).isoformat()

            pipeline = [
                {"$match": query},
                {"$lookup": {
                    "from": "workers",
                    "localField": "workerId",
                    "foreignField": "workerId",
                    "as": "workerData",
                }},
                {"$unwind": {"path": "$workerData", "preserveNullAndEmptyArrays": True}},
                {"$sort": {"date": -1}},
            ]

            records_raw = await db.attendance.aggregate(pipeline).to_list(length=None)
            records = []
            for r in records_raw:
                worker_data = r.get("workerData", {})
                records.append({
                    "workerName": r.get("workerName", ""),
                    "workerId": r.get("workerId", ""),
                    "village": worker_data.get("village", ""),
                    "department": worker_data.get("department", ""),
                    "date": r.get("date", ""),
                    "time": r.get("time", ""),
                    "status": r.get("status", ""),
                    "confidence": r.get("confidence", 0),
                    "reviewStatus": r.get("reviewStatus", ""),
                    "supervisorName": "",
                })
            return generate_attendance_csv(records)


report_service = ReportService()
