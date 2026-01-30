from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import time
from collections import defaultdict, deque
import requests
import os
import json
from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatHistoryResponse(BaseModel):
    messages: List[dict]
    conversation_id: str

from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.locked_university import LockedUniversity
from app.models.shortlist import Shortlist
from app.models.university import University
from app.models.ai_counsellor_chat import AICounsellorChat
from app.core.dependencies import get_current_user
import uuid

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

router = APIRouter(prefix="/ai", tags=["AI Counsellor"])

# Simple rate limiter per user (3 requests per 2 minutes)
RATE_LIMIT = 3
RATE_WINDOW = 120
_user_ai_requests = defaultdict(deque)


def check_ai_rate_limit(user_id):
    now = time.time()
    window_start = now - RATE_WINDOW
    requests_q = _user_ai_requests[user_id]
    while requests_q and requests_q[0] < window_start:
        requests_q.popleft()
    if len(requests_q) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many AI requests. Try again later.")
    requests_q.append(now)


def get_user_context(db, user):
    """Get user profile and context for AI"""
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    locked = (
        db.query(LockedUniversity)
        .filter(LockedUniversity.user_id == user.id)
        .first()
    )

    shortlist_items = (
        db.query(Shortlist)
        .filter(Shortlist.user_id == user.id)
        .all()
    )

    shortlisted = []
    for s in shortlist_items:
        u = db.query(University).filter(University.id == s.university_id).first()
        if u:
            shortlisted.append({
                "name": u.name,
                "country": u.country,
                "degree": u.degree,
                "field": u.field,
                "estimated_tuition": (u.tuition_min + u.tuition_max) // 2,
                "difficulty": u.difficulty,
            })

    locked_data = locked.university_data if locked and getattr(locked, 'university_data', None) else None

    return {
        "profile": profile,
        "locked_data": locked_data,
        "shortlisted": shortlisted
    }


def build_system_prompt(profile, locked_data, shortlisted):
    """Build the system prompt for AI counsellor"""
    return f"""
You are an expert admissions counselor helping a student with their university application journey.

Student Profile:
- Name: {profile.first_name + ' ' + profile.last_name if profile else 'Unknown'}
- Education: {profile.education_level if profile else 'Unknown'} in {profile.major if profile else 'Unknown'}
- Graduation Year: {profile.graduation_year if profile else 'Unknown'}
- Target Degree: {profile.target_degree if profile else 'Unknown'}
- Target Field: {profile.target_field if profile else 'Unknown'}
- Target Country: {profile.target_country if profile else 'Unknown'}
- Budget Range: {profile.budget_range if profile else 'Unknown'}
- IELTS Score: {profile.ielts_score if profile else 'Not provided'}
- TOEFL Score: {profile.toefl_score if profile else 'Not provided'}
- SOP Status: {profile.sop_status if profile else 'Unknown'}
- LOR Status: {profile.lor_status if profile else 'Unknown'}

{f"Locked University: {json.dumps(locked_data, default=str)}" if locked_data else "No locked university yet."}

Shortlisted Universities: {json.dumps(shortlisted, default=str)}

Provide helpful, personalized advice about their university application. Be encouraging, specific, and actionable. Answer their questions based on their profile and application context. Keep your responses concise and focused.
"""


def get_greeting_message(profile):
    """Generate a personalized greeting message"""
    name = profile.first_name if profile else "there"
    return f"""Hi {name}! 👋

I'm your AI Counsellor, here to help you with your study abroad journey. 

I can assist you with:
• Analyzing your profile and suggesting improvements
• Recommending universities that fit your goals
• Understanding your chances at top universities
• Guidance on next steps in your application process

What would you like to know today?"""


