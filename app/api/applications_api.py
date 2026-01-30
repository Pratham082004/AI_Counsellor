from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.application_checklist import ApplicationChecklist, ChecklistItemStatus
from app.models.locked_university import LockedUniversity
from app.models.university import University
from app.models.user import User
from app.models.application_document import ApplicationDocument, SOPDraft
from app.core.dependencies import get_current_user
from app.core.stages import STAGE
from app.services.ai_service import ask_ai

router = APIRouter(prefix="/applications", tags=["Applications"])

DEFAULT_TASKS = ["SOP", "LOR", "IELTS", "TOEFL"]

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# PYDANTIC SCHEMAS
# =========================
class ChecklistItemUpdate(BaseModel):
    status: ChecklistItemStatus
    notes: str | None = None


# =========================
# INITIALIZE APPLICATION CHECKLIST
# =========================
@router.post("/initialize")
def initialize_application_checklist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Initialize checklist items for locked university."""
    
    # Ensure user has locked a university
    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    if not locked:
        raise HTTPException(status_code=400, detail="No locked university found")

    # Check if checklist already exists
    existing = (
        db.query(ApplicationChecklist)
        .filter(ApplicationChecklist.user_id == user.id)
        .first()
    )

    if existing:
        return {"message": "Checklist already initialized", "status": "already_exists"}

    # Default checklist items
    items = ["SOP", "LOR", "IELTS", "TOEFL"]
    
    for item_name in items:
        checklist_item = ApplicationChecklist(
            user_id=user.id,
            locked_university_id=locked.id,
            item_name=item_name,
            status=ChecklistItemStatus.PENDING
        )
        db.add(checklist_item)

    db.commit()

    return {
        "message": "Checklist initialized successfully",
        "items": items,
        "status": "initialized"
    }


# =========================
# GET CHECKLIST
# =========================
@router.get("/checklist")
def get_application_checklist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get application checklist for current user."""
    
    # Allow users in LOCKED or APPLICATION stage
    if user.stage not in (STAGE.LOCKED, STAGE.APPLICATION):
        raise HTTPException(status_code=400, detail="User is not in application flow")

    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    if not locked:
        raise HTTPException(status_code=400, detail="No locked university found")

    items = (
        db.query(ApplicationChecklist)
        .filter(ApplicationChecklist.user_id == user.id)
        .order_by(ApplicationChecklist.created_at)
        .all()
    )

    # Get locked university details
    uni = db.query(University).filter(University.id == locked.university_id).first()

    checklist_data = []
    pending_count = 0
    submitted_count = 0
    approved_count = 0

    for item in items:
        checklist_data.append({
            "id": str(item.id),
            "item_name": item.item_name,
            "status": item.status.value,
            "notes": item.notes,
            "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None,
            "approved_at": item.approved_at.isoformat() if item.approved_at else None
        })
        
        if item.status == ChecklistItemStatus.PENDING:
            pending_count += 1
        elif item.status == ChecklistItemStatus.SUBMITTED:
            submitted_count += 1
        elif item.status == ChecklistItemStatus.APPROVED:
            approved_count += 1

    return {
        "locked_university": {
            "id": str(uni.id),
            "name": uni.name,
            "country": uni.country,
            "degree": uni.degree,
            "field": uni.field
        } if uni else None,
        "checklist": checklist_data,
        "progress": {
            "total": len(items),
            "pending": pending_count,
            "submitted": submitted_count,
            "approved": approved_count,
            "completion_percentage": int((approved_count / len(items) * 100)) if items else 0
        }
    }


