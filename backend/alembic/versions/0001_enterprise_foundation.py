"""enterprise foundation schema

Revision ID: 0001_enterprise_foundation
Revises: 
Create Date: 2026-06-16
"""

from alembic import op

revision = "0001_enterprise_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Uses the SQL bootstrap as the single source for the first schema baseline.
    with open("db_bootstrap.sql", "r", encoding="utf-8") as schema_file:
        op.execute(schema_file.read())


def downgrade():
    op.execute("DROP TABLE IF EXISTS human_review_queue")
    op.execute("DROP TABLE IF EXISTS audit_logs")
    op.execute("DROP TABLE IF EXISTS integration_credentials")
    op.execute("DROP TABLE IF EXISTS assessments")
    op.execute("DROP TABLE IF EXISTS candidates")
    op.execute("DROP TABLE IF EXISTS job_requests")
    op.execute("DROP TABLE IF EXISTS users")
    op.execute("DROP TABLE IF EXISTS tenants")
