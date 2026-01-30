import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict, Optional

load_dotenv()

# ======================================================
# 🔑 OpenRouter API Config
# ======================================================
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY is not set in .env")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://ai-counsellor.app",
    "X-Title": "AI Counsellor App",
}


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


# ======================================================
# 🚀 Ask AI via OpenRouter with Reasoning Support
# ======================================================
def ask_ai(
    prompt: str,
    model: str = "google/gemma-3-27b-it:free",
    max_tokens: int = 800,
    temperature: float = 0.2,
    include_reasoning: bool = False,
) -> List[Dict]:
    """
    Send a prompt to OpenRouter and get AI response with optional reasoning support.
    
    Args:
        prompt: The user prompt to send
        model: OpenRouter model to use
        max_tokens: Maximum tokens in response
        temperature: Temperature for response generation
        include_reasoning: Whether to include reasoning in the response
    
    Returns:
        List of dictionaries parsed from AI response
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert international education counsellor. "
                "You MUST follow the user instructions strictly."
            ),
        },
        {
            "role": "user",
            "content": (
                prompt
                + "\n\nSTRICT RULES:\n"
                + "- Respond ONLY with a valid JSON array\n"
                + "- Return EXACTLY 6 universities\n"
                + "- No markdown\n"
                + "- No explanations\n"
                + "- Required fields: name, country, degree, field, estimated_tuition, difficulty\n"
            ),
        },
    ]

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    # Add reasoning support if requested
    if include_reasoning:
        payload["reasoning"] = {"enabled": True}

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=HEADERS,
            json=payload,
            timeout=30,
        )

        print("🔵 OpenRouter status:", response.status_code)

        if response.status_code != 200:
            print("❌ OpenRouter error:", response.text)
            return []

        data = response.json()

        # Extract reasoning details if present
        if include_reasoning:
            reasoning_details = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("reasoning_details", {})
            )
            print("🔵 Reasoning details:", reasoning_details)

        text = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        print("🔵 AI raw text:\n", text)

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

        return clean[:10]

    except Exception as e:
        print("❌ OpenRouter exception:", e)
        return []


# ======================================================
# 🎓 Get University Recommendations
# ======================================================
def get_university_recommendations(
    budget_range: Optional[str] = None,
    target_country: Optional[str] = None,
    target_field: Optional[str] = None,
    target_degree: Optional[str] = "Bachelors",
    major: Optional[str] = None,
) -> List[Dict]:
    """
    Generate personalized university recommendations based on user profile.
    
    Args:
        budget_range: User's budget range (e.g., "20000-50000")
        target_country: Country the user wants to study in
        target_field: Field of study/major
        target_degree: Degree type (Bachelors, Masters, PhD)
        major: User's major/field of study
    
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
        "- Higher tuition usually means more competitive/universities",
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
    
    return ask_ai(full_prompt)

