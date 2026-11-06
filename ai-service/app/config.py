import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH      = os.path.join(BASE_DIR, "data")
ARTIFACTS_PATH = os.path.join(BASE_DIR, "artifacts")

MODEL_PATH           = os.path.join(ARTIFACTS_PATH, "model.pkl")
LABEL_ENCODER_PATH   = os.path.join(ARTIFACTS_PATH, "label_encoder.pkl")
SYMPTOM_COLUMNS_PATH = os.path.join(ARTIFACTS_PATH, "symptom_columns.pkl")

DESCRIPTION_CSV = os.path.join(DATA_PATH, "complete_description_dataset.csv")

# ── Google Gemini ──────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")