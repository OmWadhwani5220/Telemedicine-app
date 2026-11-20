
"""
symptom_mapper.py

Bridges between the LLM layer and the ML model.

1. Loads the trained model's symptom vocabulary.
2. Validates symptoms extracted by the LLM.
3. Removes duplicates and invalid symptoms.
4. Returns symptoms ready for ML prediction.
"""

from app.models.predict import load_artifacts


def get_all_valid_symptoms() -> list[str]:
    """Return all symptom names supported by the trained ML model."""
    _, _, symptom_columns = load_artifacts()
    return list(symptom_columns)


def validate_and_map(raw_symptoms: list[str]) -> list[str]:
    """
    Validate and normalize symptoms against the model vocabulary.
    """

    symptom_columns = get_all_valid_symptoms()

    # Map normalized names back to the model's original column names.
    symptom_lookup = {
        str(symptom).strip().lower(): str(symptom)
        for symptom in symptom_columns
    }

    valid = []
    seen = set()

    for symptom in raw_symptoms:
        if not isinstance(symptom, str):
            continue

        cleaned = symptom.strip().lower()

        if not cleaned or cleaned in seen:
            continue

        seen.add(cleaned)

        if cleaned in symptom_lookup:
            valid.append(symptom_lookup[cleaned])
        else:
            print(
                f"Symptom not in vocabulary, skipping: '{cleaned}'"
            )

    return valid
