# AI Counsellor

An AI-powered university admission counselling platform built with React, TypeScript, and FastAPI.

## Features

- **User Authentication** - Login/Signup with OTP verification
- **Profile Management** - Complete onboarding flow for student profiles
- **AI University Discovery** - Get personalized university recommendations
- **Shortlist & Apply** - Track your application journey
- **AI Counsellor Chat** - 24/7 AI assistance for admission queries
- **Task Management** - Track application deadlines and tasks

## Tech Stack

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

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

### Frontend Setup
```bash
cd ai-counsellor
npm install
npm run dev
```

### Backend Setup
```bash
cd app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

Create `.env` file in `/app` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_counsellor
SECRET_KEY=your-secret-key
OPENROUTER_API_KEY=your-api-key
GEMINI_API_KEY=your-gemini-key
```

## Project Structure

```
ai-counsellor/
├── app/                    # FastAPI Backend
│   ├── api/               # API routes
│   ├── core/              # Core utilities
│   ├── db/                # Database models & config
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   └── main.py            # Entry point
├── src/                    # React Frontend
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── package.json
└── requirements.txt
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login with OTP |
| POST | /onboarding/complete | Complete user onboarding |
| GET | /discover | Get AI university recommendations |
| POST | /shortlist | Add to shortlist |
| GET | /applications | Get applications |
| POST | /ai-counsellor | Chat with AI counsellor |

## License

MIT

