from functools import lru_cache
from app.models.predict import load_artifacts


def get_all_valid_symptoms() -> list[str]:
    _, _, symptom_columns = load_artifacts()
    return list(symptom_columns)


@lru_cache(maxsize=1)
def _symptom_set() -> set[str]:
    return set(get_all_valid_symptoms())


def validate_and_map(raw_symptoms: list[str]) -> list[str]:
    valid, seen = [], set()
    vocab = _symptom_set()
    for s in raw_symptoms:
        cleaned = s.strip().lower()
        if cleaned in seen:
            continue
        seen.add(cleaned)
        if cleaned in vocab:
            valid.append(cleaned)
        else:
            print(f"⚠️ Not in vocabulary, skipping: '{cleaned}'")
    return valid