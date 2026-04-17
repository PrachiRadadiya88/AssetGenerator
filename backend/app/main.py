"""
main.py — FastAPI application entry point for Play Store Screenshot Asset Generator.

Run with: uvicorn app.main:app --reload --port 8000
"""

import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.assets import router as assets_router

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure output directories exist
GENERATED_DIR = BASE_DIR / "generated"
UPLOADS_DIR = BASE_DIR / "uploads"
GENERATED_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────

app = FastAPI(
    title="Play Store Screenshot Asset Generator",
    description="Generate high-quality Play Store screenshot assets using AI",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://assetgen.netlify.app",
        "https://plural-muster-treading.ngrok-free.dev",
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve generated images
app.mount("/generated", StaticFiles(directory=str(GENERATED_DIR)), name="generated")

# Include API routes
app.include_router(assets_router, prefix="/api", tags=["Assets"])


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Play Store Asset Generator",
        "gemini_key_set": bool(os.getenv("GEMINI_API_KEY")),
    }


@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("=" * 60)
    logger.info("Play Store Screenshot Asset Generator — Starting up")
    logger.info(f"Generated assets directory: {GENERATED_DIR}")
    logger.info(f"Uploads directory: {UPLOADS_DIR}")
    logger.info(f"Gemini API Key configured: {bool(os.getenv('GEMINI_API_KEY'))}")
    logger.info("=" * 60)
