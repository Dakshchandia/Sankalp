from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from typing import Optional
from middleware.auth_middleware import get_current_user, require_supervisor
from database.connection import get_database
from services.audit_service import audit_service
from datetime import datetime
from bson import ObjectId
import uuid, os
from pathlib import Path
from config.settings import settings

router = APIRouter(prefix="/documents", tags=["Documents"])


def _fmt(doc: dict) -> dict:
    doc["id"] = str(doc["_id"]); doc.pop("_id", None)
    for f in ["uploadedAt", "verifiedAt", "updatedAt"]:
        if f in doc and hasattr(doc[f], "isoformat"):
            doc[f] = doc[f].isoformat()
    return doc


@router.post("", summary="Worker uploads a document")
async def upload_document(
    documentName: str = Form(...),
    documentType: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    worker_id = current_user.get("workerId")
    if not worker_id:
        from fastapi import HTTPException
        raise HTTPException(400, "No worker profile linked to this account.")

    # Save file
    ext = Path(file.filename).suffix if file.filename else ".bin"
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = Path(settings.UPLOAD_DIR) / "documents"
    dest.mkdir(parents=True, exist_ok=True)
    content = await file.read()
    (dest / fname).write_bytes(content)

    db = get_database()
    doc = {
        "workerId":     worker_id,
        "workerName":   current_user.get("name", ""),
        "documentName": documentName,
        "documentType": documentType,
        "fileName":     fname,
        "status":       "pending",
        "uploadedAt":   datetime.utcnow(),
        "updatedAt":    datetime.utcnow(),
    }
    result = await db.documents.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


@router.get("/me", summary="Get current worker's documents")
async def get_my_documents(current_user: dict = Depends(get_current_user)):
    worker_id = current_user.get("workerId")
    if not worker_id:
        return []
    db = get_database()
    docs = await db.documents.find({"workerId": worker_id}).sort("uploadedAt", -1).to_list(100)
    return [_fmt(d) for d in docs]


@router.get("/pending", summary="Manager: get pending documents")
async def get_pending_documents(_: dict = Depends(require_supervisor)):
    db = get_database()
    docs = await db.documents.find({"status": "pending"}).sort("uploadedAt", -1).to_list(200)
    return [_fmt(d) for d in docs]


@router.get("", summary="Manager: get all documents")
async def get_all_documents(
    status: Optional[str] = Query(None),
    workerId: Optional[str] = Query(None),
    _: dict = Depends(require_supervisor),
):
    db = get_database()
    q = {}
    if status:   q["status"]   = status
    if workerId: q["workerId"] = workerId.upper()
    docs = await db.documents.find(q).sort("uploadedAt", -1).to_list(500)
    return [_fmt(d) for d in docs]


@router.post("/{doc_id}/decide", summary="Manager: verify or reject a document")
async def decide_document(
    doc_id: str,
    body: dict,
    supervisor: dict = Depends(require_supervisor),
):
    from fastapi import HTTPException
    db = get_database()
    decision = body.get("decision")
    if decision not in ("verified", "rejected"):
        raise HTTPException(400, "decision must be 'verified' or 'rejected'")

    doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(404, "Document not found")

    await db.documents.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {
            "status":       decision,
            "verifiedBy":   supervisor.get("name"),
            "verifiedAt":   datetime.utcnow(),
            "rejectReason": body.get("rejectReason", ""),
            "updatedAt":    datetime.utcnow(),
        }},
    )

    await audit_service.log(
        action=f"Document {decision.title()}",
        performed_by=supervisor["name"],
        performed_by_id=str(supervisor["_id"]),
        description=f"Document '{doc.get('documentName')}' for worker {doc.get('workerId')} {decision}",
    )

    updated = await db.documents.find_one({"_id": ObjectId(doc_id)})
    return _fmt(updated)
