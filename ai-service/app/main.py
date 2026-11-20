
"""
main.py
-------
TeleMed AI Symptom Prediction Service

Framework: FastAPI

Endpoints:
    POST /predict  - AI-powered symptom analysis
    GET  /health   - Service health check
    GET  /symptoms - Supported symptom vocabulary

Local:
    uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

Production:
    uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


# ============================================================
# 1. Initialize FastAPI Application
# ============================================================

app = FastAPI(
    title="TeleMed AI Symptom Predictor",
    description=(
        "Multilingual AI-powered symptom analysis service. "
        "Accepts patient symptom descriptions in multiple languages, "
        "extracts symptoms using Groq LLM, and predicts possible "
        "diseases using a trained machine learning ensemble."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ============================================================
# 2. Configure CORS
# ============================================================

ALLOWED_ORIGINS = [
    # Production frontend applications
    "https://telemed-user-panel.vercel.app",
    "https://telemedicine-app-six-beryl.vercel.app",
    "https://telemed-doctor-panel.vercel.app",
    "https://telemed-admin-panel.vercel.app",

    # Local development
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ============================================================
# 3. Register API Routes
# ============================================================

app.include_router(router)


# ============================================================
# 4. Root Endpoint
# ============================================================

@app.get("/", tags=["General"])
def root():
    """
    Basic service information.
    """
    return {
        "service": "TeleMed AI Symptom Predictor",
        "status": "running",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_endpoint": "/health",
        "prediction_endpoint": "/predict",
    }
