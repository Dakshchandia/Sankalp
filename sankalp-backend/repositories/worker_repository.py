"""
Worker Repository — raw database access layer.
Business logic lives in services/, not here.
"""
from database.connection import get_database
from bson import ObjectId
from typing import Optional


class WorkerRepository:

    async def find_by_worker_id(self, worker_id: str) -> Optional[dict]:
        db = get_database()
        return await db.workers.find_one({"workerId": worker_id.upper()})

    async def find_all(self, query: dict = {}, skip: int = 0, limit: int = 10) -> list:
        db = get_database()
        return await db.workers.find(query).skip(skip).limit(limit).to_list(length=limit)

    async def count(self, query: dict = {}) -> int:
        db = get_database()
        return await db.workers.count_documents(query)

    async def insert(self, doc: dict) -> str:
        db = get_database()
        result = await db.workers.insert_one(doc)
        return str(result.inserted_id)

    async def update(self, worker_id: str, updates: dict) -> bool:
        db = get_database()
        result = await db.workers.update_one(
            {"workerId": worker_id.upper()}, {"$set": updates}
        )
        return result.modified_count > 0

    async def delete(self, worker_id: str) -> bool:
        db = get_database()
        result = await db.workers.delete_one({"workerId": worker_id.upper()})
        return result.deleted_count > 0


worker_repository = WorkerRepository()
