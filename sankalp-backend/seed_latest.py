import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
from datetime import datetime, timedelta, timezone
import random

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client[settings.DATABASE_NAME]
    
    # Get the latest created worker
    worker = await db.workers.find_one(sort=[("createdAt", -1)])
    if not worker:
        print("No workers found.")
        return
        
    worker_id = worker["workerId"]
    worker_name = worker["fullName"]
    print(f"Found latest worker: {worker_name} ({worker_id})")
    
    # Check if they already have past mock data
    count = await db.attendance.count_documents({"workerId": worker_id, "source": "mock-seed"})
    if count > 0:
        print("Mock data already exists for this worker.")
        return
        
    ist = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist)
    
    mock_attendance = []
    # Go back 30 days from yesterday
    for i in range(1, 31):
        past_date = now_ist - timedelta(days=i)
        if past_date.isoweekday() == 7:
            continue
            
        status_choice = random.choices(["present", "late", "absent"], weights=[80, 15, 5])[0]
        
        time_str = "-"
        confidence = 0.0
        
        if status_choice == "late":
            time_str = f"09:{random.randint(10, 59):02d} AM"
            confidence = round(random.uniform(85.0, 99.9), 1)
        elif status_choice == "present":
            time_str = f"07:{random.randint(30, 59):02d} AM"
            confidence = round(random.uniform(85.0, 99.9), 1)
            
        mock_attendance.append({
            "workerId": worker_id,
            "workerName": worker_name,
            "date": past_date.strftime("%Y-%m-%d"),
            "time": time_str,
            "status": status_choice,
            "confidence": confidence,
            "reviewStatus": "verified",
            "source": "mock-seed",
            "createdAt": past_date.replace(hour=8, minute=0, second=0, microsecond=0)
        })
        
    if mock_attendance:
        await db.attendance.insert_many(mock_attendance)
        print(f"Successfully seeded {len(mock_attendance)} days of mock attendance for {worker_id}.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
