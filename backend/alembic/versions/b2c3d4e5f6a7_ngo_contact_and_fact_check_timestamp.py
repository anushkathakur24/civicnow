"""add ngo contact_email, application_message, and issue last_fact_checked_at

Purely additive: three nullable columns, no drops/alters of existing data.
Same production-safety reasoning as a1b2c3d4e5f6 — this schema is live with
real registered users.

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa


revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('ngos') as batch_op:
        batch_op.add_column(sa.Column('contact_email', sa.String(length=255), nullable=True))
        # What the applicant told us about their org at /ngos/apply — kept so
        # the human doing manual Darpan verification actually has context,
        # instead of the "what does your org do?" field being collected and
        # then silently discarded.
        batch_op.add_column(sa.Column('application_message', sa.Text(), nullable=True))
    with op.batch_alter_table('issues') as batch_op:
        batch_op.add_column(sa.Column('last_fact_checked_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('issues') as batch_op:
        batch_op.drop_column('last_fact_checked_at')
    with op.batch_alter_table('ngos') as batch_op:
        batch_op.drop_column('application_message')
        batch_op.drop_column('contact_email')
