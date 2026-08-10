from fastapi import APIRouter, Depends, Query
from services.analytics_service import analytics_service
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", summary="Get full analytics data")
async def get_analytics(
    period: str = Query("today", regex="^(today|week|month)$"),
    _: dict = Depends(get_current_user),
):
    """Returns summary, trends, department/village stats, and smart insights."""
    days = 7 if period == "week" else 30 if period == "month" else 1

    summary = await analytics_service.get_summary()
    daily_trend = await analytics_service.get_daily_trend(days=days)
    dept_stats = await analytics_service.get_department_stats()
    village_stats = await analytics_service.get_village_stats()
    insights = await analytics_service.generate_insights()

    return {
        "summary": summary,
        "dailyTrend": daily_trend,
        "weeklyTrend": daily_trend[-7:] if len(daily_trend) >= 7 else daily_trend,
        "monthlyTrend": daily_trend,
        "departmentStats": dept_stats,
        "villageStats": village_stats,
        "insights": insights,
        "topWorkers": [],
        "lowAttendanceWorkers": await _get_low_attendance_workers(),
    }


async def _get_low_attendance_workers() -> list:
    from database.connection import get_database
    from datetime import date
    db = get_database()
    month_start = date.today().replace(day=1).isoformat()
    today = date.today().isoformat()
    working_days = max(1, (date.today() - date.today().replace(day=1)).days + 1)

    low_workers = []
    async for worker in db.workers.find({}):
        count = await db.attendance.count_documents({
            "workerId": worker["workerId"],
            "date": {"$gte": month_start, "$lte": today},
            "status": {"$in": ["present", "late"]},
        })
        pct = (count / working_days * 100) if working_days > 0 else 0
        if pct < 80:
            low_workers.append({
                "workerId": worker["workerId"],
                "fullName": worker["fullName"],
                "attendancePercentage": round(pct, 1),
                "department": worker.get("department", ""),
                "village": worker.get("village", ""),
            })

    return sorted(low_workers, key=lambda x: x["attendancePercentage"])[:10]


@router.get("/daily-trend", summary="Get daily attendance trend")
async def get_daily_trend(days: int = Query(30, ge=1, le=90), _: dict = Depends(get_current_user)):
    return await analytics_service.get_daily_trend(days=days)


@router.get("/department-stats", summary="Get department attendance breakdown")
async def get_department_stats(_: dict = Depends(get_current_user)):
    return await analytics_service.get_department_stats()


@router.get("/village-stats", summary="Get village attendance breakdown")
async def get_village_stats(_: dict = Depends(get_current_user)):
    return await analytics_service.get_village_stats()


@router.get("/insights", summary="Get rule-based smart insights")
async def get_insights(_: dict = Depends(get_current_user)):
    return await analytics_service.generate_insights()


@router.get("/pending-reviews-count", summary="Supervisor: combined count of pending leaves + documents")
async def get_pending_reviews_count(_: dict = Depends(get_current_user)):
    """Returns combined pending count for supervisor dashboard stat card."""
    from database.connection import get_database
    db = get_database()
    pending_leaves    = await db.leaves.count_documents({"status": "pending"})
    pending_docs      = await db.documents.count_documents({"status": "pending"})
    pending_reviews   = await db.manual_reviews.count_documents({"decision": None})
    return {
        "pendingLeaves":    pending_leaves,
        "pendingDocuments": pending_docs,
        "pendingReviews":   pending_reviews,
        "total":            pending_leaves + pending_docs + pending_reviews,
    }
