import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
from datetime import datetime, timezone, timedelta

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client[settings.DATABASE_NAME]
    
    ist = timezone(timedelta(hours=5, minutes=30))
    now = datetime.now(ist)
    date_str = now.strftime("%Y-%m-%d")
    
    # Insert for 009
    await db.attendance.insert_one({
        "workerId": "009",
        "workerName": "Divyanshu Raj",
        "date": date_str,
        "time": now.strftime("%I:%M %p"),
        "status": "present",
        "confidence": 99.9,
        "reviewStatus": "verified",
        "source": "worker-self",
        "createdAt": now
    })
    
    print(f"Inserted record for {date_str} successfully.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
