"""add government_bodies, link responsible bodies, add action metadata

Purely additive migration: new table + nullable columns only. Written this
way deliberately because this schema is already live in production with
real registered users and action_submissions — nothing here drops or
alters an existing column, so it's safe to run against that database
without any data-migration/backfill step.

Revision ID: a1b2c3d4e5f6
Revises: 7243bad14095
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = '7243bad14095'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'government_bodies',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('body_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    # batch_alter_table (copy-and-move under the hood) rather than a bare
    # add_column + create_foreign_key: SQLite (used locally/in CI) can't
    # ALTER a table to add a foreign-key constraint in place, only Postgres
    # (production) can. Batch mode works correctly on both, so the migration
    # is portable rather than only tested against production's DB engine.
    with op.batch_alter_table('issue_responsible_bodies') as batch_op:
        batch_op.add_column(sa.Column('government_body_id', sa.String(length=36), nullable=True))
        batch_op.create_foreign_key(
            'fk_responsible_body_government_body', 'government_bodies',
            ['government_body_id'], ['id'],
        )
    with op.batch_alter_table('action_definitions') as batch_op:
        batch_op.add_column(sa.Column('remote_or_in_person', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('required_skills', sa.JSON(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('action_definitions') as batch_op:
        batch_op.drop_column('required_skills')
        batch_op.drop_column('remote_or_in_person')
    with op.batch_alter_table('issue_responsible_bodies') as batch_op:
        batch_op.drop_constraint('fk_responsible_body_government_body', type_='foreignkey')
        batch_op.drop_column('government_body_id')
    op.drop_table('government_bodies')
