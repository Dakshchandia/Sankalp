import os
import uuid
from pathlib import Path
from typing import Optional
from PIL import Image
import io
from fastapi import UploadFile, HTTPException, status
from config.settings import settings

import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configure Cloudinary if URL is provided
if settings.CLOUDINARY_URL:
    cloudinary.config(url=settings.CLOUDINARY_URL)

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
    Returns the stored filename or Cloudinary URL.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    content = await file.read()

    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size must be less than {settings.MAX_FILE_SIZE_MB}MB",
        )

    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file. Please upload a valid photo.",
        )
        
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
    img_byte_arr.seek(0)

    if settings.CLOUDINARY_URL:
        # Upload to Cloudinary
        response = cloudinary.uploader.upload(
            img_byte_arr,
            folder=f"sankalp/{subfolder}",
            format="jpg"
        )
        return response.get("secure_url")
    else:
        # Save locally
        filename = f"{uuid.uuid4().hex}.jpg"
        save_path = get_upload_path(subfolder) / filename
        with open(save_path, "wb") as f:
            f.write(img_byte_arr.getvalue())
        return f"{subfolder}/{filename}"


async def save_attendance_snapshot(image_bytes: bytes, subfolder: str = "attendance") -> str:
    """Save a captured attendance snapshot and return the filename or Cloudinary URL."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.thumbnail((640, 480), Image.LANCZOS)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid captured image")

    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG', quality=80, optimize=True)
    img_byte_arr.seek(0)
    
    if settings.CLOUDINARY_URL:
        response = cloudinary.uploader.upload(
            img_byte_arr,
            folder=f"sankalp/{subfolder}",
            format="jpg"
        )
        return response.get("secure_url")
    else:
        filename = f"{uuid.uuid4().hex}.jpg"
        save_path = get_upload_path(subfolder) / filename
        with open(save_path, "wb") as f:
            f.write(img_byte_arr.getvalue())
        return f"{subfolder}/{filename}"


def delete_image(filename: str) -> None:
    """Delete an uploaded image file safely."""
    if filename.startswith("http"):
        if settings.CLOUDINARY_URL and "cloudinary" in filename:
            try:
                # Extract public_id from Cloudinary URL
                parts = filename.split("/")
                if "sankalp" in parts:
                    idx = parts.index("sankalp")
                    public_id = "/".join(parts[idx:]).split(".")[0]
                    cloudinary.uploader.destroy(public_id)
            except Exception:
                pass
        return

    path = Path(settings.UPLOAD_DIR) / filename
    if path.exists():
        path.unlink()
