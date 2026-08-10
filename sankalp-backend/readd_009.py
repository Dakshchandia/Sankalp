import asyncio
import os
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.settings import settings
from utils.password_handler import hash_password

async def readd_009():
    client = AsyncIOMotorClient(
        settings.MONGODB_URI, 
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    db = client[settings.DATABASE_NAME]

    worker_id = "009"
    name = "Divyanshu Raj"
    email = "divyanshu@gmail.com"
    password = "Password@123"

    # Delete if exists to prevent duplicates
    await db.workers.delete_many({"workerId": worker_id})
    await db.users.delete_many({"email": email})

    print("Inserting Worker Profile...")
    await db.workers.insert_one({
        "workerId": worker_id,
        "fullName": name,
        "phone": "9876543210",
        "village": "Local",
        "department": "Maintenance",
        "dailyWage": 750,
        "gender": "male",
        "age": 28,
        "faceEnrolled": True,
        "createdAt": datetime.utcnow()
    })
    
    print("Inserting Login Account...")
    await db.users.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": "worker",
        "workerId": worker_id,
        "createdAt": datetime.utcnow()
    })
            
    print("Done!")
    client.close()

if __name__ == "__main__":
    asyncio.run(readd_009())
