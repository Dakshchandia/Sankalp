import asyncio
import os
import sys
from datetime import datetime, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# Adjust path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.settings import settings
from utils.password_handler import hash_password

async def seed_data():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(
        settings.MONGODB_URI, 
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    db = client[settings.DATABASE_NAME]

    print("Clearing existing data (except admin)...")
    await db.workers.delete_many({})
    await db.attendance.delete_many({})
    await db.users.delete_many({"role": "worker"})

    workers_data = [
        {"id": "W-1001", "name": "Ramesh Kumar", "village": "Rampur", "dept": "Agriculture", "gender": "male", "age": 35},
        {"id": "W-1002", "name": "Sita Devi", "village": "Sitapur", "dept": "Construction", "gender": "female", "age": 28},
        {"id": "W-1003", "name": "Divyanshu", "village": "Madhopur", "dept": "Maintenance", "gender": "male", "age": 22},
        {"id": "W-1004", "name": "Geeta Sharma", "village": "Rampur", "dept": "Agriculture", "gender": "female", "age": 41},
        {"id": "W-1005", "name": "Mukesh Singh", "village": "Sitapur", "dept": "Construction", "gender": "male", "age": 30},
    ]

    print("Inserting workers & user accounts...")
    for w in workers_data:
        # 1. Insert Worker Profile
        await db.workers.insert_one({
            "workerId": w["id"],
            "fullName": w["name"],
            "phone": "9" + "".join([str(random.randint(0, 9)) for _ in range(9)]),
            "village": w["village"],
            "department": w["dept"],
            "dailyWage": random.choice([350, 400, 450, 500]),
            "gender": w["gender"],
            "age": w["age"],
            "faceEnrolled": True,
            "profileImage": None,
            "faceEncoding": None,
            "createdAt": datetime.utcnow()
        })
        
        # 2. Insert Worker User Account (to login)
        email = f"{w['name'].lower().split()[0]}@sankalp.worker"
        await db.users.insert_one({
            "name": w["name"],
            "email": email,
            "password": hash_password("Worker@123"),
            "role": "worker",
            "workerId": w["id"],
            "createdAt": datetime.utcnow()
        })
        print(f"  Created user: {email} / Worker@123")

    print("Generating past 30 days of attendance...")
    now = datetime.utcnow()
    for w in workers_data:
        for i in range(30):
            # Skip some random days to make it realistic (absent/weekend)
            if random.random() < 0.15:
                continue
                
            date_obj = now - timedelta(days=i)
            # Decide if late or on time
            is_late = random.random() < 0.2
            hour = random.randint(9, 10) if is_late else random.randint(7, 8)
            minute = random.randint(0, 59)
            time_str = f"{hour:02d}:{minute:02d} {'AM'}"
            status = "late" if is_late else "present"
            
            await db.attendance.insert_one({
                "workerId": w["id"],
                "workerName": w["name"],
                "date": date_obj.strftime("%Y-%m-%d"),
                "time": time_str,
                "status": status,
                "confidence": round(random.uniform(75.0, 98.5), 1),
                "reviewStatus": "verified",
                "createdAt": date_obj
            })
            
    print("Seed complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
