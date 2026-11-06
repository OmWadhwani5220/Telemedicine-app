"""
helpers.py
──────────
Utility functions used across the ai-service.
"""

import pandas as pd
from datetime import date
from functools import lru_cache
from app.config import DESCRIPTION_CSV


@lru_cache(maxsize=1)
def _load_descriptions() -> dict[str, str]:
    """
    Load the description CSV once and cache it in memory.
    Returns a dict: { disease_name_lower -> description }
    """
    try:
        df = pd.read_csv(DESCRIPTION_CSV)
        return {
            row["Disease"].strip().lower(): row["Description"].strip()
            for _, row in df.iterrows()
            if pd.notna(row["Disease"]) and pd.notna(row["Description"])
        }
    except Exception as e:
        print(f"⚠️  Could not load description CSV: {e}")
        return {}


def get_disease_description(disease_name: str) -> str:
    """
    Look up the plain-English description for a disease.
    Returns an empty string if not found.
    """
    descriptions = _load_descriptions()
    return descriptions.get(disease_name.strip().lower(), "")


def calculate_age(dob_str: str | None) -> int | None:
    """
    Calculate age in years from a date-of-birth string (YYYY-MM-DD).
    Returns None if the string is absent or invalid.
    """
    if not dob_str:
        return None
    try:
        dob  = date.fromisoformat(dob_str[:10])   # handle datetime strings too
        today = date.today()
        age  = today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )
        return max(0, age)
    except (ValueError, TypeError):
        return None


def calculate_bmi(height_cm: float | None, weight_kg: float | None) -> float | None:
    """
    Calculate BMI from height (cm) and weight (kg).
    Returns None if either value is missing or invalid.
    """
    if not height_cm or not weight_kg or height_cm <= 0:
        return None
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m ** 2), 1)