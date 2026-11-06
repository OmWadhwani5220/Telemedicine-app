"""
risk_rules.py
─────────────
Two responsibilities:
1. CLINICAL PLAUSIBILITY FILTER — removes predictions that are biologically
   impossible or highly unlikely given the patient profile (gender, age,
   pregnancy, BMI, chronic conditions).
2. RISK ESCALATION NOTES — adds contextual warnings to predictions that
   survive the filter (e.g. pregnancy + fever = seek care urgently).
"""

from typing import Any

# ─────────────────────────────────────────────────────────────────────────────
# 1. DISEASE METADATA — biological constraints per disease
# ─────────────────────────────────────────────────────────────────────────────

DISEASE_CONSTRAINTS = {
    # ── Female-only diseases ──────────────────────────────────────────────
    "PCOS": {
        "gender": ["Female"],
        "max_age": 51,          # post-menopausal women don't get new PCOS
        "not_pregnant": False,  # PCOS can coexist with pregnancy (pre-existing)
        "reason": "PCOS is a female hormonal condition and does not occur in males."
    },
    "PCOD": {
        "gender": ["Female"],
        "max_age": 51,
        "not_pregnant": False,
        "reason": "PCOD is a female reproductive condition and does not occur in males."
    },
    "Ovarian Cyst": {
        "gender": ["Female"],
        "max_age": 65,
        "reason": "Ovarian cysts occur only in individuals with ovaries."
    },
    "Endometriosis": {
        "gender": ["Female"],
        "max_age": 55,
        "reason": "Endometriosis is a female reproductive condition."
    },
    "Cervical Cancer": {
        "gender": ["Female"],
        "reason": "Cervical cancer occurs only in individuals with a cervix."
    },
    "Uterine Fibroids": {
        "gender": ["Female"],
        "max_age": 55,
        "reason": "Uterine fibroids occur only in individuals with a uterus."
    },
    "Menorrhagia": {
        "gender": ["Female"],
        "max_age": 55,
        "reason": "Menorrhagia (heavy periods) is a female menstrual condition."
    },
    "Dysmenorrhea": {
        "gender": ["Female"],
        "max_age": 55,
        "reason": "Dysmenorrhea (painful periods) is a female menstrual condition."
    },
    "Vaginitis": {
        "gender": ["Female"],
        "reason": "Vaginitis is a female reproductive condition."
    },
    "Vaginal Yeast Infection": {
        "gender": ["Female"],
        "reason": "Vaginal yeast infections occur only in females."
    },
    "Ectopic Pregnancy": {
        "gender": ["Female"],
        "min_age": 13,
        "max_age": 50,
        "reason": "Ectopic pregnancy occurs only in females of reproductive age."
    },
    "Preeclampsia": {
        "gender": ["Female"],
        "requires_pregnant": True,
        "reason": "Preeclampsia occurs only during pregnancy."
    },
    "Gestational Diabetes": {
        "gender": ["Female"],
        "requires_pregnant": True,
        "reason": "Gestational diabetes occurs only during pregnancy."
    },
    "Polycystic Ovary Syndrome": {
        "gender": ["Female"],
        "max_age": 51,
        "reason": "PCOS is a female hormonal condition."
    },

    # ── Male-only diseases ────────────────────────────────────────────────
    "Prostatitis": {
        "gender": ["Male"],
        "min_age": 18,
        "reason": "Prostatitis is a male prostate condition."
    },
    "Benign Prostatic Hyperplasia": {
        "gender": ["Male"],
        "min_age": 40,
        "reason": "BPH is a male prostate condition typically affecting men over 40."
    },
    "Prostate Cancer": {
        "gender": ["Male"],
        "min_age": 40,
        "reason": "Prostate cancer occurs only in males."
    },
    "Erectile Dysfunction": {
        "gender": ["Male"],
        "min_age": 18,
        "reason": "Erectile dysfunction occurs only in males."
    },
    "Epididymitis": {
        "gender": ["Male"],
        "reason": "Epididymitis is a male reproductive condition."
    },
    "Testicular Torsion": {
        "gender": ["Male"],
        "reason": "Testicular torsion occurs only in males."
    },

    # ── Age-restricted diseases ───────────────────────────────────────────
    "Juvenile Diabetes": {
        "max_age": 25,
        "reason": "Juvenile (Type 1) diabetes is typically diagnosed in youth."
    },
    "Kawasaki Disease": {
        "max_age": 12,
        "reason": "Kawasaki disease primarily affects children under 12."
    },
    "Alzheimer's Disease": {
        "min_age": 50,
        "reason": "Alzheimer's disease typically presents after age 50."
    },
    "Osteoporosis": {
        "min_age": 40,
        "reason": "Osteoporosis is most common in adults over 40."
    },
    "Gout": {
        "min_age": 18,
        "reason": "Gout is rare in children."
    },

    # ── Pregnancy-conflicting diseases ────────────────────────────────────
    # (conditions whose primary symptoms overlap but cannot apply if pregnant
    #  — e.g. missed periods is a pregnancy sign, not PCOS sign, if pregnant)
    "Amenorrhea": {
        "gender": ["Female"],
        "not_pregnant": True,
        "max_age": 55,
        "reason": "Amenorrhea (absent periods) cannot be diagnosed during pregnancy — absent periods are expected."
    },
    "Irregular Menstrual Cycle": {
        "gender": ["Female"],
        "not_pregnant": True,
        "max_age": 55,
        "reason": "Menstrual cycle irregularities cannot be assessed during pregnancy."
    },
}

