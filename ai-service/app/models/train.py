import numpy as np
import joblib
from itertools import combinations

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from imblearn.over_sampling import RandomOverSampler

from app.models.preprocessing import load_data, get_all_symptoms, encode_symptoms
from app.config import DATA_PATH, MODEL_PATH, LABEL_ENCODER_PATH, SYMPTOM_COLUMNS_PATH


def expand_dataset(df, all_symptoms, y_encoded):
    X_expanded, y_expanded = [], []

    for i, row in df.iterrows():
        symptoms = row["symptom_list"]
        label = y_encoded[i]

        for r in range(2, len(symptoms) + 1):
            for combo in combinations(symptoms, r):
                X_expanded.append(encode_symptoms(combo, all_symptoms))
                y_expanded.append(label)

    return np.array(X_expanded), np.array(y_expanded)


def train():
    df = load_data(f"{DATA_PATH}/clean_symptoms_dataset.csv")

    all_symptoms = get_all_symptoms(df)

    y = df["disease"]
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_expanded, y_expanded = expand_dataset(df, all_symptoms, y_encoded)

    print("Expanded dataset size:", len(X_expanded))

    # Oversampling
    ros = RandomOverSampler()
    X_resampled, y_resampled = ros.fit_resample(X_expanded, y_expanded)

    print("Resampled dataset size:", len(X_resampled))

    # Models
    rf = RandomForestClassifier(n_estimators=200, random_state=42)
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    lr = LogisticRegression(max_iter=1000)

    model = VotingClassifier(
        estimators=[('rf', rf), ('xgb', xgb), ('lr', lr)],
        voting='soft'
    )

    model.fit(X_resampled, y_resampled)

    # Save artifacts
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, LABEL_ENCODER_PATH)
    joblib.dump(all_symptoms, SYMPTOM_COLUMNS_PATH)

    print("✅ Training complete. Artifacts saved.")


if __name__ == "__main__":
    train()