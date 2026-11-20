
"""
routes.py
---------
FastAPI route definitions for TeleMed AI Service.

Endpoints:
    POST /predict  - AI symptom analysis and disease prediction
    GET  /health   - Service health check
    GET  /symptoms - List of supported symptoms
"""

from fastapi import APIRouter, HTTPException

from app.api.schemas import (
    PredictRequest,
    PredictResponse,
    HealthResponse,
)

from app.services.llm_service import extract_symptoms_from_text

from app.services.symptom_mapper import (
    validate_and_map,
    get_all_valid_symptoms,
)

from app.models.predict import predict


router = APIRouter()


DISCLAIMER = (
    "This tool is for informational purposes only and does not "
    "constitute medical advice. Always consult a qualified "
    "healthcare professional for diagnosis and treatment. "
    "In case of emergency, call your local emergency number."
)


# ============================================================
# POST /predict
# ============================================================

@router.post("/predict", response_model=PredictResponse)
async def predict_disease(request: PredictRequest):
    """
    Full AI prediction pipeline:

    1. Extract symptoms using Groq LLM.
    2. Validate symptoms against the trained model vocabulary.
    3. Generate disease predictions using the ML model.
    4. Apply clinical plausibility filters and risk rules.
    5. Return predictions with confidence scores.
    """

    # --------------------------------------------------------
    # STEP 1: Extract symptoms using Groq
    # --------------------------------------------------------

    raw_symptoms = extract_symptoms_from_text(
        request.symptom_text
    )

    print(
        f"[Groq] Extracted {len(raw_symptoms)} symptoms",
        flush=True
    )

    # --------------------------------------------------------
    # STEP 2: Validate symptoms against model vocabulary
    # --------------------------------------------------------

    validated_symptoms = validate_and_map(
        raw_symptoms
    )

    print(
        f"[Vocabulary] Matched {len(validated_symptoms)} symptoms",
        flush=True
    )

    # If no valid symptoms are found
    if not validated_symptoms:

        print(
            "[Prediction] No recognizable symptoms found",
            flush=True
        )

        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any recognisable symptoms "
                "from the provided text. Please describe "
                "your symptoms in more detail."
            ),
        )

    # --------------------------------------------------------
    # STEP 3: Prepare patient profile
    # --------------------------------------------------------

    patient_profile = {
        "age": request.age,
        "gender": request.gender,
        "bmi": request.bmi,
        "has_chronic_disease": request.has_chronic_disease,
        "chronic_disease_detail": request.chronic_disease_detail,
        "is_pregnant": request.is_pregnant,
        "smoking_status": request.smoking_status,
        "alcohol_use": request.alcohol_use,
        "family_history": request.family_history,
        "symptom_duration_days": request.symptom_duration_days,
        "recent_travel": request.recent_travel,
    }

    # --------------------------------------------------------
    # STEP 4: Run ML prediction and clinical filters
    # --------------------------------------------------------

    try:
        result = predict(
            symptoms=validated_symptoms,
            patient_profile=patient_profile,
            top_n=request.top_n,
        )

    except Exception as e:

        print(
            f"[Prediction Error] {type(e).__name__}: {e}",
            flush=True
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The AI prediction service encountered "
                "an internal error. Please try again later."
            ),
        ) from e

    # --------------------------------------------------------
    # STEP 5: Return prediction response
    # --------------------------------------------------------

    print(
        f"[Prediction] Completed successfully. "
        f"Predictions: {len(result['predictions'])}",
        flush=True
    )

    return PredictResponse(
        predictions=result["predictions"],
        symptoms_matched=result["symptoms_matched"],
        red_flags=result["red_flags"],
        filter_notes=result.get("filter_notes", []),
        disclaimer=DISCLAIMER,
    )


# ============================================================
# GET /health
# ============================================================

@router.get("/health", response_model=HealthResponse)
def health():
    """
    Basic API health check.

    Does not load the ML model, helping keep
    health checks lightweight on Render.
    """

    return HealthResponse(
        status="ok",
        model_loaded=False,
        symptom_count=0,
        disease_count=0,
    )


# ============================================================
# GET /symptoms
# ============================================================

@router.get("/symptoms")
def list_symptoms():
    """
    Return all symptom names supported by the trained model.
    """

    symptoms = get_all_valid_symptoms()

    return {
        "symptoms": symptoms,
        "count": len(symptoms),
    }
