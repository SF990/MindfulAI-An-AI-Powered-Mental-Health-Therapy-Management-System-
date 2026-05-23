from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from datetime import datetime
import uuid

from ml.classifier import analyze_message
from ml.recommender import get_technique_recommendation
from ml.outcome import predict_outcome
from database import save_session, get_user_history, save_rating, get_all_sessions, save_appointment, get_appointments_by_user

app = FastAPI(title="MindfulAI Backend", version="1.0.0")

# Allow React (Vite) to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Models ───────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    message: str
    userId: Optional[str] = "anonymous"
    sessionId: Optional[str] = None
    messageCount: Optional[int] = 0

class SaveSessionRequest(BaseModel):
    sessionId: str
    userId: str
    userName: Optional[str] = "Anonymous"
    messages: List[dict]
    moodBefore: Optional[int] = 5
    moodAfter: Optional[int] = 5
    duration: Optional[int] = 0

class RatingRequest(BaseModel):
    sessionId: str
    messageIndex: int
    rating: str  # "good" or "bad"
    aiResponse: str
    userMessage: str
    technique: Optional[str] = ""

class MoodRequest(BaseModel):
    userId: str
    sessionId: str
    mood: int  # 1-10

class AppointmentRequest(BaseModel):
    therapistId: int
    therapistName: str
    userId: str
    userName: str
    date: str
    time: str
    mode: str
    reason: Optional[str] = ""
    fee: float

# ─── Routes ──────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "MindfulAI Python backend is running! 🌿"}


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    """
    Main ML endpoint — called before every Claude API call.
    Returns emotion, topic, recommended technique, risk level.
    """
    try:
        # Run ML analysis on the message
        emotion_data = analyze_message(req.message)

        # Get user history for personalization
        history = get_user_history(req.userId)

        # Recommend best therapy technique for this patient
        technique = get_technique_recommendation(
            emotion=emotion_data["emotion"],
            topic=emotion_data["primary_topic"],
            user_history=history
        )

        # Predict outcome / risk
        outcome = predict_outcome(
            message=req.message,
            emotion=emotion_data["emotion"],
            history=history
        )

        return {
            "emotion": emotion_data["emotion"],
            "emotion_confidence": round(emotion_data["confidence"] * 100),
            "primary_topic": emotion_data["primary_topic"],
            "all_topics": emotion_data["all_topics"],
            "recommended_technique": technique["technique"],
            "technique_reason": technique["reason"],
            "risk_level": outcome["risk_level"],
            "should_refer": outcome["should_refer"],
            "session_count": history.get("session_count", 0),
            "avg_improvement": history.get("avg_improvement", 0),
        }

    except Exception as e:
        print(f"Analysis error: {e}")
        # Return safe defaults if ML fails — app still works
        return {
            "emotion": "neutral",
            "emotion_confidence": 50,
            "primary_topic": "general",
            "all_topics": ["general"],
            "recommended_technique": "Active Listening",
            "technique_reason": "Default supportive approach",
            "risk_level": "low",
            "should_refer": False,
            "session_count": 0,
            "avg_improvement": 0,
        }


@app.post("/api/sessions")
def save_session_route(req: SaveSessionRequest):
    """Save a completed therapy session to the database."""
    try:
        session = {
            "sessionId": req.sessionId,
            "userId": req.userId,
            "userName": req.userName,
            "messages": req.messages,
            "moodBefore": req.moodBefore,
            "moodAfter": req.moodAfter,
            "moodImprovement": req.moodAfter - req.moodBefore,
            "duration": req.duration,
            "messageCount": len(req.messages),
            "timestamp": datetime.now().isoformat(),
        }
        save_session(session)
        return {"status": "saved", "sessionId": req.sessionId}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rating")
def save_rating_route(req: RatingRequest):
    """Save thumbs up/down rating on an AI response — this is training data."""
    try:
        rating_data = {
            "id": str(uuid.uuid4()),
            "sessionId": req.sessionId,
            "messageIndex": req.messageIndex,
            "rating": req.rating,  # "good" or "bad"
            "aiResponse": req.aiResponse,
            "userMessage": req.userMessage,
            "technique": req.technique,
            "timestamp": datetime.now().isoformat(),
        }
        save_rating(rating_data)
        return {"status": "rating saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{user_id}")
def get_history(user_id: str):
    """Get a user's session history and stats."""
    try:
        history = get_user_history(user_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/sessions")
def get_sessions():
    """Admin: Get all sessions for ML training overview."""
    try:
        sessions = get_all_sessions()
        return {
            "total_sessions": len(sessions),
            "sessions": sessions[-20:]  # Return last 20
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/retrain")
def retrain():
    """Manually trigger ML model retraining."""
    try:
        from ml.trainer import retrain_models
        result = retrain_models()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/appointments")
def book_appointment(req: AppointmentRequest):
    """Book a therapist appointment."""
    try:
        appt = {
            "id": str(uuid.uuid4()),
            "therapistId": req.therapistId,
            "therapistName": req.therapistName,
            "userId": req.userId,
            "userName": req.userName,
            "date": req.date,
            "time": req.time,
            "mode": req.mode,
            "reason": req.reason,
            "fee": req.fee,
            "bookedAt": datetime.now().isoformat(),
            "status": "pending"
        }
        save_appointment(appt)
        return {"status": "booked", "appointment": appt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/appointments/{user_id}")
def get_user_appointments(user_id: str):
    """Get all appointments for a specific user."""
    try:
        return get_appointments_by_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
