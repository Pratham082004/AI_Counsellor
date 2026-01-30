"""
Gemini AI Service for AI Counsellor Application

This module provides AI capabilities using Google's Gemini API directly.
It serves as an alternative to the OpenRouter-based ai_service.py.

Features:
- Basic text generation with Gemini
- Chat-style Q&A with system prompts
- University recommendations with JSON output
- JSON parsing helpers
"""

import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# ======================================================
# 🔑 Gemini API Config
# ======================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

# Default model configuration
DEFAULT_MODEL = "gemini-2.5-flash"
QUALITY_MODEL = "gemini-1.5-pro"

# Generation configuration
GENERATION_CONFIG = {
    "temperature": 0.2,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 8192,
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


# ======================================================
# 🧠 Lenient JSON extractor
# ======================================================
def extract_json_array(text: str) -> List[Dict]:
    """
    Safely extracts a JSON array from AI output.
    Never throws.
    """
    try:
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
    except Exception:
        pass

    return []


def extract_json_object(text: str) -> Optional[Dict]:
    """
    Safely extracts a JSON object from AI output.
    Never throws.
    """
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
    except Exception:
        pass

    return None


# ======================================================
# 🤖 Gemini Model Initialization
# ======================================================
def get_gemini_model(model_name: str = DEFAULT_MODEL):
    """
    Get a configured Gemini model instance.
    
    Args:
        model_name: The Gemini model to use (gemini-1.5-flash or gemini-1.5-pro)
    
    Returns:
        Configured GenerativeModel instance
    """
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config=GENERATION_CONFIG,
        safety_settings=SAFETY_SETTINGS,
    )


def start_chat_session(model_name: str = DEFAULT_MODEL):
    """
    Start a new chat session with Gemini.
    
    Args:
        model_name: The Gemini model to use
    
    Returns:
        ChatSession instance for ongoing conversations
    """
    model = get_gemini_model(model_name)
    return model.start_chat(history=[])


