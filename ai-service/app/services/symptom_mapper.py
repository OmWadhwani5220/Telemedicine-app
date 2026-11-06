"""
symptom_mapper.py
─────────────────
Bridges between the LLM layer and the ML model.

The LLM returns symptom names. This module:
1. Validates them against the model's vocabulary
2. Handles edge cases (partial matches, near-duplicates)
3. Returns the final clean list ready for encoding
"""

import joblib
from app.config import SYMPTOM_COLUMNS_PATH

# Load once at startup
_symptom_columns: list[str] = joblib.load(SYMPTOM_COLUMNS_PATH)
_symptom_set = set(_symptom_columns)


def validate_and_map(raw_symptoms: list[str]) -> list[str]:
    """
    Take a raw list of symptom strings (from LLM or direct input),
    clean them, and return only those that exist in the model vocabulary.

    Args:
        raw_symptoms: list of symptom strings

    Returns:
        Filtered list of valid symptom strings
    """
    valid = []
    seen  = set()

    for symptom in raw_symptoms:
        # Normalise: lowercase, strip whitespace
        cleaned = symptom.strip().lower()

        # Skip duplicates
        if cleaned in seen:
            continue
        seen.add(cleaned)

        # Keep only symptoms in the trained model's vocabulary
        if cleaned in _symptom_set:
            valid.append(cleaned)
        else:
            print(f"⚠️  Symptom not in vocabulary, skipping: '{cleaned}'")

    return valid


def get_all_valid_symptoms() -> list[str]:
    """Return the full list of symptoms the model understands."""
    return _symptom_columns