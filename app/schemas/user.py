from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID              # 👈 FIX: UUID instead of str
    email: EmailStr
    stage: str

    class Config:
        from_attributes = True
