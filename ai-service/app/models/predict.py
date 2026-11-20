"""
predict.py — core prediction logic.
Artifacts (model, label encoder, symptom columns) are downloaded from
Hugging Face on first use and cached.
"""

import os
from functools import lru_cache

import joblib
import numpy as np
from huggingface_hub import hf_hub_download

from app.models.preprocessing import encode_symptoms
from app.utils.helpers import get_disease_description
from app.services.risk_rules import apply_all_rules


@lru_cache(maxsize=1)
def load_artifacts():
    repo = os.environ["HF_MODEL_REPO"]
    token = os.getenv("HF_TOKEN")

    def fetch(name):
        return hf_hub_download(repo_id=repo, filename=name, token=token)

    model = joblib.load(fetch("model.pkl"))
    label_encoder = joblib.load(fetch("label_encoder.pkl"))
    symptom_columns = joblib.load(fetch("symptom_columns.pkl"))
    return model, label_encoder, symptom_columns


def predict(symptoms: list[str], patient_profile: dict = None, top_n: int = 3) -> dict:
    """
    Run a prediction for a list of validated symptom names.
    Returns predictions, symptoms_matched, red_flags and filter_notes.
    """
    model, label_encoder, symptom_columns = load_artifacts()

    if patient_profile is None:
        patient_profile = {}

    encoded = np.array([encode_symptoms(symptoms, symptom_columns)])

    fetch_n = min(top_n * 3, len(label_encoder.classes_))
    probs = model.predict_proba(encoded)[0]
    top_indices = np.argsort(probs)[::-1][:fetch_n]

    raw_predictions = []
    for rank, idx in enumerate(top_indices, start=1):
        disease_name = label_encoder.inverse_transform([idx])[0]
        confidence = float(probs[idx])
        raw_predictions.append({
            "rank": rank,
            "disease": disease_name,
            "confidence": round(confidence, 4),
            "confidence_pct": f"{confidence * 100:.1f}%",
            "description": get_disease_description(disease_name),
            "risk_notes": [],
        })

    filtered_predictions, red_flags, filter_notes, symptom_warnings = apply_all_rules(
        predictions=raw_predictions,
        symptoms=symptoms,
        patient_profile=patient_profile,
    )

    final_predictions = filtered_predictions[:top_n]
    for i, pred in enumerate(final_predictions, start=1):
        pred["rank"] = i

    for note in filter_notes:
        print(f"🔍 {note}")
    for w in symptom_warnings:
        print(f"⚠️ {w}")

    return {
        "predictions": final_predictions,
        "symptoms_matched": symptoms,
        "red_flags": red_flags,
        "filter_notes": filter_notes,
    }