"""
database.py — Simple JSON file database.
No PostgreSQL setup needed to get started.
All data saved to backend/data/ folder.
Swap this file later for PostgreSQL/MongoDB when ready.
"""

import json
import os
from datetime import datetime
from typing import Optional

# Data folder — created automatically
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")
RATINGS_FILE = os.path.join(DATA_DIR, "ratings.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
APPOINTMENTS_FILE = os.path.join(DATA_DIR, "appointments.json")

def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def _read_json(filepath: str) -> list:
    _ensure_data_dir()
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []

def _write_json(filepath: str, data: list):
    _ensure_data_dir()
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ─── Sessions ────────────────────────────────────────────────────

def save_session(session: dict):
    sessions = _read_json(SESSIONS_FILE)
    # Update if exists, else append
    idx = next((i for i, s in enumerate(sessions) if s.get("sessionId") == session["sessionId"]), -1)
    if idx >= 0:
        sessions[idx] = session
    else:
        sessions.append(session)
    _write_json(SESSIONS_FILE, sessions)


def get_all_sessions() -> list:
    return _read_json(SESSIONS_FILE)


def get_sessions_by_user(user_id: str) -> list:
    sessions = _read_json(SESSIONS_FILE)
    return [s for s in sessions if s.get("userId") == user_id]


# ─── Ratings ─────────────────────────────────────────────────────

def save_rating(rating: dict):
    ratings = _read_json(RATINGS_FILE)
    ratings.append(rating)
    _write_json(RATINGS_FILE, ratings)


def get_all_ratings() -> list:
    return _read_json(RATINGS_FILE)


def get_ratings_by_technique(technique: str) -> list:
    ratings = _read_json(RATINGS_FILE)
    return [r for r in ratings if r.get("technique") == technique]


# ─── User History (computed) ─────────────────────────────────────

def get_user_history(user_id: str) -> dict:
    """
    Compute stats from a user's past sessions.
    Used to personalize ML recommendations.
    """
    sessions = get_sessions_by_user(user_id)

    if not sessions:
        return {
            "session_count": 0,
            "avg_improvement": 0,
            "avg_mood_before": 5,
            "avg_mood_after": 5,
            "common_topics": [],
            "best_techniques": [],
            "worst_techniques": [],
            "last_session": None,
            "total_messages": 0,
        }

    improvements = [s.get("moodImprovement", 0) for s in sessions]
    moods_before = [s.get("moodBefore", 5) for s in sessions]
    moods_after = [s.get("moodAfter", 5) for s in sessions]

    # Collect topics from all sessions
    all_topics = []
    for s in sessions:
        for msg in s.get("messages", []):
            topic = msg.get("topic")
            if topic:
                all_topics.append(topic)

    # Find most common topics
    topic_counts = {}
    for t in all_topics:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    common_topics = sorted(topic_counts, key=topic_counts.get, reverse=True)[:3]

    # Best/worst techniques from ratings
    ratings = get_all_ratings()
    user_ratings = [r for r in ratings if any(
        r.get("sessionId") == s.get("sessionId") for s in sessions
    )]
    good_techniques = [r["technique"] for r in user_ratings if r.get("rating") == "good"]
    bad_techniques = [r["technique"] for r in user_ratings if r.get("rating") == "bad"]

    return {
        "session_count": len(sessions),
        "avg_improvement": round(sum(improvements) / len(improvements), 1),
        "avg_mood_before": round(sum(moods_before) / len(moods_before), 1),
        "avg_mood_after": round(sum(moods_after) / len(moods_after), 1),
        "common_topics": common_topics,
        "best_techniques": list(set(good_techniques))[:3],
        "worst_techniques": list(set(bad_techniques))[:3],
        "last_session": sessions[-1].get("timestamp") if sessions else None,
        "total_messages": sum(len(s.get("messages", [])) for s in sessions),
    }


# ─── Appointments ────────────────────────────────────────────────

def save_appointment(appointment: dict):
    appointments = _read_json(APPOINTMENTS_FILE)
    appointments.append(appointment)
    _write_json(APPOINTMENTS_FILE, appointments)


def get_appointments_by_user(user_id: str) -> list:
    appointments = _read_json(APPOINTMENTS_FILE)
    return [a for a in appointments if a.get("userId") == user_id]
