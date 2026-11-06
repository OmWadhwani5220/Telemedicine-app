import pandas as pd
import numpy as np

def load_data(symptoms_path):
    df = pd.read_csv(symptoms_path)
    symptom_cols = [col for col in df.columns if col != "disease"]

    df["symptom_list"] = df[symptom_cols].values.tolist()
    df["symptom_list"] = df["symptom_list"].apply(
        lambda x: [s for s in x if pd.notna(s)]
    )

    return df


def get_all_symptoms(df):
    return sorted(set(
        symptom for row in df["symptom_list"] for symptom in row
    ))


def encode_symptoms(symptom_list, all_symptoms):
    return [1 if s in symptom_list else 0 for s in all_symptoms]