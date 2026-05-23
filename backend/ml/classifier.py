"""
ml/classifier.py — Emotion & Topic Detection
Detects what the patient is feeling and talking about.
Uses keyword matching first (works immediately, no training needed).
Upgrades to HuggingFace transformers when installed.
"""

import re
from typing import Dict, List

# ─── Emotion Keywords ─────────────────────────────────────────────

EMOTION_KEYWORDS = {
    "anxiety": [
        "anxious", "anxiety", "worried", "worry", "nervous", "panic", "fear",
        "scared", "terrified", "dread", "uneasy", "restless", "tense", "stress",
        "overthinking", "overthink", "racing thoughts", "heart racing", "can't breathe",
        "fikar", "tension", "ghabrahat", "dar"
    ],
    "depression": [
        "depressed", "depression", "sad", "sadness", "hopeless", "hopelessness",
        "worthless", "empty", "numb", "lonely", "alone", "crying", "cry",
        "no motivation", "unmotivated", "can't get up", "don't care", "giving up",
        "udaas", "mayoos", "akela", "tanhai"
    ],
    "anger": [
        "angry", "anger", "furious", "rage", "hate", "frustrated", "frustration",
        "annoyed", "irritated", "mad", "livid", "resentful", "bitter",
        "gussa", "ghussa", "naraaz"
    ],
    "grief": [
        "grief", "loss", "lost", "death", "died", "passed away", "mourning",
        "bereavement", "miss", "missing", "gone", "funeral", "deceased",
        "gham", "sog", "wafat"
    ],
    "trauma": [
        "trauma", "traumatic", "abuse", "abused", "assault", "ptsd",
        "flashback", "nightmare", "triggered", "intrusive thoughts",
        "sexual abuse", "domestic violence", "accident", "attack"
    ],
    "loneliness": [
        "lonely", "alone", "isolated", "no friends", "no one understands",
        "disconnected", "invisible", "excluded", "left out", "abandoned",
        "akela", "tanhai", "koi nahi"
    ],
    "overwhelmed": [
        "overwhelmed", "too much", "can't cope", "can't handle", "breaking down",
        "falling apart", "exhausted", "burned out", "burnout", "tired of everything",
        "thaka hua", "pareshan"
    ],
    "neutral": []
}

# ─── Topic Keywords ───────────────────────────────────────────────

TOPIC_KEYWORDS = {
    "anxiety": ["anxiety", "anxious", "panic", "worry", "worried", "fear", "phobia", "fikar"],
    "depression": ["depressed", "depression", "sad", "hopeless", "empty", "numb", "udaas"],
    "relationship issues": [
        "relationship", "partner", "boyfriend", "girlfriend", "husband", "wife",
        "marriage", "divorce", "breakup", "cheating", "trust", "love",
        "shadi", "talaq", "biwi", "shohar"
    ],
    "family conflict": [
        "family", "parents", "mother", "father", "siblings", "brother", "sister",
        "in-laws", "saas", "susral", "ammi", "abu", "gharwale"
    ],
    "work stress": [
        "work", "job", "boss", "office", "career", "fired", "unemployed",
        "workload", "deadline", "colleague", "naukri", "kaam"
    ],
    "trauma": ["trauma", "abuse", "assault", "ptsd", "flashback", "nightmare"],
    "grief": ["grief", "loss", "death", "died", "missing someone", "gham"],
    "self-esteem": [
        "confidence", "self-esteem", "worthless", "ugly", "failure", "not good enough",
        "insecure", "insecurity", "comparing", "inferior"
    ],
    "addiction": [
        "addiction", "addicted", "drugs", "alcohol", "smoking", "gambling",
        "can't stop", "nasha", "sharab"
    ],
    "sleep issues": ["sleep", "insomnia", "can't sleep", "nightmares", "tired", "exhausted"],
    "anger management": ["angry", "anger", "rage", "frustration", "violent", "gussa"],
    "general": []
}

# ─── Risk Keywords ────────────────────────────────────────────────

HIGH_RISK_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self harm", "self-harm", "cutting", "hurt myself", "not worth living",
    "no reason to live", "better off dead", "khud kushi", "marna chahta"
]

MEDIUM_RISK_KEYWORDS = [
    "can't go on", "give up", "hopeless", "no point", "nobody cares",
    "disappear", "escape everything", "done with life"
]


# ─── Main Analysis Function ───────────────────────────────────────

def analyze_message(text: str) -> Dict:
    """
    Analyze a patient message for emotion, topic, and risk level.
    Returns structured data to personalize the AI response.
    """
    text_lower = text.lower()

    # Detect emotion
    emotion, confidence = _detect_emotion(text_lower)

    # Detect topics
    topics = _detect_topics(text_lower)
    primary_topic = topics[0] if topics else "general"

    # Detect risk
    risk_level = _detect_risk(text_lower)

    return {
        "emotion": emotion,
        "confidence": confidence,
        "primary_topic": primary_topic,
        "all_topics": topics[:3],
        "risk_level": risk_level,
        "word_count": len(text.split()),
        "is_question": "?" in text,
    }


def _detect_emotion(text: str) -> tuple:
    """Keyword-based emotion detection with confidence scoring."""
    scores = {}

    for emotion, keywords in EMOTION_KEYWORDS.items():
        if emotion == "neutral":
            continue
        score = 0
        for kw in keywords:
            if kw in text:
                # Longer keyword matches = higher confidence
                score += len(kw.split())
        if score > 0:
            scores[emotion] = score

    if not scores:
        return "neutral", 0.5

    # Top emotion
    top_emotion = max(scores, key=scores.get)
    total = sum(scores.values())
    confidence = min(scores[top_emotion] / total, 0.95)

    return top_emotion, round(confidence, 2)


def _detect_topics(text: str) -> List[str]:
    """Detect all relevant topics in the message."""
    found = []

    for topic, keywords in TOPIC_KEYWORDS.items():
        if topic == "general":
            continue
        for kw in keywords:
            if kw in text:
                if topic not in found:
                    found.append(topic)
                break

    return found if found else ["general"]


def _detect_risk(text: str) -> str:
    """Detect crisis/risk level in message."""
    for kw in HIGH_RISK_KEYWORDS:
        if kw in text:
            return "high"

    for kw in MEDIUM_RISK_KEYWORDS:
        if kw in text:
            return "medium"

    return "low"


# ─── Optional: HuggingFace upgrade ───────────────────────────────
# Uncomment this block after running:
# pip install transformers torch
# This gives much more accurate results than keyword matching

"""
try:
    from transformers import pipeline

    _emotion_pipeline = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=None
    )
    _topic_pipeline = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli"
    )
    TOPIC_LABELS = [
        "anxiety", "depression", "relationship issues", "family conflict",
        "work stress", "trauma", "grief", "self-esteem", "addiction", "general"
    ]

    def analyze_message(text: str) -> Dict:
        # Emotion
        emotion_results = _emotion_pipeline(text[:512])[0]
        top = max(emotion_results, key=lambda x: x['score'])
        
        # Topics
        topic_results = _topic_pipeline(text[:512], TOPIC_LABELS)
        
        return {
            "emotion": top["label"].lower(),
            "confidence": round(top["score"], 2),
            "primary_topic": topic_results["labels"][0],
            "all_topics": topic_results["labels"][:3],
            "risk_level": _detect_risk(text.lower()),
            "word_count": len(text.split()),
            "is_question": "?" in text,
        }

    print("✅ HuggingFace ML models loaded successfully")

except ImportError:
    print("ℹ️  Using keyword-based classifier (install transformers for ML upgrade)")
"""
