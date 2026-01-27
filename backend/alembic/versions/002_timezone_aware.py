"""update datetime columns to timezone aware

Revision ID: 002_timezone_aware
Revises: 6a4bd2e36415
Create Date: 2026-01-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_timezone_aware'
down_revision = '6a4bd2e36415'  # Changed from '001_initial_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Tours table - convert DateTime to timezone-aware
    op.alter_column('tours', 'date',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=False)
    
    op.alter_column('tours', 'created_at',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=True)
    
    op.alter_column('tours', 'updated_at',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=True)


def downgrade():
    # Revert back to timezone-naive
    op.alter_column('tours', 'date',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=False)
    
    op.alter_column('tours', 'created_at',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=True)
    
    op.alter_column('tours', 'updated_at',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=True)