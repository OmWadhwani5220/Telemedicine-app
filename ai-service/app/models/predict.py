"""
predict.py
──────────
Core prediction logic.

Takes a validated list of symptom names + patient profile,
builds the feature vector, runs the ensemble model,
and returns top-N predictions with confidence scores,
filtered through the clinical plausibility layer.
"""

import joblib
import numpy as np

from app.config import MODEL_PATH, LABEL_ENCODER_PATH, SYMPTOM_COLUMNS_PATH
from app.models.preprocessing import encode_symptoms
from app.utils.helpers import get_disease_description
from app.services.risk_rules import apply_all_rules

# ── Load artifacts once at startup ─────────────────────────────────────────
model           = joblib.load(MODEL_PATH)
label_encoder   = joblib.load(LABEL_ENCODER_PATH)
symptom_columns = joblib.load(SYMPTOM_COLUMNS_PATH)


def predict(
    symptoms: list[str],
    patient_profile: dict = None,
    top_n: int = 3,
) -> dict:
    """
    Run a prediction given a list of validated symptom names.

    Args:
        symptoms:        List of symptom strings (already validated against vocabulary)
        patient_profile: Dict of patient fields (age, gender, bmi, etc.)
        top_n:           Number of top predictions to return

    Returns:
        Dict with:
          predictions      — ranked list of clinically filtered disease predictions
          symptoms_matched — the symptoms that fed the model
          red_flags        — any red-flag symptoms detected
          filter_notes     — what was removed and why (for transparency)
    """
    if patient_profile is None:
        patient_profile = {}

    # ── Build feature vector ───────────────────────────────────────────────
    encoded = np.array([encode_symptoms(symptoms, symptom_columns)])

    # ── Run model — fetch more than top_n so filtering has room to work ────
    fetch_n     = min(top_n * 3, len(label_encoder.classes_))
    probs       = model.predict_proba(encoded)[0]
    top_indices = np.argsort(probs)[::-1][:fetch_n]

    # ── Build raw predictions before filtering ─────────────────────────────
    raw_predictions = []
    for rank, idx in enumerate(top_indices, start=1):
        disease_name = label_encoder.inverse_transform([idx])[0]
        confidence   = float(probs[idx])

        raw_predictions.append({
            "rank":           rank,
            "disease":        disease_name,
            "confidence":     round(confidence, 4),
            "confidence_pct": f"{confidence * 100:.1f}%",
            "description":    get_disease_description(disease_name),
            "risk_notes":     [],  # filled in by apply_all_rules
        })

    # ── Apply clinical plausibility filter + risk rules ────────────────────
    filtered_predictions, red_flags, filter_notes, symptom_warnings = apply_all_rules(
        predictions=raw_predictions,
        symptoms=symptoms,
        patient_profile=patient_profile,
    )

    # ── Re-rank after filtering and trim to top_n ──────────────────────────
    for i, pred in enumerate(filtered_predictions[:top_n], start=1):
        pred["rank"] = i

    final_predictions = filtered_predictions[:top_n]

    # ── Log what was filtered for transparency ─────────────────────────────
    if filter_notes:
        print("🔍 Clinical filter applied:")
        for note in filter_notes:
            print(f"   {note}")

    if symptom_warnings:
        print("⚠️  Symptom warnings:")
        for w in symptom_warnings:
            print(f"   {w}")

    return {
        "predictions":      final_predictions,
        "symptoms_matched": symptoms,
        "red_flags":        red_flags,
        "filter_notes":     filter_notes,
    }