from database.connection import get_database
from utils.password_handler import hash_password, verify_password
from utils.jwt_handler import create_access_token
from schemas.auth import LoginRequest, TokenResponse, UserResponse
from fastapi import HTTPException, status
from bson import ObjectId
from datetime import datetime


class AuthService:
    """Handles authentication logic: login, token generation, password changes."""

    async def login(self, request: LoginRequest) -> TokenResponse:
        """Authenticate a user by email and password. Returns JWT token."""
        db = get_database()
        user = await db.users.find_one({"email": request.email.lower()})

        if not user or not verify_password(request.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again.",
            )

        token = create_access_token(data={"sub": str(user["_id"]), "role": user["role"]})

        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                role=user["role"],
                workerId=user.get("workerId"),
                createdAt=user["createdAt"].isoformat(),
            ),
        )

    async def get_user_by_id(self, user_id: str) -> dict:
        """Fetch user by MongoDB ObjectId."""
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        """Verify current password and update to new bcrypt hash."""
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})

        if not user or not verify_password(current_password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password": hash_password(new_password),
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

    async def create_worker_account(
        self, name: str, email: str, password: str, worker_id: str
    ) -> dict:
        """Create a worker login account linked to an existing worker profile."""
        db = get_database()
        existing = await db.users.find_one({"email": email.lower()})
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered.")
        # Verify worker exists
        worker = await db.workers.find_one({"workerId": worker_id.upper()})
        if not worker:
            raise HTTPException(status_code=404, detail=f"Worker ID {worker_id} not found.")

        user_doc = {
            "name": name,
            "email": email.lower(),
            "password": hash_password(password),
            "role": "worker",
            "workerId": worker_id.upper(),
            "createdAt": datetime.utcnow(),
        }
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return {"id": str(result.inserted_id), "email": email, "workerId": worker_id.upper(), "message": "Worker account created successfully."}


auth_service = AuthService()