# ── Post-menopausal age threshold ─────────────────────────────────────────
MENOPAUSE_AGE = 52  # average age of menopause; periods stop

# ── Symptoms that are impossible given certain profiles ───────────────────
IMPOSSIBLE_SYMPTOM_COMBOS = [
    {
        "symptom": "irregular periods",
        "condition": lambda p: p.get("gender", "").lower() == "male",
        "message": "Symptom 'irregular periods' is not applicable to male patients and was ignored in analysis."
    },
    {
        "symptom": "heavy menstrual bleeding",
        "condition": lambda p: p.get("gender", "").lower() == "male",
        "message": "Symptom 'heavy menstrual bleeding' is not applicable to male patients."
    },
    {
        "symptom": "irregular periods",
        "condition": lambda p: int(p.get("age", 0)) >= MENOPAUSE_AGE,
        "message": f"Symptom 'irregular periods' is not clinically significant after age {MENOPAUSE_AGE} (post-menopausal)."
    },
    {
        "symptom": "heavy periods",
        "condition": lambda p: p.get("gender", "").lower() == "male",
        "message": "Symptom 'heavy periods' is not applicable to male patients."
    },
    {
        "symptom": "heavy periods",
        "condition": lambda p: int(p.get("age", 0)) >= MENOPAUSE_AGE,
        "message": f"Symptom 'heavy periods' is not clinically significant after age {MENOPAUSE_AGE}."
    },
    {
        "symptom": "painful intercourse",
        "condition": lambda p: int(p.get("age", 0)) < 16,
        "message": "Symptom 'painful intercourse' flagged — patient age is under 16."
    },
    {
        "symptom": "difficulty conceiving",
        "condition": lambda p: p.get("gender", "").lower() == "male",
        "message": "Note: 'difficulty conceiving' in males may indicate male infertility factors."
    },
]

# ── Red flag symptoms that always warrant urgent attention ────────────────
RED_FLAG_SYMPTOMS = [
    "coughing up blood",
    "loss of consciousness",
    "brief loss of consciousness",
    "suicidal thoughts",
    "chest pain",
    "severe chest pain",
    "sharp chest pain on breathing",
    "difficulty breathing",
    "rapid breathing",
    "cyanosis",
    "slurred speech",
    "weakness of one body side",
    "seizures",
    "severe headache",
    "high fever",
    "blood in urine",
    "bloody stool",
    "passing blood clots",
    "severe abdominal pain",
    "severe upper abdominal pain",
]

