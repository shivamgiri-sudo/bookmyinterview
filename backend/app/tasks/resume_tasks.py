from __future__ import annotations
from app.tasks.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger("tasks.resume")

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def parse_resume(self, candidate_id: int, resume_url: str):
    """Parse resume asynchronously via adapter."""
    try:
        logger.info("resume_parse_started", candidate_id=candidate_id, resume_url=resume_url)
        # Production: call resume parser adapter.
        parsed_profile = {
            "name": "Candidate Name",
            "skills": ["Communication", "Excel", "Leadership"],
            "experience_years": 5,
            "notice_period": "30 days",
        }
        # Persist result via repository (kept minimal for demo).
        logger.info("resume_parse_completed", candidate_id=candidate_id)
        return {"candidate_id": candidate_id, "parsed_profile": parsed_profile}
    except Exception as exc:
        logger.error("resume_parse_failed", candidate_id=candidate_id, error=str(exc))
        raise self.retry(exc=exc)
