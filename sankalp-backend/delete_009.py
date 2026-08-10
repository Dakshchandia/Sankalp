import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.settings import settings

async def delete_009():
    client = AsyncIOMotorClient(
        settings.MONGODB_URI, 
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    db = client[settings.DATABASE_NAME]

    worker_id = "009"
    email = "divyanshu@gmail.com"

    print(f"Deleting worker {worker_id} and all associated data...")
    
    await db.workers.delete_many({"workerId": worker_id})
    await db.users.delete_many({"email": email})
    await db.users.delete_many({"workerId": worker_id})
    await db.attendance.delete_many({"workerId": worker_id})
    
    print("Deleted successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(delete_009())
