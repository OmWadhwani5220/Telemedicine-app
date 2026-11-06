"""
routes.py
─────────
FastAPI route definitions.

Endpoints:
  POST /predict  — full prediction pipeline (LLM → model → risk rules → clinical filter)
  GET  /health   — service health check
  GET  /symptoms — list of all valid symptom names
"""

from fastapi import APIRouter, HTTPException

from app.api.schemas import PredictRequest, PredictResponse, HealthResponse
from app.services.llm_service import extract_symptoms_from_text
from app.services.symptom_mapper import validate_and_map, get_all_valid_symptoms
from app.models.predict import predict, label_encoder, symptom_columns

router = APIRouter()

DISCLAIMER = (
    "This tool is for informational purposes only and does not constitute "
    "medical advice. Always consult a qualified healthcare professional for "
    "diagnosis and treatment. In case of emergency, call your local emergency number."
)


# ── POST /predict ──────────────────────────────────────────────────────────
@router.post("/predict", response_model=PredictResponse)
async def predict_disease(request: PredictRequest):
    """
    Full prediction pipeline:
    1. Send symptom_text to Groq LLM → extract standardised symptom names
    2. Validate extracted symptoms against model vocabulary
    3. Run ensemble ML model → top-N disease predictions (fetches 3x for filter headroom)
    4. Apply clinical plausibility filter (gender / age / pregnancy / BMI)
    5. Apply risk escalation notes to surviving predictions
    6. Return structured response with filter transparency notes
    """

    # ── Step 1: LLM symptom extraction ────────────────────────────────────
    raw_symptoms = extract_symptoms_from_text(request.symptom_text)

    # ── Step 2: Validate against model vocabulary ──────────────────────────
    validated_symptoms = validate_and_map(raw_symptoms)

    if not validated_symptoms:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any recognisable symptoms from the provided text. "
                "Please describe your symptoms in more detail."
            ),
        )

    # ── Step 3–5: ML prediction + clinical filter + risk rules ────────────
    patient_profile = {
        "age":                    request.age,
        "gender":                 request.gender,
        "bmi":                    request.bmi,
        "has_chronic_disease":    request.has_chronic_disease,
        "chronic_disease_detail": request.chronic_disease_detail,
        "is_pregnant":            request.is_pregnant,
        "smoking_status":         request.smoking_status,
        "alcohol_use":            request.alcohol_use,
        "family_history":         request.family_history,
        "symptom_duration_days":  request.symptom_duration_days,
        "recent_travel":          request.recent_travel,
    }

    result = predict(
        symptoms=validated_symptoms,
        patient_profile=patient_profile,
        top_n=request.top_n,
    )

    # ── Step 6: Return response ────────────────────────────────────────────
    return PredictResponse(
        predictions=result["predictions"],
        symptoms_matched=result["symptoms_matched"],
        red_flags=result["red_flags"],
        filter_notes=result.get("filter_notes", []),
        disclaimer=DISCLAIMER,
    )


# ── GET /health ─────────────────────────────────────────────────────────────
@router.get("/health", response_model=HealthResponse)
def health():
    """Service health check — confirms model is loaded."""
    return HealthResponse(
        status="ok",
        model_loaded=True,
        symptom_count=len(symptom_columns),
        disease_count=len(label_encoder.classes_),
    )


# ── GET /symptoms ────────────────────────────────────────────────────────────
@router.get("/symptoms")
def list_symptoms():
    """Return the full list of symptom names the model understands."""
    return {
        "symptoms": get_all_valid_symptoms(),
        "count":    len(get_all_valid_symptoms()),
    }