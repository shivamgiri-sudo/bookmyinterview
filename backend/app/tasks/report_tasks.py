from __future__ import annotations
from app.tasks.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger("tasks.report")

@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def generate_assessment_report(self, assessment_id: int):
    try:
        logger.info("report_generation_started", assessment_id=assessment_id)
        # Production: aggregate scores, generate PDF, upload to object storage.
        report_url = f"https://storage.example.com/reports/{assessment_id}.pdf"
        logger.info("report_generation_completed", assessment_id=assessment_id, report_url=report_url)
        return {"assessment_id": assessment_id, "report_url": report_url}
    except Exception as exc:
        logger.error("report_generation_failed", assessment_id=assessment_id, error=str(exc))
        raise self.retry(exc=exc)
