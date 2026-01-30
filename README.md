# 🎓 AI Counsellor

**AI Counsellor** is a full-stack, AI-powered university admission counselling platform that guides students through the entire study-abroad journey — from profile building to university discovery, shortlisting, and application tracking.

Unlike traditional admission portals that rely on static filters and rankings, AI Counsellor follows a **guided, stage-based counselling approach**, helping students make confident and informed decisions based on their academic profile, goals, budget, and readiness.

---

## ✨ Why AI Counsellor?

Students often feel overwhelmed by thousands of universities, unclear eligibility criteria, and scattered deadlines.  
AI Counsellor solves this by combining **intelligent AI reasoning**, **structured onboarding**, and **task-driven progress tracking** — all in one platform.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure Login / Signup flow
- OTP-based verification
- JWT-based authentication

### 🧑‍🎓 Student Profile & Onboarding
- Guided onboarding experience
- Academic background, preferences, and budget capture
- Profile completeness tracking

### 🤖 AI-Powered University Discovery
- Personalized university recommendations
- Budget-aware and profile-aware suggestions
- AI reasoning instead of static filters

### ⭐ Shortlisting & Applications
- One-click university shortlisting
- Application progress tracking
- Centralized application dashboard

### 💬 AI Counsellor Chat
- 24/7 AI assistant for admission-related queries
- Guidance on eligibility, timelines, and next steps
- Powered by OpenRouter and Gemini AI models

### ✅ Task & Deadline Management
- Application task tracking
- Deadline monitoring
- Progress visibility throughout the admission journey

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router v7
- TanStack Query
- Zod + React Hook Form

### Backend
- FastAPI
- PostgreSQL + SQLAlchemy
- JWT Authentication
- OpenRouter AI Integration
- Gemini AI (fallback)

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

---

### 🔧 Frontend Setup

```bash
cd ai-counsellor
npm install
npm run dev
```

---

### 🔧 Backend Setup

```bash
cd app
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `/app` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_counsellor
SECRET_KEY=your-secret-key
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key
```

---

## 🗂️ Project Structure

```
ai-counsellor/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── package.json
└── requirements.txt
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login using OTP |
| POST | /onboarding/complete | Complete student onboarding |
| GET  | /discover | AI-based university recommendations |
| POST | /shortlist | Add university to shortlist |
| GET  | /applications | Fetch application status |
| POST | /ai-counsellor | Chat with the AI counsellor |

---

## 🧪 Project Status

- Core functionality implemented
- Actively evolving with improved AI reasoning
- Designed for scalability and future enhancements

---

## 📄 License

MIT License
