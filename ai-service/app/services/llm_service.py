import json
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ── The 378 valid symptom names from our trained model ────────────────────
VALID_SYMPTOMS = [
    "abdominal cramps", "abdominal discomfort", "abdominal pain",
    "abdominal rigidity", "acidity", "acne", "anemia symptoms",
    "angioedema", "ankle or knee pain", "back pain", "bad breath",
    "belching", "blackheads", "bladder discomfort", "blister",
    "blisters on skin", "bloating", "blood in urine", "bloody stool",
    "blurred and distorted vision", "body aches", "bone pain",
    "bowel problems", "brain fog", "breathlessness",
    "breathlessness on exertion", "brief loss of consciousness",
    "brittle nails", "burning micturition", "burning sensation in leg",
    "burning sensation in vagina", "burning sensation on skin",
    "change in bowel habits", "chest discomfort", "chest pain",
    "chest pain on exertion", "chest pressure", "chest tenderness",
    "chest tightness", "chills", "chronic cough", "clay coloured stools",
    "cloudy or blurred vision", "cloudy urine", "cold hands and feet",
    "confusion", "confusion after episode", "congestion", "constipation",
    "continuous feel of urine", "continuous sneezing", "cough",
    "coughing up blood", "cracked skin", "cramping", "cramps",
    "craving non food items", "cyanosis", "dandruff", "dark urine",
    "daytime sleepiness", "decreased urine output", "dehydration",
    "depression", "diarrhea", "difficulty breathing",
    "difficulty chewing", "difficulty completing tasks",
    "difficulty conceiving", "difficulty concentrating",
    "difficulty falling asleep", "difficulty raising arm",
    "difficulty sleeping", "difficulty swallowing",
    "difficulty urinating", "difficulty walking", "discharge from eyes",
    "discharge from urethra", "dischromic patches", "disorganisation",
    "dizziness", "double vision", "dry mouth", "dry skin", "ear pain",
    "ear pressure", "early morning waking", "easily distracted",
    "easy bruising", "elevated androgen levels", "excess mucus production",
    "excessive hair growth", "excessive hunger", "excessive sweating",
    "excessive thirst", "excessive weight gain", "excessive worry",
    "extreme fatigue", "extreme mood swings", "eye irritation",
    "eye pain", "facial pain and pressure", "faded colour vision",
    "fatigue", "fear or anxiety before seizure",
    "feeling of incomplete evacuation", "fever", "flaky skin",
    "fluid filled blisters", "fluid from ear", "foot arch pain",
    "forgetfulness", "foul smell of urine", "foul smell vaginal discharge",
    "frequent bowel movements", "frequent changes in glasses",
    "frequent respiratory infections", "frequent urination",
    "frequent waking at night", "frothy dark urine", "gradual vision loss",
    "grandiosity", "greasy skin patches", "gritty feeling in eyes",
    "guilt/worthlessness", "hair loss", "hair thinning",
    "halos around lights", "hard stools", "headache",
    "hearing difficulty", "heartburn", "heavy menstrual bleeding",
    "heavy periods", "heel pain", "high blood pressure",
    "high body temperature", "high fever", "hip joint pain", "hoarseness",
    "hopelessness", "hot dry skin", "hyperactivity",
    "impaired wound healing", "impulsive behaviour", "impulsiveness",
    "indigestion", "infrequent bowel movements", "insulin resistance",
    "iron deficiency", "irregular heartbeat", "irregular periods",
    "irregular sugar level", "irritability", "irritation in anus",
    "itching", "itching in anal region", "itching in legs", "itchy eyes",
    "jaw pain", "jerking movements", "joint pain", "joint stiffness",
    "joint tenderness", "knee pain", "leg heaviness",
    "limited range of motion", "loss of appetite", "loss of balance",
    "loss of consciousness", "loss of interest", "loss of smell",
    "low blood pressure", "low energy", "low frustration tolerance",
    "low grade fever", "low self esteem", "lower abdominal pain",
    "lower back pain", "lump in neck", "memory issues", "mild fever",
    "mood changes", "mood disturbances", "mood swings",
    "morning stiffness", "mouth ulcers", "movement stiffness",
    "mucus in stool", "multiple ovarian cysts", "muscle cramps",
    "muscle pain", "muscle stiffness", "muscle tension", "muscle weakness",
    "narrow stools", "nasal congestion", "nausea", "neck pain",
    "nervousness", "night sweats", "nodal skin eruptions", "nosebleed",
    "numbness in hands", "numbness in leg", "oily skin",
    "pain after exercise", "pain after long standing", "pain around navel",
    "pain behind eyes", "pain during bowel movements",
    "pain during intercourse", "pain in affected area",
    "pain in anal region", "pain in groin", "pain in left arm",
    "pain in leg", "pain in lower back", "pain in urethra",
    "pain radiating down leg", "pain radiating to back",
    "pain radiating to groin", "pain radiating to left arm",
    "pain radiating to neck", "pain relieved by rest",
    "pain worse in morning", "pain worsening at night",
    "pain worsening on deep breath", "pain worsening on movement",
    "pain worsening on sitting", "painful ejaculation",
    "painful intercourse", "painful skin rash", "painful urination",
    "painful walking", "pale skin", "pale stools", "palpitations",
    "panic attacks", "passage of gases", "passing blood clots",
    "pelvic discomfort", "pelvic pain", "periods of deep depression",
    "periods of high energy", "persistent cough", "persistent sadness",
    "poor judgement", "poor night vision", "postnasal drip",
    "prolonged periods", "pus filled pimples", "racing thoughts",
    "rapid breathing", "rapid heartbeat", "rapid weight gain",
    "rapid weight loss", "recurrent infections", "recurring attacks",
    "red sore around nose", "redness around joint", "redness around joints",
    "redness in eyes", "redness in leg", "redness of skin",
    "redness of vaginal area", "redness on face", "reduced mobility",
    "reduced need for sleep", "reduced range of motion", "restlessness",
    "restricted shoulder movement", "right upper abdominal tenderness",
    "risky behaviour", "rumbling stomach", "runny nose", "scarring",
    "seizures", "sensitivity to light", "sensitivity to sound",
    "sensitivity to touch", "severe abdominal pain", "severe back pain",
    "severe fatigue", "severe headache", "severe joint pain",
    "severe liver tenderness", "severe menstrual cramps",
    "severe upper abdominal pain", "sharp chest pain on breathing",
    "shivering", "shortness of breath", "shoulder pain",
    "silver like dusting", "skin bumps", "skin discolouration",
    "skin discolouration on legs", "skin inflammation", "skin peeling",
    "skin rash", "skin rash on scalp", "skin tenderness",
    "skin thickening", "skin warm to touch", "sleep apnea",
    "sleep disturbance", "slow healing wounds", "slurred speech",
    "small dents in nails", "sneezing", "snoring", "sore throat",
    "sour belching", "spinning movements", "spotting between periods",
    "staring spells", "stiff neck", "stiffness in foot",
    "stiffness in shoulder", "stomach cramps", "stomach pain",
    "straining during defecation", "suicidal thoughts", "sweating",
    "swelling", "swelling in anal region", "swelling in ankles",
    "swelling in big toe", "swelling in heel", "swelling in one leg",
    "swelling in vaginal area", "swelling joints",
    "swelling of hands and face", "swelling of stomach", "swollen eyelids",
    "swollen legs", "swollen lymph nodes", "swollen lymph nodes in neck",
    "swollen salivary glands", "swollen skin", "swollen tonsils",
    "temporary confusion", "tenderness on touching abdomen",
    "thick nasal discharge", "throat irritation", "tingling before rash",
    "tingling in hands and feet", "tingling in leg", "trembling",
    "tremors", "tunnel vision", "unexplained weight loss",
    "unrefreshing sleep", "upper abdominal pain", "urgency to defecate",
    "vaginal discharge", "vaginal itching", "visible blood vessels on face",
    "vomiting", "warmth around joint", "warmth around joints",
    "warmth in affected leg", "watery eyes", "watery stools", "weakness",
    "weakness in leg", "weakness in limbs", "weakness of one body side",
    "weight gain", "weight loss", "welts on skin", "wheezing",
    "white spots inside mouth", "widespread muscle pain",
    "xanthomas on skin", "yellow crust ooze", "yellowing of eyes",
    "yellowish skin",
]

