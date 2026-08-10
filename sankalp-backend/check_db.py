import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
import sys
import os

async def main():
    print("Connecting...")
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client[settings.DATABASE_NAME]
    
    print("Fetching attendance...")
    att = await db.attendance.find({}).to_list(10)
    print("Attendance:", att)
    
    print("Fetching user...")
    users = await db.users.find({"workerId": "009"}).to_list(1)
    print("Users:", users)
    
    print("Fetching worker...")
    workers = await db.workers.find({"workerId": "009"}).to_list(1)
    print("Workers:", workers)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
