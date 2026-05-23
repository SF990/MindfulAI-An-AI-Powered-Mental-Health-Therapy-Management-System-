"""
ml/recommender.py — Therapy Technique Recommender
Recommends the best therapy technique based on:
- Detected emotion
- Topic
- What has worked for this patient before (personalization)
"""

from typing import Dict, List
from database import get_all_ratings

# ─── Technique Mapping ────────────────────────────────────────────

# Maps emotion + topic → best therapy techniques
TECHNIQUE_MAP = {
    "anxiety": {
        "default": "CBT + Breathing Exercise",
        "work stress": "Stress Inoculation Training",
        "relationship issues": "Emotion Regulation (DBT)",
        "general": "4-7-8 Breathing + Grounding (5-4-3-2-1)",
        "family conflict": "Communication Skills Training",
    },
    "depression": {
        "default": "Behavioral Activation (CBT)",
        "general": "Positive Psychology + Gratitude Practice",
        "grief": "Grief Processing + Meaning-Making",
        "loneliness": "Social Connection Strategies",
        "self-esteem": "Self-Compassion Practice",
    },
    "anger": {
        "default": "Anger Management + CBT",
        "general": "STOP Technique + Cognitive Restructuring",
        "relationship issues": "Nonviolent Communication (NVC)",
        "family conflict": "De-escalation Techniques",
    },
    "grief": {
        "default": "Grief Counseling (Worden's Tasks)",
        "general": "Narrative Therapy + Meaning Reconstruction",
    },
    "trauma": {
        "default": "Trauma-Informed Support",
        "general": "Grounding Techniques + Safety Planning",
    },
    "loneliness": {
        "default": "Connection-Focused CBT",
        "general": "Behavioral Activation + Social Skills",
    },
    "overwhelmed": {
        "default": "Mindfulness-Based Stress Reduction (MBSR)",
        "work stress": "Time Management + Boundary Setting",
        "general": "Box Breathing + Priority Reframing",
    },
    "neutral": {
        "default": "Active Listening + Open Exploration",
        "general": "Motivational Interviewing",
    },
}

# Technique descriptions sent to Claude so it knows HOW to apply them
TECHNIQUE_DESCRIPTIONS = {
    "CBT + Breathing Exercise": "Use Socratic questioning to identify cognitive distortions, then guide a breathing exercise. Ask: 'What evidence supports this thought?'",
    "Behavioral Activation (CBT)": "Help the patient identify one small, achievable activity they can do today. Focus on action, not mood. Ask: 'What's one tiny thing you enjoyed before?'",
    "Mindfulness-Based Stress Reduction (MBSR)": "Guide a brief body scan or mindful breathing. Encourage present-moment awareness without judgment.",
    "4-7-8 Breathing + Grounding (5-4-3-2-1)": "Teach 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s). Then use 5-4-3-2-1 grounding: 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste.",
    "Grief Processing + Meaning-Making": "Validate grief deeply. Use Worden's tasks: accept the loss, work through pain, adjust to new reality. Ask: 'What do you miss most?'",
    "Active Listening + Open Exploration": "Reflect back what the patient says. Use open-ended questions. Do not rush to solutions. Make them feel heard first.",
    "Trauma-Informed Support": "Prioritize safety and trust. Do NOT push for details. Use grounding. Remind them they are safe now. Consider referring to human therapist.",
    "Grounding Techniques + Safety Planning": "Use the 5-4-3-2-1 grounding technique. If risk is present, create a safety plan with emergency contacts.",
    "Self-Compassion Practice": "Use Kristin Neff's self-compassion framework: mindfulness, common humanity, self-kindness. Ask: 'What would you say to a friend in this situation?'",
    "Nonviolent Communication (NVC)": "Guide through NVC: Observe → Feel → Need → Request. Help them express needs without blame.",
    "Motivational Interviewing": "Use OARS: Open questions, Affirmations, Reflective listening, Summarizing. Explore ambivalence, build motivation for change.",
    "Stress Inoculation Training": "Help identify stress triggers, teach coping self-statements, and practice relaxation. Build confidence to handle stressors.",
    "Anger Management + CBT": "Identify anger triggers and early warning signs. Use STOP: Stop, Take a breath, Observe, Proceed mindfully.",
}


# ─── Main Recommendation Function ────────────────────────────────

def get_technique_recommendation(
    emotion: str,
    topic: str,
    user_history: Dict
) -> Dict:
    """
    Recommend the best therapy technique for this patient right now.
    Personalizes based on what has worked for them before.
    """

    # Start with emotion-based default
    emotion_techniques = TECHNIQUE_MAP.get(emotion, TECHNIQUE_MAP["neutral"])

    # Try to match topic for more specific technique
    technique_name = emotion_techniques.get(topic) or emotion_techniques.get("default")

    # Personalization: avoid techniques that haven't worked for this user
    worst_techniques = user_history.get("worst_techniques", [])
    best_techniques = user_history.get("best_techniques", [])

    # If current recommendation is in their "bad" list, find alternative
    if technique_name in worst_techniques:
        alternatives = [t for t in emotion_techniques.values() if t not in worst_techniques]
        if alternatives:
            technique_name = alternatives[0]

    # If they have a proven best technique for this emotion, prefer it
    for best in best_techniques:
        if best in emotion_techniques.values():
            technique_name = best
            break

    description = TECHNIQUE_DESCRIPTIONS.get(
        technique_name,
        "Use empathetic listening and open-ended questions to explore the patient's experience."
    )

    return {
        "technique": technique_name,
        "description": description,
        "reason": f"Recommended for {emotion} with {topic} concern",
        "personalized": len(best_techniques) > 0,
    }
