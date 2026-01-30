from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import List

from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# Pydantic schemas
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str = "Medium"
    category: str = "General"

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    category: str | None = None
    status: str | None = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str | None
    priority: str
    category: str
    status: str

# Routes
@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get all tasks for the current user."""
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    return [
        TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            priority=task.priority,
            category=task.category,
            status=task.status,
        )
        for task in tasks
    ]

@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new task."""
    task = Task(
        user_id=user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        category=task_data.category,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        priority=task.priority,
        category=task.category,
        status=task.status,
    )

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update a task."""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = db.query(Task).filter(
        Task.id == task_uuid,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields
    for field, value in task_data.dict(exclude_unset=True).items():
        if value is not None:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        priority=task.priority,
        category=task.category,
        status=task.status,
    )

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a task."""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = db.query(Task).filter(
        Task.id == task_uuid,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
