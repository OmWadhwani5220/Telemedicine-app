
"""
TeleMed AI Service - FastAPI Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


app = FastAPI(
    title="TeleMed AI Symptom Predictor",
    description="AI-powered symptom analysis service",
    version="1.0.0",
)


ALLOWED_ORIGINS = [
    "https://telemed-user-panel.vercel.app",
    "https://telemedicine-app-six-beryl.vercel.app",
    "https://telemed-doctor-panel.vercel.app",
    "https://telemed-admin-panel.vercel.app",
    "https://telemedicine-app-mr3o.onrender.com",
    "https://telemed-video-server.onrender.com",
]


# Apply CORS as the outermost ASGI middleware.
# This also adds CORS headers to error responses
# generated inside the application.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "TeleMed AI Service",
        "status": "running",
    }
