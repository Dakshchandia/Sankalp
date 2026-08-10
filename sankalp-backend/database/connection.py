from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Global database client reference
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None

import certifi

async def connect_to_mongo() -> None:
    """Initialize MongoDB connection and create indexes."""
    global _client, _db
    try:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URI, 
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True
        )
        _db = _client[settings.DATABASE_NAME]

        # Verify connection
        await _client.admin.command("ping")
        logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")

        # Create performance indexes
        await create_indexes()

    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise


async def close_mongo_connection() -> None:
    """Close the MongoDB connection gracefully."""
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Return the database instance. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongo() first.")
    return _db


async def create_indexes() -> None:
    """
    Create MongoDB indexes for performance optimization.
    Each important query field is indexed.
    """
    db = get_database()

    # Users collection
    await db.users.create_indexes([
        IndexModel([("email", ASCENDING)], unique=True, name="idx_users_email"),
    ])

    # Workers collection
    await db.workers.create_indexes([
        IndexModel([("workerId", ASCENDING)], unique=True, name="idx_workers_workerId"),
        IndexModel([("village", ASCENDING)], name="idx_workers_village"),
        IndexModel([("department", ASCENDING)], name="idx_workers_department"),
        IndexModel([("fullName", ASCENDING)], name="idx_workers_fullName"),
    ])

    # Attendance collection
    await db.attendance.create_indexes([
        IndexModel([("workerId", ASCENDING), ("date", DESCENDING)], name="idx_attendance_worker_date"),
        IndexModel([("date", DESCENDING)], name="idx_attendance_date"),
        IndexModel([("status", ASCENDING)], name="idx_attendance_status"),
        IndexModel([("reviewStatus", ASCENDING)], name="idx_attendance_reviewStatus"),
    ])

    # ManualReviews collection
    await db.manual_reviews.create_indexes([
        IndexModel([("decision", ASCENDING)], name="idx_reviews_decision"),
        IndexModel([("createdAt", DESCENDING)], name="idx_reviews_createdAt"),
    ])

    # AuditLogs collection
    await db.audit_logs.create_indexes([
        IndexModel([("timestamp", DESCENDING)], name="idx_audit_timestamp"),
        IndexModel([("action", ASCENDING)], name="idx_audit_action"),
        IndexModel([("performedBy", ASCENDING)], name="idx_audit_performedBy"),
    ])

    logger.info("✅ Database indexes created.")
