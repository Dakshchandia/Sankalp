from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Never hardcode secrets — always use .env file.
    """

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "sankalp"

    # JWT
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # App
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 5
    CLOUDINARY_URL: Optional[str] = None


    # Attendance
    CONFIDENCE_THRESHOLD: float = 70.0
    LATE_AFTER_TIME: str = "09:00"
    WORK_START_TIME: str = "08:00"

    # Admin seed
    ADMIN_EMAIL: str = "admin@sankalp.gov.in"
    ADMIN_PASSWORD: str = "Admin@1234"
    ADMIN_NAME: str = "System Administrator"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        extra = "ignore"


# Singleton settings instance
settings = Settings()
