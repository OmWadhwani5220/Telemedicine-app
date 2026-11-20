
"""
Maps extracted symptoms to the trained model vocabulary.
Preserves the exact feature names expected by the model.
"""

import re
import joblib
from app.config import SYMPTOM_COLUMNS_PATH

# Load the trained model's symptom vocabulary
_symptom_columns = list(joblib.load(SYMPTOM_COLUMNS_PATH))


def normalize_symptom(value: str) -> str:
    """Normalize formatting for symptom matching."""
    value = str(value).strip().lower()
    value = value.replace("_", " ").replace("-", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


# Map normalized names to original model feature names
_symptom_lookup = {
    normalize_symptom(column): column
    for column in _symptom_columns
}

# Add aliases only when the dataset feature is equivalent.
SYMPTOM_ALIASES = {
    "irregular periods": "irregular menstruation",
    "painful periods": "menstrual cramps",
    "tiredness": "fatigue",
    "feeling weak": "weakness",
}


def validate_and_map(raw_symptoms: list[str]) -> list[str]:
    """
    Convert extracted symptoms into valid model feature names.
    """

    if not isinstance(raw_symptoms, list):
        return []

    valid = []
    seen = set()

    for symptom in raw_symptoms:
        if not isinstance(symptom, str):
            continue

        cleaned = normalize_symptom(symptom)

        # First attempt an exact normalized match
        matched = _symptom_lookup.get(cleaned)

        # Then attempt a known synonym
        if matched is None:
            alias = SYMPTOM_ALIASES.get(cleaned)
            if alias:
                matched = _symptom_lookup.get(
                    normalize_symptom(alias)
                )

        if matched is None:
            print(
                f"Unmatched symptom label: {cleaned}",
                flush=True
            )
            continue

        if matched not in seen:
            valid.append(matched)
            seen.add(matched)

    print(
        f"Symptom mapping: {len(raw_symptoms)} extracted, "
        f"{len(valid)} matched",
        flush=True
    )

    return valid


def get_all_valid_symptoms() -> list[str]:
    return _symptom_columns
