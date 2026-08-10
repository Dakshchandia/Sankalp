"""
Face Recognition Service for SANKALP.
Uses the face_recognition library (dlib-based) and OpenCV for image processing.
Stores face embeddings as 128-dimensional vectors in MongoDB.

NOTE: face_recognition requires dlib + Visual C++ on Windows.
If unavailable, the service runs in MOCK mode for development/demo.
"""

import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import face_recognition — graceful fallback for environments without dlib
try:
    import face_recognition
    import cv2
    FACE_RECOGNITION_AVAILABLE = True
    logger.info("✅ face_recognition loaded successfully")
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logger.warning("⚠️  face_recognition not available — running in MOCK mode. Install dlib to enable real face recognition.")


import random


class FaceRecognitionService:
    """
    Manages face encoding generation and comparison.

    When face_recognition is available: uses real 128-dim dlib embeddings.
    When unavailable (no dlib/C++ compiler): runs in MOCK mode that simulates
    recognition for development and demo purposes.
    """

    def generate_embedding(self, image_bytes: bytes) -> Optional[list]:
        """Generate a 128-dim face embedding. Returns None if no face detected."""
        if not FACE_RECOGNITION_AVAILABLE:
            # MOCK: return a random 128-dim vector for dev/demo
            logger.debug("MOCK: generating fake embedding")
            return [random.uniform(-0.2, 0.2) for _ in range(128)]

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                return None

            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(img_rgb, model="hog")

            if len(face_locations) == 0:
                return None
            if len(face_locations) > 1:
                return None

            encodings = face_recognition.face_encodings(img_rgb, face_locations)
            return encodings[0].tolist() if encodings else None

        except Exception as e:
            logger.error(f"Face embedding failed: {e}")
            return None

    def compare_face(
        self,
        query_embedding: list,
        stored_embeddings: list,
        tolerance: float = 0.5,
    ) -> tuple:
        """Compare embeddings. Returns (is_match, confidence_percent)."""
        if not stored_embeddings or not query_embedding:
            return False, 0.0

        if not FACE_RECOGNITION_AVAILABLE:
            # MOCK mode — simulate realistic face comparison
            # In a real deployment, install dlib: pip install dlib face_recognition
            confidence = random.uniform(82.0, 96.0)
            return True, round(confidence, 2)

        try:
            query_arr = np.array(query_embedding)
            stored_arrs = [np.array(e) for e in stored_embeddings]
            distances = face_recognition.face_distance(stored_arrs, query_arr)
            min_distance = float(np.min(distances))
            confidence = max(0.0, (1.0 - min_distance) * 100)
            is_match = min_distance <= tolerance
            return is_match, round(confidence, 2)
        except Exception as e:
            logger.error(f"Face comparison failed: {e}")
            return False, 0.0

    def detect_face_in_bytes(self, image_bytes: bytes) -> dict:
        """Detect face presence. Used for enrollment validation."""
        if not FACE_RECOGNITION_AVAILABLE:
            return {"detected": True, "count": 1, "error": None}

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                return {"detected": False, "count": 0, "error": "Invalid image"}

            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            locations = face_recognition.face_locations(img_rgb)
            return {
                "detected": len(locations) == 1,
                "count": len(locations),
                "error": None if len(locations) == 1 else (
                    "No face detected" if len(locations) == 0 else "Multiple faces detected"
                ),
            }
        except Exception as e:
            return {"detected": False, "count": 0, "error": str(e)}


face_recognition_service = FaceRecognitionService()
