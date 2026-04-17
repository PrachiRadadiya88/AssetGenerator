# Play Store Screenshot Asset Generator

Full-stack web application that generates professional Play Store screenshot assets using AI.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS v3
- **Backend**: Python FastAPI + Gemini AI API + Pillow

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Open the App

Visit **http://localhost:5173** in your browser.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ |

Get your key at: https://aistudio.google.com/apikey

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-assets` | Generate initial batch (2 assets) |
| `POST` | `/api/add-asset` | Generate one more unique asset |
| `GET` | `/api/download-all/{session_id}` | Download all as ZIP |
| `GET` | `/health` | Health check |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── prompts/
│   │   │   └── prompts.py       # All AI prompts (single source of truth)
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── routes/
│   │   │   └── assets.py        # API endpoints
│   │   └── services/
│   │       ├── gemini_service.py # Gemini API integration
│   │       └── image_service.py  # Image composition (Pillow)
│   ├── generated/               # Output images
│   ├── uploads/                 # Uploaded screenshots
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API calls
│   │   ├── hooks/               # Custom hooks
│   │   ├── App.jsx
│   │   └── index.css            # Global styles + Tailwind
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Routing | React Router v7 |
| Backend Framework | FastAPI |
| AI | Google Gemini 2.0 Flash |
| Image Processing | Pillow |
| Validation | Pydantic |