@router.get("/counsellor/history")
def get_chat_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get user's chat history"""
    # Get all conversations for user, ordered by most recent
    chats = (
        db.query(AICounsellorChat)
        .filter(AICounsellorChat.user_id == user.id)
        .order_by(AICounsellorChat.created_at.desc())
        .all()
    )
    
    if not chats:
        return {"messages": [], "conversation_id": None}
    
    # Get the most recent conversation_id
    latest_chat = chats[0]
    conversation_id = str(latest_chat.conversation_id)
    
    # Get all messages for this conversation
    conversation_chats = (
        db.query(AICounsellorChat)
        .filter(
            AICounsellorChat.user_id == user.id,
            AICounsellorChat.conversation_id == latest_chat.conversation_id
        )
        .order_by(AICounsellorChat.created_at.asc())
        .all()
    )
    
    messages = [
        {
            "id": str(chat.id),
            "role": chat.role,
            "content": chat.content,
            "timestamp": chat.created_at.isoformat()
        }
        for chat in conversation_chats
    ]
    
    return {
        "messages": messages,
        "conversation_id": conversation_id
    }


@router.post("/counsellor/chat")
def counsellor_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Rate limit
    check_ai_rate_limit(user.id)
    
    # Get or create conversation ID
    if request.conversation_id:
        conversation_id = uuid.UUID(request.conversation_id)
    else:
        conversation_id = uuid.uuid4()
    
    # Get user context
    context = get_user_context(db, user)
    
    # Check if this is a new conversation (no messages yet)
    existing_chats = (
        db.query(AICounsellorChat)
        .filter(AICounsellorChat.user_id == user.id)
        .count()
    )
    
    # Save user message
    user_chat = AICounsellorChat(
        user_id=user.id,
        conversation_id=conversation_id,
        role="user",
        content=request.message
    )
    db.add(user_chat)
    
    # If new conversation, generate and save greeting first
    if existing_chats == 0:
        greeting = get_greeting_message(context["profile"])
        greeting_chat = AICounsellorChat(
            user_id=user.id,
            conversation_id=conversation_id,
            role="assistant",
            content=greeting
        )
        db.add(greeting_chat)
        db.commit()
        
        return {
            "response": greeting,
            "conversation_id": str(conversation_id),
            "is_new_conversation": True
        }
    
    db.commit()
    
    # Build system prompt
    system_prompt = build_system_prompt(
        context["profile"],
        context["locked_data"],
        context["shortlisted"]
    )
    
    # Get chat history for context
    history = (
        db.query(AICounsellorChat)
        .filter(
            AICounsellorChat.user_id == user.id,
            AICounsellorChat.conversation_id == conversation_id
        )
        .order_by(AICounsellorChat.created_at.asc())
        .limit(10)  # Last 10 messages
        .all()
    )
    
    # Build messages for API
    messages = [{"role": "system", "content": system_prompt}]
    for chat in history:
        messages.append({"role": chat.role, "content": chat.content})
    
    # Call OpenRouter
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "openai/gpt-oss-20b:free",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500,
    }

    try:
        resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="AI provider error")
        data = resp.json()
        response_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Save AI response
        ai_chat = AICounsellorChat(
            user_id=user.id,
            conversation_id=conversation_id,
            role="assistant",
            content=response_text
        )
        db.add(ai_chat)
        db.commit()

        return {
            "response": response_text,
            "conversation_id": str(conversation_id),
            "is_new_conversation": False
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI request failed: {e}")


@router.post("/counsellor/new-conversation")
def start_new_conversation(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Start a new conversation with a fresh greeting"""
    # Get user context
    context = get_user_context(db, user)
    
    # Generate new conversation ID
    conversation_id = uuid.uuid4()
    
    # Generate and save greeting
    greeting = get_greeting_message(context["profile"])
    greeting_chat = AICounsellorChat(
        user_id=user.id,
        conversation_id=conversation_id,
        role="assistant",
        content=greeting
    )
    db.add(greeting_chat)
    db.commit()
    
    return {
        "conversation_id": str(conversation_id),
        "greeting": greeting
    }