# ======================================================
# 🚀 Basic Text Generation
# ======================================================
def generate_content(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Generate content using Gemini with optional system prompt.
    
    Args:
        prompt: The user prompt to send
        system_prompt: Optional system-level instructions
        model: Gemini model to use
    
    Returns:
        Generated text response
    """
    try:
        model_instance = get_gemini_model(model)
        
        if system_prompt:
            response = model_instance.generate_content([
                {"role": "user", "parts": [system_prompt]},
                {"role": "user", "parts": [prompt]},
            ])
        else:
            response = model_instance.generate_content(prompt)
        
        print(f"🔵 Gemini ({model}) response generated successfully")
        return response.text
    
    except Exception as e:
        print(f"❌ Gemini generation error: {e}")
        return ""


# ======================================================
# 💬 Chat-style Q&A with Gemini
# ======================================================
def ask_gemini(
    prompt: str,
    system_prompt: str = "You are a helpful AI assistant.",
    model: str = DEFAULT_MODEL,
    chat_history: Optional[List[Dict]] = None,
) -> str:
    """
    Ask Gemini a question with optional system prompt and chat history.
    
    Args:
        prompt: The user question
        system_prompt: System instructions for the AI persona
        model: Gemini model to use
        chat_history: Optional list of previous messages
    
    Returns:
        AI response text
    """
    try:
        model_instance = get_gemini_model(model)
        
        # Build content parts
        content_parts = []
        
        if system_prompt:
            content_parts.append({"role": "model", "parts": [system_prompt]})
        
        if chat_history:
            for msg in chat_history:
                role = "model" if msg.get("role") == "assistant" else "user"
                content_parts.append({"role": role, "parts": [msg.get("content", "")]})
        
        content_parts.append({"role": "user", "parts": [prompt]})
        
        response = model_instance.generate_content(content_parts)
        
        print(f"🔵 Gemini chat response generated")
        return response.text
    
    except Exception as e:
        print(f"❌ Gemini chat error: {e}")
        return ""


# ======================================================
# 🎓 University Recommendations with Gemini
# ======================================================
def get_gemini_recommendations(
    budget_range: Optional[str] = None,
    target_country: Optional[str] = None,
    target_field: Optional[str] = None,
    target_degree: Optional[str] = "Bachelors",
    major: Optional[str] = None,
    model: str = DEFAULT_MODEL,
) -> List[Dict]:
    """
    Generate personalized university recommendations using Gemini.
    
    Args:
        budget_range: User's budget range (e.g., "20000-50000" USD)
        target_country: Country the user wants to study in
        target_field: Field of study/major
        target_degree: Degree type (Bachelors, Masters, PhD)
        major: User's major/field of study
        model: Gemini model to use
    
    Returns:
        List of university recommendations with structured data
    """
    # Build detailed prompt based on user preferences
    prompt_parts = [
        "You are an expert international education counsellor.",
        "Recommend 12 universities for a student with the following profile:",
    ]
    
    if budget_range:
        prompt_parts.append(f"- Budget: {budget_range} USD")
    if target_country:
        prompt_parts.append(f"- Target Country: {target_country}")
    if target_field:
        prompt_parts.append(f"- Field of Study: {target_field}")
    if major:
        prompt_parts.append(f"- Major: {major}")
    if target_degree:
        prompt_parts.append(f"- Degree: {target_degree}")
    
    prompt_parts.extend([
        "",
        "For each university, provide:",
        "- name: Full university name",
        "- country: Country location",
        "- degree: The degree type",
        "- field: Field of study",
        "- estimated_tuition: Approximate annual tuition in USD (number)",
        "- difficulty: Competition level (LOW, MEDIUM, or HIGH)",
        "",
        "Consider that:",
        "- Higher tuition usually means more competitive universities",
        "- Match universities to the user's budget range",
        "- Consider the target country and field preferences",
        "- Provide a mix of difficulty levels",
    ])
    
    prompt = "\n".join(prompt_parts)
    
    # Create the full prompt with strict JSON output requirements
    full_prompt = (
        prompt
        + "\n\nSTRICT RULES:\n"
        + "- Respond ONLY with a valid JSON array\n"
        + "- Return EXACTLY 12 universities\n"
        + "- No markdown formatting\n"
        + "- No explanations outside JSON\n"
        + "- estimated_tuition must be a number\n"
        + "- difficulty must be LOW, MEDIUM, or HIGH\n"
    )
    
    try:
        model_instance = get_gemini_model(model)
        
        response = model_instance.generate_content(full_prompt)
        text = response.text
        
        print("🔵 Gemini raw text:\n", text)
        
        universities = extract_json_array(text)
        
        # Final strict cleanup
        clean = []
        for uni in universities:
            if (
                isinstance(uni, dict)
                and "name" in uni
                and "country" in uni
            ):
                clean.append(uni)
        
        print(f"🔵 Gemini extracted {len(clean)} valid universities")
        return clean[:12]
    
    except Exception as e:
        print(f"❌ Gemini recommendations error: {e}")
        return []


# ======================================================
# 📋 Helper Functions for AI Counsellor Chat
# ======================================================
def gemini_counsellor_chat(
    user_message: str,
    conversation_history: Optional[List[Dict]] = None,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Handle AI Counsellor chat interactions with Gemini.
    
    Args:
        user_message: The user's message
        conversation_history: Previous chat messages
        model: Gemini model to use
    
    Returns:
        AI counsellor response
    """
    system_prompt = """You are an expert international education counsellor AI assistant.
Your role is to help students with:
- University selection and applications
- Study abroad guidance
- Career counselling for international students
- Application timeline and requirements
- Scholarship and funding information

Be helpful, empathetic, and provide accurate information.
If you don't know something, admit it and suggest consulting official sources."""

    return ask_gemini(
        prompt=user_message,
        system_prompt=system_prompt,
        model=model,
        chat_history=conversation_history,
    )


# ======================================================
# 🧪 Test Function
# ======================================================
def test_gemini_service():
    """Quick test of Gemini service functionality."""
    print("Testing Gemini Service...")
    
    # Test basic generation
    print("\n1. Testing basic generation...")
    response = generate_content("Say hello in 3 languages", model=DEFAULT_MODEL)
    print(f"Response: {response}")
    
    # Test university recommendations
    print("\n2. Testing university recommendations...")
    unis = get_gemini_recommendations(
        budget_range="20000-50000",
        target_country="USA",
        target_field="Computer Science",
        target_degree="Bachelors",
        major="Computer Science",
    )
    print(f"Found {len(unis)} universities")
    if unis:
        print(f"First university: {unis[0].get('name', 'N/A')}")
    
    print("\n✅ Gemini service test complete!")


if __name__ == "__main__":
    test_gemini_service()