# =========================
# Simple tasks endpoints (boolean completion)
# =========================
@router.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return tasks and boolean completion status. Allowed when LOCKED or APPLICATION."""
    if user.stage not in (STAGE.LOCKED, STAGE.APPLICATION):
        raise HTTPException(status_code=403, detail="User not in application flow")

    # Ensure locked university exists
    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )
    if not locked:
        raise HTTPException(status_code=400, detail="No locked university found")

    items = (
        db.query(ApplicationChecklist)
        .filter(ApplicationChecklist.user_id == user.id)
        .all()
    )

    item_map = {i.item_name: i for i in items}

    tasks = []
    for t in DEFAULT_TASKS:
        item = item_map.get(t)
        completed = False
        if item and item.status in (ChecklistItemStatus.SUBMITTED, ChecklistItemStatus.APPROVED):
            completed = True
        tasks.append({"task": t, "completed": completed})

    return {"locked_university_id": str(locked.id), "tasks": tasks, "stage": user.stage}


@router.post("/tasks/{task}/complete")
def complete_task(
    task: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark a task as completed (boolean). Initializes checklist if needed."""
    if user.stage not in (STAGE.LOCKED, STAGE.APPLICATION):
        raise HTTPException(status_code=403, detail="User not in application flow")

    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )
    if not locked:
        raise HTTPException(status_code=400, detail="No locked university found")

    # Ensure checklist items exist
    existing = (
        db.query(ApplicationChecklist)
        .filter(ApplicationChecklist.user_id == user.id)
        .first()
    )
    if not existing:
        # initialize defaults
        for item_name in DEFAULT_TASKS:
            checklist_item = ApplicationChecklist(
                user_id=user.id,
                locked_university_id=locked.id,
                item_name=item_name,
                status=ChecklistItemStatus.PENDING
            )
            db.add(checklist_item)
        db.commit()

    # Find the item (case-insensitive match)
    item = (
        db.query(ApplicationChecklist)
        .filter(ApplicationChecklist.user_id == user.id, ApplicationChecklist.item_name.ilike(task))
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Task not found")

    # Mark as submitted (completed boolean)
    item.status = ChecklistItemStatus.SUBMITTED
    item.submitted_at = datetime.now(timezone.utc)
    db.commit()

    # Transition user to APPLICATION stage if currently LOCKED
    if user.stage == STAGE.LOCKED:
        user.stage = STAGE.APPLICATION
        db.commit()

    return {"message": "Task marked complete", "task": item.item_name, "stage": user.stage}


# =========================
# UPDATE CHECKLIST ITEM
# =========================
@router.put("/checklist/{item_id}")
def update_checklist_item(
    item_id: UUID,
    update: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update a specific checklist item."""
    
    item = (
        db.query(ApplicationChecklist)
        .filter(
            ApplicationChecklist.id == item_id,
            ApplicationChecklist.user_id == user.id
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    # Update status and notes
    item.status = update.status
    if update.notes:
        item.notes = update.notes

    # Set submission timestamp if transitioning to SUBMITTED
    if update.status == ChecklistItemStatus.SUBMITTED and not item.submitted_at:
        item.submitted_at = datetime.now(timezone.utc)

    # Set approval timestamp if transitioning to APPROVED
    if update.status == ChecklistItemStatus.APPROVED and not item.approved_at:
        item.approved_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "message": "Checklist item updated",
        "item": {
            "id": str(item.id),
            "item_name": item.item_name,
            "status": item.status.value,
            "notes": item.notes
        }
    }


# =========================
# GET SINGLE ITEM
# =========================
@router.get("/checklist/{item_id}")
def get_checklist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a specific checklist item."""
    
    item = (
        db.query(ApplicationChecklist)
        .filter(
            ApplicationChecklist.id == item_id,
            ApplicationChecklist.user_id == user.id
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    return {
        "item": {
            "id": str(item.id),
            "item_name": item.item_name,
            "status": item.status.value,
            "notes": item.notes,
            "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None,
            "approved_at": item.approved_at.isoformat() if item.approved_at else None
        }
    }


# =========================
# DOCUMENT UPLOAD ENDPOINTS
# =========================
@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    checklist_item_id: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a document for application checklist."""

    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Only PDF, JPEG, PNG allowed.")

    # Validate file size (max 10MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    # Generate unique filename
    import uuid
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Create database record
    document = ApplicationDocument(
        user_id=user.id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        notes=notes,
        checklist_item_id=UUID(checklist_item_id) if checklist_item_id else None
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document": {
            "id": str(document.id),
            "document_type": document.document_type,
            "file_name": document.file_name,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "notes": document.notes,
            "created_at": document.created_at.isoformat()
        }
    }


@router.get("/documents")
def get_user_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get all documents for current user."""

    documents = (
        db.query(ApplicationDocument)
        .filter(ApplicationDocument.user_id == user.id)
        .order_by(ApplicationDocument.created_at.desc())
        .all()
    )

    return {
        "documents": [
            {
                "id": str(doc.id),
                "document_type": doc.document_type,
                "file_name": doc.file_name,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "notes": doc.notes,
                "is_final": doc.is_final,
                "created_at": doc.created_at.isoformat(),
                "updated_at": doc.updated_at.isoformat()
            }
            for doc in documents
        ]
    }


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a document."""

    document = (
        db.query(ApplicationDocument)
        .filter(
            ApplicationDocument.id == document_id,
            ApplicationDocument.user_id == user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from filesystem
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete from database
    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


# =========================
# SOP DRAFT ENDPOINTS
# =========================
@router.post("/sop/drafts")
def create_sop_draft(
    title: str = Form(...),
    content: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new SOP draft."""

    draft = SOPDraft(
        user_id=user.id,
        title=title,
        content=content,
        version=1,
        is_draft=1
    )

    db.add(draft)
    db.commit()
    db.refresh(draft)

    return {
        "message": "SOP draft created",
        "draft": {
            "id": str(draft.id),
            "title": draft.title,
            "content": draft.content,
            "version": draft.version,
            "is_draft": draft.is_draft,
            "created_at": draft.created_at.isoformat()
        }
    }


@router.get("/sop/drafts")
def get_sop_drafts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get all SOP drafts for current user."""

    drafts = (
        db.query(SOPDraft)
        .filter(SOPDraft.user_id == user.id)
        .order_by(SOPDraft.created_at.desc())
        .all()
    )

    return {
        "drafts": [
            {
                "id": str(draft.id),
                "title": draft.title,
                "content": draft.content,
                "version": draft.version,
                "is_draft": draft.is_draft,
                "created_at": draft.created_at.isoformat(),
                "updated_at": draft.updated_at.isoformat()
            }
            for draft in drafts
        ]
    }


@router.put("/sop/drafts/{draft_id}")
def update_sop_draft(
    draft_id: UUID,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update an SOP draft."""

    draft = (
        db.query(SOPDraft)
        .filter(
            SOPDraft.id == draft_id,
            SOPDraft.user_id == user.id
        )
        .first()
    )

    if not draft:
        raise HTTPException(status_code=404, detail="SOP draft not found")

    if title:
        draft.title = title
    if content:
        draft.content = content
        draft.version += 1

    db.commit()
    db.refresh(draft)

    return {
        "message": "SOP draft updated",
        "draft": {
            "id": str(draft.id),
            "title": draft.title,
            "content": draft.content,
            "version": draft.version,
            "is_draft": draft.is_draft
        }
    }


@router.post("/sop/generate")
def generate_sop_with_ai(
    prompt: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate SOP content using AI."""

    # Get user profile for context
    from app.models.profile import Profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Complete onboarding first.")

    # Build context for AI
    context = f"""
    User Profile:
    - Education: {profile.education_level}
    - Major: {profile.major}
    - Graduation Year: {profile.graduation_year}
    - Target Degree: {profile.target_degree}
    - Target Field: {profile.target_field}
    - Target Country: {profile.target_country}
    - Budget: {profile.budget_range}

    User Request: {prompt}
    """

    # Generate SOP using AI
    ai_prompt = f"""
    Write a compelling Statement of Purpose (SOP) based on the following user profile and request:

    {context}

    The SOP should be:
    - 500-800 words
    - Well-structured with introduction, body, and conclusion
    - Highlight the user's background, motivations, and goals
    - Show why the user is a good fit for their target program
    - Professional and academic tone
    """

    try:
        generated_sop = ask_ai(ai_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Create draft
    draft = SOPDraft(
        user_id=user.id,
        title=f"SOP Draft - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        content=generated_sop,
        version=1,
        is_draft=1
    )

    db.add(draft)
    db.commit()
    db.refresh(draft)

    return {
        "message": "SOP generated successfully",
        "draft": {
            "id": str(draft.id),
            "title": draft.title,
            "content": draft.content,
            "version": draft.version,
            "is_draft": draft.is_draft,
            "created_at": draft.created_at.isoformat()
        }
    }


@router.delete("/sop/drafts/{draft_id}")
def delete_sop_draft(
    draft_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete an SOP draft."""

    draft = (
        db.query(SOPDraft)
        .filter(
            SOPDraft.id == draft_id,
            SOPDraft.user_id == user.id
        )
        .first()
    )

    if not draft:
        raise HTTPException(status_code=404, detail="SOP draft not found")

    db.delete(draft)
    db.commit()

    return {"message": "SOP draft deleted successfully"}
