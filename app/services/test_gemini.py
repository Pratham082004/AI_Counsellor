#!/usr/bin/env python3
"""
Test script for Gemini Service

Run this script to test the Gemini API integration.
Make sure to set GEMINI_API_KEY in your .env file first.

Usage:
    python test_gemini.py
"""

import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.gemini_service import (
    generate_content,
    ask_gemini,
    get_gemini_recommendations,
    gemini_counsellor_chat,
)


def print_section(title: str):
    """Print a section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_basic_generation():
    """Test basic text generation with Gemini."""
    print_section("Test 1: Basic Text Generation")
    
    prompt = "Say hello in 5 different languages"
    print(f"Prompt: {prompt}")
    
    response = generate_content(prompt)
    
    print(f"\nResponse:\n{response}")
    return bool(response.strip())


def test_system_prompt():
    """Test generation with system prompt."""
    print_section("Test 2: Generation with System Prompt")
    
    prompt = "What are the top 3 programming languages in 2024?"
    system_prompt = "You are a tech expert from Silicon Valley. Be enthusiastic and detailed."
    
    print(f"Prompt: {prompt}")
    print(f"System: {system_prompt}")
    
    response = generate_content(prompt, system_prompt=system_prompt)
    
    print(f"\nResponse:\n{response}")
    return bool(response.strip())


def test_chat_qa():
    """Test chat-style Q&A."""
    print_section("Test 3: Chat Q&A")
    
    questions = [
        "What is machine learning?",
        "How does it differ from AI?",
        "Can you give me a simple example?",
    ]
    
    for i, question in enumerate(questions, 1):
        print(f"\nQ{i}: {question}")
        response = ask_gemini(
            question,
            system_prompt="You are a helpful programming tutor. Keep answers concise."
        )
        print(f"A{i}: {response}")
    
    return True


def test_university_recommendations():
    """Test university recommendation generation."""
    print_section("Test 4: University Recommendations")
    
    print("Generating recommendations for a student seeking:")
    print("  - Budget: $20,000-50,000 USD")
    print("  - Country: USA")
    print("  - Field: Computer Science")
    print("  - Degree: Bachelors")
    
    universities = get_gemini_recommendations(
        budget_range="20000-50000",
        target_country="USA",
        target_field="Computer Science",
        target_degree="Bachelors",
        major="Computer Science",
    )
    
    print(f"\nFound {len(universities)} universities:")
    
    for i, uni in enumerate(universities[:5], 1):  # Show first 5
        print(f"\n{i}. {uni.get('name', 'N/A')}")
        print(f"   Country: {uni.get('country', 'N/A')}")
        print(f"   Field: {uni.get('field', 'N/A')}")
        print(f"   Tuition: ${uni.get('estimated_tuition', 'N/A'):,} USD/year" 
              if isinstance(uni.get('estimated_tuition'), int) 
              else f"   Tuition: {uni.get('estimated_tuition', 'N/A')}")
        print(f"   Difficulty: {uni.get('difficulty', 'N/A')}")
    
    return len(universities) > 0


def test_counsellor_chat():
    """Test AI Counsellor chat functionality."""
    print_section("Test 5: AI Counsellor Chat")
    
    messages = [
        "I want to study abroad but I'm confused about which country to choose.",
        "What are the requirements for MS in USA?",
        "How much does it typically cost?",
    ]
    
    conversation_history = []
    
    for i, message in enumerate(messages, 1):
        print(f"\nUser: {message}")
        response = gemini_counsellor_chat(
            user_message=message,
            conversation_history=conversation_history,
        )
        print(f"Counsellor: {response}")
        
        # Add to history
        conversation_history.append({"role": "user", "content": message})
        conversation_history.append({"role": "assistant", "content": response})
    
    return True


def check_api_key():
    """Check if Gemini API key is set."""
    print_section("Checking API Configuration")
    
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GEMINI_API_KEY is not set in .env file!")
        print("\nTo fix this:")
        print("1. Get your API key from https://aistudio.google.com/app/apikey")
        print("2. Add it to your .env file:")
        print("   GEMINI_API_KEY=your_api_key_here")
        return False
    
    print(f"✅ GEMINI_API_KEY is configured")
    print(f"   Key preview: {api_key[:10]}...{api_key[-5:]}")
    return True


def main():
    """Run all tests."""
    print("=" * 60)
    print("  Gemini Service Test Suite")
    print("=" * 60)
    
    # Check API key first
    if not check_api_key():
        print("\n❌ Please set your GEMINI_API_KEY and try again.")
        sys.exit(1)
    
    results = []
    
    # Run tests
    try:
        results.append(("Basic Generation", test_basic_generation()))
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        results.append(("Basic Generation", False))
    
    try:
        results.append(("System Prompt", test_system_prompt()))
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        results.append(("System Prompt", False))
    
    try:
        results.append(("Chat Q&A", test_chat_qa()))
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        results.append(("Chat Q&A", False))
    
    try:
        results.append(("University Recommendations", test_university_recommendations()))
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        results.append(("University Recommendations", False))
    
    try:
        results.append(("Counsellor Chat", test_counsellor_chat()))
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        results.append(("Counsellor Chat", False))
    
    # Print summary
    print_section("Test Results Summary")
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed} passed, {failed} failed out of {len(results)} tests")
    
    if failed > 0:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed! Gemini service is working correctly.")
        sys.exit(0)


if __name__ == "__main__":
    main()

