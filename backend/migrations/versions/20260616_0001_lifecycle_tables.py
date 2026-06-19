"""lifecycle tables

Revision ID: 20260616_0001
Revises: 
Create Date: 2026-06-16
"""
from __future__ import annotations
from alembic import op
import sqlalchemy as sa

revision = "20260616_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "account_challenges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("challenge_value", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("purpose", sa.String(length=80), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("challenge_value"),
    )
    op.create_index("ix_account_challenges_challenge_value", "account_challenges", ["challenge_value"])
    op.create_index("ix_account_challenges_email", "account_challenges", ["email"])
    op.create_index("ix_account_challenges_purpose", "account_challenges", ["purpose"])
    op.create_table(
        "session_grants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("grant_value", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=80), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=True),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("grant_value"),
    )
    op.create_index("ix_session_grants_grant_value", "session_grants", ["grant_value"])
    op.create_index("ix_session_grants_email", "session_grants", ["email"])
    op.create_table(
        "session_blocks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("access_value", sa.String(length=1024), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("access_value"),
    )
    op.create_index("ix_session_blocks_access_value", "session_blocks", ["access_value"])


def downgrade() -> None:
    op.drop_index("ix_session_blocks_access_value", table_name="session_blocks")
    op.drop_table("session_blocks")
    op.drop_index("ix_session_grants_email", table_name="session_grants")
    op.drop_index("ix_session_grants_grant_value", table_name="session_grants")
    op.drop_table("session_grants")
    op.drop_index("ix_account_challenges_purpose", table_name="account_challenges")
    op.drop_index("ix_account_challenges_email", table_name="account_challenges")
    op.drop_index("ix_account_challenges_challenge_value", table_name="account_challenges")
    op.drop_table("account_challenges")
