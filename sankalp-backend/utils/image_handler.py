import os
import uuid
from pathlib import Path
from typing import Optional
from PIL import Image
import io
from fastapi import UploadFile, HTTPException, status
from config.settings import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_DIMENSION = 800  # px — resize to max 800x800


def get_upload_path(subfolder: str = "") -> Path:
    """Return the absolute upload directory path, creating it if needed."""
    base = Path(settings.UPLOAD_DIR)
    folder = base / subfolder if subfolder else base
    folder.mkdir(parents=True, exist_ok=True)
    return folder


async def save_profile_image(file: UploadFile, subfolder: str = "profiles") -> str:
    """
    Validate, resize, and save a profile image.
    Returns the stored filename.
    """
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    content = await file.read()

    # Validate file size
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size must be less than {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Open and resize with Pillow
    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file. Please upload a valid photo.",
        )

    # Generate unique filename
    ext = "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = get_upload_path(subfolder) / filename

    # Save optimized JPEG
    image.save(save_path, "JPEG", quality=85, optimize=True)
    return f"{subfolder}/{filename}"


async def save_attendance_snapshot(image_bytes: bytes, subfolder: str = "attendance") -> str:
    """Save a captured attendance snapshot and return the filename."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.thumbnail((640, 480), Image.LANCZOS)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid captured image")

    filename = f"{uuid.uuid4().hex}.jpg"
    save_path = get_upload_path(subfolder) / filename
    image.save(save_path, "JPEG", quality=80, optimize=True)
    return f"{subfolder}/{filename}"


def delete_image(filename: str) -> None:
    """Delete an uploaded image file safely."""
    path = Path(settings.UPLOAD_DIR) / filename
    if path.exists():
        path.unlink()
