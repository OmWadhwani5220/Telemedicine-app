"""
schemas.py
──────────
Pydantic models for request / response validation.
FastAPI uses these to auto-validate incoming JSON and
auto-document the API at /docs.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ── Request ────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    # What the user typed in the symptom text box (any language)
    symptom_text: str = Field(
        ...,
        description="Free-text symptom description in any language",
        example="मुझे बुखार है और पेशाब में जलन हो रही है",
    )

    # ── Patient profile (pulled from DB by Node.js, passed here) ──────────
    # Age in years — derived from dob in Node.js before calling this service
    age: Optional[int]   = Field(None, ge=0, le=120, description="Patient age in years")

    gender: Optional[str] = Field(
        None,
        description="Patient gender: 'Male', 'Female', 'Other', 'Prefer not to say'"
    )

    # BMI — Node.js computes this from height + weight before calling here
    bmi: Optional[float] = Field(None, ge=5.0, le=100.0, description="Body Mass Index")

    # Medical history
    has_chronic_disease:    Optional[bool] = Field(None)
    chronic_disease_detail: Optional[str]  = Field(None, description="e.g. 'Type 2 Diabetes, Hypertension'")
    is_pregnant:            Optional[bool] = Field(None)
    smoking_status:         Optional[str]  = Field(None, description="'never' | 'former' | 'current'")
    alcohol_use:            Optional[bool] = Field(None)
    family_history:         Optional[str]  = Field(None, description="e.g. 'Diabetes, Heart Disease'")

    # Contextual — asked at symptom-check time, not stored in profile
    symptom_duration_days: Optional[int]  = Field(None, ge=0, description="How many days symptoms present")
    recent_travel:         Optional[bool] = Field(None, description="Travelled internationally in last 30 days")

    # Number of top predictions to return (default 3)
    top_n: int = Field(default=3, ge=1, le=10)

    class Config:
        json_schema_extra = {
            "example": {
                "symptom_text": "I have fever, burning when I pee, and I feel very tired",
                "age": 28,
                "gender": "Female",
                "bmi": 22.5,
                "has_chronic_disease": False,
                "is_pregnant": False,
                "smoking_status": "never",
                "alcohol_use": False,
                "symptom_duration_days": 3,
                "recent_travel": False,
                "top_n": 3,
            }
        }


# ── Response ───────────────────────────────────────────────────────────────

class PredictionItem(BaseModel):
    rank:            int
    disease:         str
    confidence:      float
    confidence_pct:  str
    description:     str
    risk_notes:      list[str]


class PredictResponse(BaseModel):
    predictions:       list[PredictionItem]
    symptoms_matched:  list[str]    # the symptoms the LLM extracted
    red_flags:         list[str]    # any red-flag symptoms present
    filter_notes:      list[str]
    disclaimer:        str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    symptom_count: int
    disease_count: int