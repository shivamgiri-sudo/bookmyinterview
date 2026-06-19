from __future__ import annotations
import json
from app.tasks.celery_app import celery_app
from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.db.models import AssessmentResponse

logger = get_logger("tasks.scoring")


def _persist_score(response_id: int, score: dict) -> None:
    """Persist score_json on the assessment response row (sync Celery context)."""
    db = SessionLocal()
    try:
        response = db.get(AssessmentResponse, response_id)
        if response:
            response.score_json = json.dumps(score)
            db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=5)
def score_audio_response(self, response_id: int, transcript: str, voice_level: str):
    try:
        logger.info("audio_scoring_started", response_id=response_id)
        # Production: STT + pronunciation/fluency model.
        score = {"fluency": 7.5, "clarity": 8.0, "overall": 7.8, "voice_level": voice_level}
        _persist_score(response_id, score)
        logger.info("audio_scoring_completed", response_id=response_id, score=score)
        return {"response_id": response_id, "score": score}
    except Exception as exc:
        logger.error("audio_scoring_failed", response_id=response_id, error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=5)
def score_video_response(self, response_id: int, transcript: str):
    try:
        logger.info("video_scoring_started", response_id=response_id)
        # Production: transcript + video analysis (no protected attributes).
        score = {"communication": 8.2, "confidence": 7.9, "overall": 8.0}
        _persist_score(response_id, score)
        logger.info("video_scoring_completed", response_id=response_id, score=score)
        return {"response_id": response_id, "score": score}
    except Exception as exc:
        logger.error("video_scoring_failed", response_id=response_id, error=str(exc))
        raise self.retry(exc=exc)
