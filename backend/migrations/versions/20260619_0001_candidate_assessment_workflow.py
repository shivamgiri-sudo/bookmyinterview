"""candidate assessment workflow schema

Revision ID: 20260619_0001
Revises: 20260616_0001
Create Date: 2026-06-19
"""
from __future__ import annotations
from alembic import op
import sqlalchemy as sa

revision = "20260619_0001"
down_revision = "20260616_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ---- Candidate profile extension ----
    op.create_table(
        "candidate_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("resume_url", sa.String(length=500), nullable=True),
        sa.Column("resume_hash", sa.String(length=64), nullable=True),
        sa.Column("parsed_profile_json", sa.Text(), server_default="{}"),
        sa.Column("skills_json", sa.Text(), server_default="[]"),
        sa.Column("experience_years", sa.Float(), nullable=True),
        sa.Column("current_ctc", sa.Integer(), nullable=True),
        sa.Column("expected_ctc", sa.Integer(), nullable=True),
        sa.Column("notice_period_days", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_candidate_profiles_candidate_id", "candidate_profiles", ["candidate_id"])

    # ---- Assessment configuration ----
    op.create_table(
        "assessment_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("role_family", sa.String(length=120), nullable=False),
        sa.Column("designation", sa.String(length=160), nullable=False),
        sa.Column("seniority_level", sa.String(length=80), nullable=True),
        sa.Column("industry", sa.String(length=120), nullable=True),
        sa.Column("default_path_json", sa.Text(), server_default="[]"),
        sa.Column("passing_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_assessment_templates_role_family", "assessment_templates", ["role_family"])
    op.create_index("ix_assessment_templates_designation", "assessment_templates", ["designation"])

    op.create_table(
        "assessment_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("condition_field", sa.String(length=120), nullable=False),
        sa.Column("operator", sa.String(length=40), nullable=False),
        sa.Column("threshold_value", sa.Text(), server_default="{}"),
        sa.Column("assessment_to_add", sa.String(length=120), nullable=False),
        sa.Column("priority", sa.Integer(), server_default="0"),
        sa.Column("active_status", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )

    op.create_table(
        "job_assessment_paths",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("job_requests.id"), nullable=False),
        sa.Column("path_json", sa.Text(), server_default="[]"),
        sa.Column("generated_by", sa.String(length=60), nullable=True),
        sa.Column("version", sa.Integer(), server_default="1"),
        sa.Column("modification_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_job_assessment_paths_job_id", "job_assessment_paths", ["job_id"])

    op.create_table(
        "trait_questions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trait_id", sa.String(length=80), nullable=False),
        sa.Column("role_family", sa.String(length=120), nullable=True),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("scoring_rubric_json", sa.Text(), server_default="{}"),
        sa.Column("validation_status", sa.String(length=60), server_default="pending"),
        sa.Column("active_status", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_trait_questions_trait_id", "trait_questions", ["trait_id"])
    op.create_index("ix_trait_questions_role_family", "trait_questions", ["role_family"])

    # ---- Extend assessments ----
    op.add_column("assessments", sa.Column("path_id", sa.Integer(), sa.ForeignKey("job_assessment_paths.id"), nullable=True))
    op.add_column("assessments", sa.Column("started_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("assessments", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("assessments", sa.Column("shortlisted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("assessments", sa.Column("shortlisted_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True))
    op.add_column("assessments", sa.Column("client_feedback_json", sa.Text(), server_default="{}"))
    op.add_column("assessments", sa.Column("client_decision", sa.String(length=40), nullable=True))
    op.add_column("assessments", sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True))

    # ---- Responses and scoring ----
    op.create_table(
        "assessment_responses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("trait_questions.id"), nullable=True),
        sa.Column("question_text", sa.Text(), nullable=True),
        sa.Column("response_type", sa.String(length=20), server_default="text"),
        sa.Column("media_url", sa.String(length=500), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("response_text", sa.Text(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("score_json", sa.Text(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_assessment_responses_assessment_id", "assessment_responses", ["assessment_id"])

    op.create_table(
        "assessment_scores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id"), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("raw_score", sa.Float(), nullable=True),
        sa.Column("weighted_score", sa.Float(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("scored_by", sa.String(length=60), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_assessment_scores_assessment_id", "assessment_scores", ["assessment_id"])

    # ---- Interview scheduling ----
    op.create_table(
        "interview_slots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("job_requests.id"), nullable=False),
        sa.Column("interviewer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("mode", sa.String(length=40), server_default="digital"),
        sa.Column("status", sa.String(length=40), server_default="available"),
        sa.Column("version", sa.Integer(), server_default="1"),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_interview_slots_tenant_id", "interview_slots", ["tenant_id"])
    op.create_index("ix_interview_slots_job_id", "interview_slots", ["job_id"])
    op.create_index("ix_interview_slots_interviewer_id", "interview_slots", ["interviewer_id"])
    op.create_index("ix_interview_slots_start_time", "interview_slots", ["start_time"])
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_slots_available ON interview_slots (status) WHERE status = 'available'")

    op.create_table(
        "interview_bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("slot_id", sa.Integer(), sa.ForeignKey("interview_slots.id"), nullable=False, unique=True),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id"), nullable=True),
        sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("job_requests.id"), nullable=False),
        sa.Column("meeting_link", sa.String(length=500), nullable=True),
        sa.Column("report_url", sa.String(length=500), nullable=True),
        sa.Column("reminder_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=40), server_default="booked"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_interview_bookings_tenant_id", "interview_bookings", ["tenant_id"])
    op.create_index("ix_interview_bookings_candidate_id", "interview_bookings", ["candidate_id"])
    op.create_index("ix_interview_bookings_job_id", "interview_bookings", ["job_id"])
    op.create_index("ix_interview_bookings_assessment_id", "interview_bookings", ["assessment_id"])


def downgrade() -> None:
    op.drop_table("interview_bookings")
    op.drop_table("interview_slots")
    op.drop_table("assessment_scores")
    op.drop_table("assessment_responses")
    op.drop_column("assessments", "decided_at")
    op.drop_column("assessments", "client_decision")
    op.drop_column("assessments", "client_feedback_json")
    op.drop_column("assessments", "shortlisted_by")
    op.drop_column("assessments", "shortlisted_at")
    op.drop_column("assessments", "completed_at")
    op.drop_column("assessments", "started_at")
    op.drop_column("assessments", "path_id")
    op.drop_table("trait_questions")
    op.drop_table("job_assessment_paths")
    op.drop_table("assessment_rules")
    op.drop_table("assessment_templates")
    op.drop_table("candidate_profiles")
