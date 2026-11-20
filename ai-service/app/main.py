
"""
TeleMed AI Service - FastAPI Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from app.api.routes import router


# Initialize FastAPI
app = FastAPI(
    title="TeleMed AI Symptom Predictor",
    description="AI-powered symptom analysis service",
    version="1.0.1",
)


# Allowed frontend origins
ALLOWED_ORIGINS = [
    "https://telemed-user-panel.vercel.app",
    "https://telemedicine-app-six-beryl.vercel.app",
    "https://telemed-doctor-panel.vercel.app",
    "https://telemed-admin-panel.vercel.app",
    "https://telemedicine-app-mr3o.onrender.com",
    "https://telemed-video-server.onrender.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
]


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Register API routes
app.include_router(router)


# Root endpoint
@app.get("/")
def root():
    return {
        "service": "TeleMed AI Service",
        "status": "running",
        "version": "1.0.1",
    }


# CORS verification endpoint
@app.get("/cors-check")
def cors_check():
    return {
        "version": "1.0.1",
        "user_panel_allowed": (
            "https://telemed-user-panel.vercel.app"
            in ALLOWED_ORIGINS
        ),
    }

@app.get("/model-check")
def model_check():
    from app.models.predict import load_artifacts

    try:
        model, encoder, columns = load_artifacts()

        return {
            "status": "loaded",
            "model_type": type(model).__name__,
            "disease_count": len(encoder.classes_),
            "symptom_count": len(columns),
        }
    except Exception:
        import logging
        logging.exception("Model loading failed")
        raise HTTPException(
            status_code=503,
            detail="Model loading failed. Check Render logs."
        )