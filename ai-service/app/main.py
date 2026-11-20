
"""
TeleMed AI Service - FastAPI Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


app = FastAPI(
    title="TeleMed AI Symptom Predictor",
    description="AI-powered symptom analysis service",
    version="1.0.1",
)


ALLOWED_ORIGINS = [
    # Vercel Frontends
    "https://telemed-user-panel.vercel.app",
    "https://telemedicine-app-six-beryl.vercel.app",
    "https://telemed-doctor-panel.vercel.app",
    "https://telemed-admin-panel.vercel.app",

    # Render Services
    "https://telemedicine-app-mr3o.onrender.com",
    "https://telemed-video-server.onrender.com",
    "htt://telemed-ai-service.onrender.com",

    # Local Development
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


app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "TeleMed AI Service",
        "status": "running",
        "version": "1.0.1",
    }


@app.get("/cors-check")
def cors_check():
    return {
        "version": "1.0.1",
        "user_panel_allowed": (
            "https://telemed-user-panel.vercel.app"
            in ALLOWED_ORIGINS
        ),
    }

@app.on_event("startup")
def warm_up():
    from app.models.predict import load_artifacts
    load_artifacts()
    print("✅ Model artifacts loaded")

    @app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"service": "TeleMed AI Service", "status": "running", "version": "1.0.1"}