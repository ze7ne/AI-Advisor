# Finance Portfolio

A personal finance management app with an AI-powered advisor.

**Stack:** FastAPI (Python) + Next.js 14 (TypeScript)

---

## Features

- Dashboard with financial overview
- Expense tracking
- Savings goals
- AI financial advisor (powered by Google Gemini)
- User profile management

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd Project1
```

### 2. Configure environment variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./finance.db
```

---

## Running the project

### Option A — One command (recommended)

```bash
chmod +x start.sh
./start.sh
```

This will:
- Create a Python virtual environment and install backend dependencies
- Install frontend dependencies
- Start both servers

### Option B — Manual

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

---

## URLs

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |

---

## Project Structure

```
Project1/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # DB connection (SQLite)
│   ├── requirements.txt
│   ├── .env              # API keys (do not commit)
│   └── routers/
│       ├── profile.py
│       ├── expenses.py
│       ├── goals.py
│       ├── advisor.py    # Gemini AI integration
│       └── dashboard.py
├── frontend/             # Next.js app
├── start.sh              # One-command startup script
└── README.md
```