# ── Risk escalation rules ─────────────────────────────────────────────────
ESCALATION_RULES = [
    {
        "condition": lambda p, d: p.get("is_pregnant") and "fever" in p.get("symptoms", []),
        "note": "⚠️ Fever during pregnancy requires immediate medical attention."
    },
    {
        "condition": lambda p, d: p.get("is_pregnant") and d.lower() in ["malaria", "typhoid", "dengue"],
        "note": "⚠️ This condition during pregnancy is high-risk. Seek emergency obstetric care."
    },
    {
        "condition": lambda p, d: p.get("is_pregnant") and "high blood pressure" in p.get("symptoms", []),
        "note": "⚠️ High blood pressure in pregnancy may indicate preeclampsia. Seek urgent care."
    },
    {
        "condition": lambda p, d: p.get("has_chronic_disease") not in [None, False, "none", ""] and d.lower() in ["diabetes", "hypertension"],
        "note": "⚠️ Pre-existing chronic condition may complicate this diagnosis. Consult your specialist."
    },
    {
        "condition": lambda p, d: int(p.get("age", 0)) > 60 and d.lower() in ["pneumonia", "influenza", "covid"],
        "note": "⚠️ Patient is over 60 — this condition carries higher risk in elderly patients."
    },
    {
        "condition": lambda p, d: float(p.get("bmi", 0)) > 30 and d.lower() in ["diabetes", "hypertension", "pcos", "pcod", "sleep apnea"],
        "note": "⚠️ Elevated BMI is a significant risk factor for this condition."
    },
    {
        "condition": lambda p, d: p.get("smoking_status") not in [None, "never", ""] and d.lower() in ["copd", "lung cancer", "asthma", "bronchitis"],
        "note": "⚠️ Smoking history significantly increases risk for this condition."
    },
    {
        "condition": lambda p, d: p.get("alcohol_use") and d.lower() in ["liver cirrhosis", "hepatitis", "pancreatitis", "gastritis"],
        "note": "⚠️ Alcohol use is a major risk factor for this condition."
    },
    {
        "condition": lambda p, d: int(p.get("age", 0)) < 18 and d.lower() in ["heart attack", "stroke", "prostate cancer", "cervical cancer"],
        "note": "⚠️ This condition is extremely rare in patients under 18. Consider alternative diagnoses."
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# 2. PUBLIC API
# ─────────────────────────────────────────────────────────────────────────────

def validate_symptoms_for_profile(symptoms: list[str], patient_profile: dict) -> tuple[list[str], list[str]]:
    """
    Filters out symptoms that are impossible/irrelevant for this patient profile.
    Returns (valid_symptoms, warning_messages).
    """
    warnings = []
    valid_symptoms = list(symptoms)

    for rule in IMPOSSIBLE_SYMPTOM_COMBOS:
        symptom = rule["symptom"]
        if symptom in valid_symptoms:
            try:
                if rule["condition"](patient_profile):
                    warnings.append(rule["message"])
                    # Don't remove the symptom — just flag it
                    # The filter below handles removing impossible predictions
            except Exception:
                pass

    return valid_symptoms, warnings


def filter_predictions(predictions: list[dict], patient_profile: dict) -> tuple[list[dict], list[str]]:
    """
    Removes predictions that are clinically impossible for this patient.
    Returns (filtered_predictions, filter_messages).
    """
    filtered = []
    filter_messages = []

    gender = patient_profile.get("gender", "").strip().lower()
    age = int(patient_profile.get("age", 30))
    is_pregnant = patient_profile.get("is_pregnant", False)
    bmi = float(patient_profile.get("bmi", 22))

    for pred in predictions:
        disease = pred.get("disease", "")
        constraints = DISEASE_CONSTRAINTS.get(disease, {})
        excluded = False
        reason = ""

        # Gender check
        allowed_genders = constraints.get("gender", None)
        if allowed_genders:
            allowed_lower = [g.lower() for g in allowed_genders]
            if gender not in allowed_lower:
                excluded = True
                reason = constraints.get("reason", f"{disease} is not applicable to this patient's gender.")

        # Min age check
        if not excluded and "min_age" in constraints:
            if age < constraints["min_age"]:
                excluded = True
                reason = constraints.get("reason", f"{disease} is not typical for age {age}.")

        # Max age check
        if not excluded and "max_age" in constraints:
            if age > constraints["max_age"]:
                excluded = True
                reason = constraints.get("reason", f"{disease} is not typical after age {constraints['max_age']}.")

        # Pregnancy-required check
        if not excluded and constraints.get("requires_pregnant"):
            if not is_pregnant:
                excluded = True
                reason = constraints.get("reason", f"{disease} occurs only during pregnancy.")

        # Not-pregnant check
        if not excluded and constraints.get("not_pregnant"):
            if is_pregnant:
                excluded = True
                reason = constraints.get("reason", f"{disease} cannot be assessed during pregnancy.")

        # Post-menopausal period-related disease check
        if not excluded and gender == "female" and age >= MENOPAUSE_AGE:
            period_diseases = ["pcos", "pcod", "menorrhagia", "dysmenorrhea",
                               "amenorrhea", "irregular menstrual cycle", "uterine fibroids"]
            if disease.lower() in period_diseases:
                excluded = True
                reason = f"{disease} is unlikely after menopause (age {MENOPAUSE_AGE}+). Patient is {age} years old."

        if excluded:
            filter_messages.append(f"❌ '{disease}' excluded: {reason}")
        else:
            filtered.append(pred)

    return filtered, filter_messages


def get_risk_notes(disease: str, patient_profile: dict) -> list[str]:
    """
    Returns escalation warning notes for a given disease + patient profile.
    """
    notes = []
    for rule in ESCALATION_RULES:
        try:
            if rule["condition"](patient_profile, disease):
                notes.append(rule["note"])
        except Exception:
            pass
    return notes


def get_red_flags(symptoms: list[str]) -> list[str]:
    """
    Returns list of red flag symptoms present in the patient's symptom list.
    """
    return [s for s in symptoms if s in RED_FLAG_SYMPTOMS]


def apply_all_rules(
    predictions: list[dict],
    symptoms: list[str],
    patient_profile: dict
) -> tuple[list[dict], list[str], list[str], list[str]]:
    """
    Master function called by routes.py.
    Returns:
      - filtered predictions (impossible ones removed)
      - red flags detected
      - filter messages (what was removed and why)
      - symptom warnings (impossible symptoms flagged)
    """
    # Step 1: Flag impossible symptoms
    _, symptom_warnings = validate_symptoms_for_profile(symptoms, patient_profile)

    # Step 2: Filter impossible predictions
    filtered_preds, filter_messages = filter_predictions(predictions, patient_profile)

    # Step 3: Add risk notes to surviving predictions
    profile_with_symptoms = {**patient_profile, "symptoms": symptoms}
    for pred in filtered_preds:
        pred["risk_notes"] = get_risk_notes(pred["disease"], profile_with_symptoms)

    # Step 4: Detect red flags
    red_flags = get_red_flags(symptoms)

    all_warnings = symptom_warnings + filter_messages

    return filtered_preds, red_flags, all_warnings, symptom_warnings