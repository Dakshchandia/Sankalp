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

async def seed_009():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(
        settings.MONGODB_URI, 
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    db = client[settings.DATABASE_NAME]

    worker_id = "009"
    worker_name = "Divyanshu Raj"
    
    print(f"Generating past 30 days of attendance for {worker_id}...")
    now = datetime.utcnow()
    
    # First, let's delete any existing attendance for this user to avoid duplicates
    await db.attendance.delete_many({"workerId": worker_id})
    
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
            "workerId": worker_id,
            "workerName": worker_name,
            "date": date_obj.strftime("%Y-%m-%d"),
            "time": time_str,
            "status": status,
            "confidence": round(random.uniform(75.0, 98.5), 1),
            "reviewStatus": "verified",
            "createdAt": date_obj
        })
            
    print("Seed complete for 009!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_009())
