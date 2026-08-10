from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.connection import get_database
from utils.jwt_handler import decode_access_token
from bson import ObjectId

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency: validates JWT token and returns the current user dict.
    Raises 401 if token is invalid or expired.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )
    
    # Serialize _id to string for downstream use
    user["id"] = str(user["_id"])
    return user


async def require_supervisor(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency: ensures the current user has the 'supervisor' role.
    Returns 403 Forbidden for workers or others.
    """
    if current_user.get("role") != "supervisor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Supervisor role required.",
        )
    return current_user


async def require_worker(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency: ensures the current user has the 'worker' role.
    """
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required.",
        )
    return current_user
