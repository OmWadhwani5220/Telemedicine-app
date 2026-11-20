"""
main.py
───────
FastAPI application entry point.
Run with: uvicorn app.main:app --port 8001 --reload
"""

"""
main.py
FastAPI application entry point for TeleMed AI Service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="AI Symptom Predictor — Telemedicine",
    description=(
        "Multilingual AI-powered symptom analysis service. "
        "Accepts free-text symptom descriptions in any language, "
        "extracts symptoms via Groq LLM, and predicts diseases "
        "using a trained ML ensemble."
    ),
    version="1.0.0",
)

# CORS configuration — only one middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://telemed-user-panel.vercel.app",
        "https://telemedicine-app-six-beryl.vercel.app",
        "https://telemed-doctor-panel.vercel.app",
        "https://telemed-admin-panel.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register API routes only once
app.include_router(router)
