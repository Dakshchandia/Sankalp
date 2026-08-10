from fastapi import APIRouter, Depends, Body
from services.auth_service import auth_service
from schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest, UserResponse
from middleware.auth_middleware import get_current_user, require_supervisor
from schemas.common import MessageResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, summary="Login with email and password")
async def login(request: LoginRequest):
    """
    Authenticate supervisor or worker.
    Returns JWT access token and user profile.
    """
    return await auth_service.login(request)


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        workerId=current_user.get("workerId"),
        createdAt=current_user["createdAt"].isoformat(),
    )


@router.post("/change-password", response_model=MessageResponse, summary="Change account password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """Change the current user's password. Requires current password verification."""
    await auth_service.change_password(
        str(current_user["_id"]), request.current_password, request.new_password
    )
    return MessageResponse(message="Password updated successfully")


@router.post("/register-worker-account", summary="Register a worker user account linked to a worker profile")
async def register_worker_account(
    body: dict,
    supervisor: dict = Depends(require_supervisor),
):
    """
    Supervisor creates a login account for a worker and links it to their worker profile.
    body: { name, email, password, workerId }
    """
    return await auth_service.create_worker_account(
        name=body["name"],
        email=body["email"],
        password=body["password"],
        worker_id=body["workerId"],
    )