_SYMPTOM_LIST_STR = ", ".join(VALID_SYMPTOMS)

SYSTEM_PROMPT = f"""You are a multilingual medical symptom extractor for a telemedicine platform.

Your only job is to read the user's symptom description (which may be written in ANY language — English, Hindi, Marathi, Tamil, Bengali, Hinglish, or any other) and return a JSON array of matching symptom names from the VALID SYMPTOM LIST below.

VALID SYMPTOM LIST:
{_SYMPTOM_LIST_STR}

RULES (follow strictly):
1. Return ONLY a valid JSON array — no explanation, no markdown, no extra text, no code fences.
2. Every item in the array MUST be an exact string from the VALID SYMPTOM LIST above.
3. Do NOT invent symptom names. If something the user describes does not clearly match any valid symptom, skip it.
4. Match by meaning, not spelling. "pet mein dard" → "abdominal pain". "aankhein laal hain" → "redness in eyes". "it hurts to pee" → "burning micturition".
5. Include ALL symptoms mentioned, even if the user mentions them casually.
6. If nothing matches, return an empty array: []

Example input: "मुझे बुखार है और पेशाब में जलन हो रही है"
Example output: ["fever", "burning micturition"]

Example input: "I have a bad headache, my eyes are red and watery, and I feel very tired"
Example output: ["headache", "redness in eyes", "watery eyes", "fatigue"]

Example input: "feeling nauseous and throwing up since morning, stomach hurts a lot"
Example output: ["nausea", "vomiting", "abdominal pain"]
"""


def extract_symptoms_from_text(user_text: str) -> list[str]:
    """
    Send user's free-text symptom description to Groq (llama-3.1-8b-instant).
    Returns a list of valid symptom name strings.
    If Groq is unavailable or the key is missing, returns [].
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        print("⚠️  GROQ_API_KEY not set — skipping LLM extraction")
        return []

    try:
        client = Groq(api_key=GROQ_API_KEY)

        chat_completion = client.chat.completions.create(
            model="groq/compound-mini",
            temperature=0.0,
            max_tokens=512,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text},
            ],
        )

        raw_text = chat_completion.choices[0].message.content.strip()

        # Qwen thinks out loud — strip the <think>...</think> block if present
        if "<think>" in raw_text:
            if "</think>" in raw_text:
                raw_text = raw_text.split("</think>")[-1].strip()
            else:
        # thinking didn't close — return empty, let the route handle it
                return []

        # Strip markdown code fences if model wraps response in them
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        symptoms = json.loads(raw_text)

        # Validate — only keep items that are in our vocabulary
        valid_set = set(VALID_SYMPTOMS)
        validated = [s for s in symptoms if s in valid_set]

        print(f"🧠 LLM extracted: {validated}")
        return validated

    except json.JSONDecodeError as e:
        print(f"❌ Groq response parse error: {e}")
        return []
    except Exception as e:
        print(f"❌ Groq unexpected error: {e}")
        return []