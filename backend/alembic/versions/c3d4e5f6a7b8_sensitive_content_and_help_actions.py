"""add sensitive_content/support_note_visible flags and issue_help_actions table

Purely additive: two nullable-safe boolean columns (with server defaults so
existing rows backfill without a data migration) and one new table. No
drops/alters of existing data — same production-safety reasoning as
a1b2c3d4e5f6 and b2c3d4e5f6a7.

`sensitive_note` (free text) is left untouched; `sensitive_content` is the
new, separate boolean gate for the standardized "Need support?" callout
component (see frontend/components/SupportNotice.tsx) — the callout's actual
helpline copy now lives in one shared frontend constant, not per-issue text,
per the "Standardize Support Notices & Sourced Action Lists" content-schema
change.

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa


revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('issues') as batch_op:
        batch_op.add_column(
            sa.Column('sensitive_content', sa.Boolean(), nullable=False, server_default=sa.false())
        )
        batch_op.add_column(
            sa.Column('support_note_visible', sa.Boolean(), nullable=False, server_default=sa.true())
        )

    op.create_table(
        'issue_help_actions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('issue_id', sa.String(length=80), sa.ForeignKey('issues.id', ondelete='CASCADE'), index=True),
        sa.Column('action_type', sa.String(length=30), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source_urls', sa.JSON(), nullable=False),
        sa.Column('last_verified', sa.Date(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('still_active', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index('ix_help_action_issue', 'issue_help_actions', ['issue_id'])


def downgrade() -> None:
    op.drop_index('ix_help_action_issue', table_name='issue_help_actions')
    op.drop_table('issue_help_actions')
    with op.batch_alter_table('issues') as batch_op:
        batch_op.drop_column('support_note_visible')
        batch_op.drop_column('sensitive_content')
