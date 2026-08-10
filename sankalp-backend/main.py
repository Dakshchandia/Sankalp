"""
SANKALP - Rural Workforce Management Platform
FastAPI Backend Entry Point
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from config.settings import settings
from database.connection import connect_to_mongo, close_mongo_connection

# Import all routers
from api.v1.routers import auth, workers, attendance, analytics, reports, manual_review, audit, settings as settings_router, leaves, documents

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle manager."""
    # Startup
    logger.info("🚀 Starting SANKALP Backend...")

    # Create upload directories
    for folder in ["profiles", "attendance", "temp"]:
        Path(settings.UPLOAD_DIR, folder).mkdir(parents=True, exist_ok=True)

    # Connect to MongoDB
    await connect_to_mongo()

    # Seed initial admin account if it doesn't exist
    await seed_admin()
    await seed_demo_worker()
    await seed_demo_leaves()

    logger.info("✅ SANKALP Backend ready.")
    yield

    # Shutdown
    await close_mongo_connection()
    logger.info("SANKALP Backend stopped.")


async def seed_admin():
    """Create the initial supervisor account if none exists."""
    from database.connection import get_database
    from utils.password_handler import hash_password
    from datetime import datetime

    db = get_database()
    existing = await db.users.find_one({"email": settings.ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "name": settings.ADMIN_NAME,
            "email": settings.ADMIN_EMAIL.lower(),
            "password": hash_password(settings.ADMIN_PASSWORD),
            "role": "supervisor",
            "createdAt": datetime.utcnow(),
        })
        logger.info(f"✅ Admin account created: {settings.ADMIN_EMAIL}")

async def seed_demo_worker():
    """Create the demo worker account."""
    from database.connection import get_database
    from utils.password_handler import hash_password
    from datetime import datetime

    db = get_database()

    email2 = "rajdivyanshu19@gmail.com"
    existing2 = await db.users.find_one({"email": email2})
    if not existing2:
        await db.users.insert_one({
            "name": "Raj Divyanshu 19",
            "email": email2,
            "password": hash_password("Divyanshu"),
            "role": "worker",
            "workerId": "DEMO-WORKER-2",
            "createdAt": datetime.utcnow(),
        })
        logger.info(f"✅ Demo worker account created: {email2}")

async def seed_demo_leaves():
    """Seed mock leave requests for all workers who have none."""
    from database.connection import get_database
    from datetime import datetime, timedelta

    db = get_database()
    
    # Get all physical workers
    workers = await db.workers.find({}).to_list(1000)
    
    # Get all worker user accounts (for demo accounts)
    worker_users = await db.users.find({"role": "worker"}).to_list(1000)
    
    # Combine them into a uniform format
    all_workers = []
    for w in workers:
        if w.get("workerId"):
            all_workers.append({"workerId": w.get("workerId"), "name": w.get("fullName", "Worker")})
            
    for u in worker_users:
        if u.get("workerId"):
            all_workers.append({"workerId": u.get("workerId"), "name": u.get("name", "Worker")})
            
    now = datetime.utcnow()
    new_leaves = []
    
    for w in all_workers:
        worker_id = w["workerId"]
        worker_name = w["name"]
            
        # Check if we already seeded leaves for this worker
        existing_leaves = await db.leaves.count_documents({"workerId": worker_id})
        if existing_leaves == 0:
            mock_leaves = [
                {
                    "workerId": worker_id,
                    "workerName": worker_name,
                    "leaveType": "Sick Leave",
                    "startDate": (now - timedelta(days=10)).isoformat(),
                    "endDate": (now - timedelta(days=8)).isoformat(),
                    "reason": "Severe fever and body ache. Need rest.",
                    "status": "approved",
                    "decidedBy": "Admin",
                    "decidedAt": now - timedelta(days=9),
                    "createdAt": now - timedelta(days=11),
                    "updatedAt": now - timedelta(days=9),
                },
                {
                    "workerId": worker_id,
                    "workerName": worker_name,
                    "leaveType": "Personal Leave",
                    "startDate": (now - timedelta(days=3)).isoformat(),
                    "endDate": (now - timedelta(days=3)).isoformat(),
                    "reason": "Need to attend a family wedding in my hometown.",
                    "status": "rejected",
                    "decidedBy": "Admin",
                    "decidedAt": now - timedelta(days=2),
                    "rejectReason": "Not enough notice given. Please apply 7 days in advance.",
                    "createdAt": now - timedelta(days=4),
                    "updatedAt": now - timedelta(days=2),
                },
                {
                    "workerId": worker_id,
                    "workerName": worker_name,
                    "leaveType": "Emergency Leave",
                    "startDate": (now + timedelta(days=2)).isoformat(),
                    "endDate": (now + timedelta(days=4)).isoformat(),
                    "reason": "Urgent house repairs required due to monsoon damage.",
                    "status": "pending",
                    "createdAt": now - timedelta(hours=5),
                    "updatedAt": now - timedelta(hours=5),
                }
            ]
            new_leaves.extend(mock_leaves)
            
    if new_leaves:
        await db.leaves.insert_many(new_leaves)
        logger.info(f"✅ Seeded mock leaves for {len(new_leaves) // 3} workers")

# Initialize FastAPI application
app = FastAPI(
    title="SANKALP API",
    description="AI-powered Rural Workforce Management Platform — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static assets
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Register all API routers under /api/v1
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(workers.router, prefix=api_prefix)
app.include_router(attendance.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(manual_review.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)
app.include_router(settings_router.router, prefix=api_prefix)
app.include_router(leaves.router,          prefix=api_prefix)
app.include_router(documents.router,       prefix=api_prefix)


# Global exception handler — return clean JSON errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "SANKALP API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.APP_ENV,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for deployment monitoring."""
    from database.connection import get_database
    try:
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.APP_ENV == "development",
        log_level="info",
    )
