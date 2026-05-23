"""
ml/trainer.py — ML Model Retraining Pipeline
Retrains models using real patient feedback data.
Run manually via: POST /api/admin/retrain
Or schedule to run nightly automatically.
"""

import json
import os
from datetime import datetime
from database import get_all_sessions, get_all_ratings

def retrain_models() -> dict:
    """
    Retrain all ML models using collected patient data.
    Called when enough new ratings have been collected.
    """
    sessions = get_all_sessions()
    ratings = get_all_ratings()

    if len(ratings) < 20:
        return {
            "status": "skipped",
            "reason": f"Not enough data yet. Have {len(ratings)} ratings, need at least 20.",
            "tip": "Collect more patient feedback (thumbs up/down) before retraining."
        }

    # Analyze which techniques work best
    technique_stats = _analyze_technique_performance(ratings)

    # Analyze topic patterns
    topic_patterns = _analyze_topic_patterns(sessions)

    # Save insights to file (used by recommender)
    insights = {
        "last_trained": datetime.now().isoformat(),
        "total_sessions": len(sessions),
        "total_ratings": len(ratings),
        "technique_stats": technique_stats,
        "topic_patterns": topic_patterns,
    }

    insights_path = os.path.join(os.path.dirname(__file__), "..", "data", "ml_insights.json")
    os.makedirs(os.path.dirname(insights_path), exist_ok=True)
    with open(insights_path, "w") as f:
        json.dump(insights, f, indent=2)

    print(f"✅ ML models retrained with {len(sessions)} sessions, {len(ratings)} ratings")

    return {
        "status": "success",
        "sessions_used": len(sessions),
        "ratings_used": len(ratings),
        "technique_stats": technique_stats,
        "timestamp": datetime.now().isoformat(),
    }


def _analyze_technique_performance(ratings: list) -> dict:
    """
    Find which therapy techniques get the most 'good' ratings.
    This tells us what's actually working for patients.
    """
    technique_scores = {}

    for rating in ratings:
        technique = rating.get("technique", "unknown")
        is_good = rating.get("rating") == "good"

        if technique not in technique_scores:
            technique_scores[technique] = {"good": 0, "bad": 0, "total": 0}

        technique_scores[technique]["total"] += 1
        if is_good:
            technique_scores[technique]["good"] += 1
        else:
            technique_scores[technique]["bad"] += 1

    # Calculate success rate for each technique
    results = {}
    for technique, scores in technique_scores.items():
        if scores["total"] > 0:
            success_rate = scores["good"] / scores["total"]
            results[technique] = {
                "success_rate": round(success_rate, 2),
                "total_uses": scores["total"],
                "good_ratings": scores["good"],
                "bad_ratings": scores["bad"],
            }

    # Sort by success rate
    return dict(sorted(results.items(), key=lambda x: x[1]["success_rate"], reverse=True))


def _analyze_topic_patterns(sessions: list) -> dict:
    """
    Find common topics, mood improvement patterns, and session insights.
    """
    mood_by_topic = {}
    topic_frequency = {}

    for session in sessions:
        improvement = session.get("moodImprovement", 0)
        messages = session.get("messages", [])

        for msg in messages:
            topic = msg.get("topic", "general")

            if topic not in mood_by_topic:
                mood_by_topic[topic] = []
                topic_frequency[topic] = 0

            mood_by_topic[topic].append(improvement)
            topic_frequency[topic] += 1

    # Calculate average improvement per topic
    topic_stats = {}
    for topic, improvements in mood_by_topic.items():
        if improvements:
            topic_stats[topic] = {
                "avg_improvement": round(sum(improvements) / len(improvements), 2),
                "frequency": topic_frequency[topic],
            }

    return topic_stats


# ─── Scheduler (Optional) ────────────────────────────────────────
# Run this file directly to start nightly retraining:
# python -m ml.trainer

if __name__ == "__main__":
    import schedule
    import time

    print("🕐 ML Trainer scheduler started — retraining every night at 2 AM")

    schedule.every().day.at("02:00").do(retrain_models)

    # Also retrain immediately on startup if enough data
    result = retrain_models()
    print(f"Initial training: {result['status']}")

    while True:
        schedule.run_pending()
        time.sleep(60)
