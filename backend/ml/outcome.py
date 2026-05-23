"""
ml/outcome.py — Outcome Predictor & Risk Assessment
Predicts:
- Risk level (low/medium/high) — should we escalate to human therapist?
- Whether AI therapy is enough or human referral is needed
- Session quality prediction
"""

from typing import Dict
from database import get_user_history

# ─── Risk Assessment ──────────────────────────────────────────────

HIGH_RISK_SIGNALS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self harm", "self-harm", "cutting", "hurt myself", "not worth living",
    "better off dead", "khud kushi", "marna chahta", "jina nahi chahta"
]

MEDIUM_RISK_SIGNALS = [
    "can't go on", "give up on life", "no point anymore", "nobody cares if i die",
    "want to disappear", "done with everything", "escape from life"
]

# When to refer to human therapist
REFERRAL_TRIGGERS = {
    "high_risk": True,           # Always refer if high risk
    "many_sessions_no_improvement": True,  # 8+ sessions, avg improvement < 1
    "trauma": True,              # Trauma always needs human therapist
    "psychosis_signals": True,   # Hearing voices, delusions
}

PSYCHOSIS_SIGNALS = [
    "hearing voices", "voices in my head", "they are watching me",
    "someone is controlling", "i am not real", "seeing things", "hallucinating"
]


def predict_outcome(message: str, emotion: str, history: Dict) -> Dict:
    """
    Assess risk and predict whether this patient needs human referral.
    """
    text_lower = message.lower()

    # ── Risk Detection ──────────────────────────────────────────
    risk_level = "low"

    for signal in HIGH_RISK_SIGNALS:
        if signal in text_lower:
            risk_level = "high"
            break

    if risk_level == "low":
        for signal in MEDIUM_RISK_SIGNALS:
            if signal in text_lower:
                risk_level = "medium"
                break

    # ── Psychosis Check ─────────────────────────────────────────
    has_psychosis_signal = any(s in text_lower for s in PSYCHOSIS_SIGNALS)

    # ── Should Refer to Human? ──────────────────────────────────
    should_refer = False
    refer_reason = None

    if risk_level == "high":
        should_refer = True
        refer_reason = "High risk signals detected — immediate human support needed"

    elif has_psychosis_signal:
        should_refer = True
        refer_reason = "Psychosis signals detected — requires psychiatric evaluation"

    elif emotion == "trauma":
        should_refer = True
        refer_reason = "Trauma requires specialized human therapist"

    elif history.get("session_count", 0) >= 8 and history.get("avg_improvement", 0) < 1:
        should_refer = True
        refer_reason = "Limited improvement after multiple sessions — consider human therapist"

    # ── Progress Assessment ─────────────────────────────────────
    session_count = history.get("session_count", 0)
    avg_improvement = history.get("avg_improvement", 0)

    if session_count == 0:
        progress = "new_user"
    elif avg_improvement >= 3:
        progress = "excellent"
    elif avg_improvement >= 1:
        progress = "good"
    elif avg_improvement >= 0:
        progress = "stable"
    else:
        progress = "declining"

    # ── Response Instructions for Claude ───────────────────────
    claude_instructions = _build_claude_instructions(
        risk_level, should_refer, refer_reason, emotion, progress, history
    )

    return {
        "risk_level": risk_level,
        "should_refer": should_refer,
        "refer_reason": refer_reason,
        "has_psychosis_signal": has_psychosis_signal,
        "progress": progress,
        "claude_instructions": claude_instructions,
    }


def _build_claude_instructions(
    risk_level: str,
    should_refer: bool,
    refer_reason: str,
    emotion: str,
    progress: str,
    history: Dict
) -> str:
    """Build specific instructions for Claude based on ML assessment."""

    instructions = []

    if risk_level == "high":
        instructions.append(
            "⚠️ HIGH RISK: Immediately provide these crisis resources: "
            "Umang helpline Pakistan 0317-4288665 and 051-111-741-741. "
            "Express deep care. Do NOT leave this topic. Gently assess their safety plan."
        )

    elif risk_level == "medium":
        instructions.append(
            "MEDIUM RISK: Acknowledge their pain deeply. Ask directly but gently: "
            "'Are you having any thoughts of hurting yourself?' "
            "Provide Umang helpline if they confirm."
        )

    if should_refer and refer_reason:
        instructions.append(
            f"REFERRAL RECOMMENDED ({refer_reason}): "
            "Warmly suggest seeing one of our verified Faisalabad therapists. "
            "Say something like: 'What you're going through deserves the full support of a trained professional.'"
        )

    if progress == "declining":
        instructions.append(
            "This patient has shown declining mood across sessions. "
            "Be extra warm and supportive. Ask what has changed recently."
        )
    elif progress == "excellent":
        instructions.append(
            "This patient is making excellent progress! "
            "Acknowledge their growth and reinforce what's working."
        )

    session_count = history.get("session_count", 0)
    if session_count == 0:
        instructions.append(
            "This is a NEW patient. Focus on building rapport and making them feel safe. "
            "Don't rush into techniques — just listen and validate first."
        )
    elif session_count >= 5:
        instructions.append(
            f"This patient has had {session_count} sessions. "
            "You can reference growth over time and reinforce patterns you've noticed."
        )

    return " | ".join(instructions) if instructions else "Continue with standard therapeutic approach."
