"""
main.py
───────
FastAPI application entry point.
Run with: uvicorn app.main:app --port 8001 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="AI Symptom Predictor — Telemedicine",
    description=(
        "Multilingual AI-powered symptom analysis service. "
        "Accepts free-text symptom descriptions in any language, "
        "extracts symptoms via Groq LLM, and predicts diseases using a trained ML ensemble."
    ),
    version="1.0.0",
)

# Allow calls from all frontend panels during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",   # backend
        "http://localhost:5001",   # backend alt
        "http://localhost:5173",   # before-login / login page
        "http://localhost:5174",   # user panel
        "http://localhost:5175",   # doctor panel (in case)
        "http://localhost:5176",   # admin panel (in case)
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)