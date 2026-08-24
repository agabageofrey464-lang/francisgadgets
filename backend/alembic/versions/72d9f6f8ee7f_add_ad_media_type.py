"""add ad media type and rename image_url to media_url

Revision ID: 72d9f6f8ee7f
Revises: 7afb2b1fd73f
Create Date: 2026-08-18 16:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "72d9f6f8ee7f"
down_revision = "7afb2b1fd73f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("ads", "image_url", new_column_name="media_url")

    ad_media_type = sa.Enum("IMAGE", "VIDEO", name="ad_media_type")
    ad_media_type.create(op.get_bind())
    op.add_column(
        "ads",
        sa.Column("media_type", ad_media_type, nullable=False, server_default="IMAGE"),
    )
    op.alter_column("ads", "media_type", server_default=None)


def downgrade() -> None:
    op.drop_column("ads", "media_type")
    sa.Enum(name="ad_media_type").drop(op.get_bind())
    op.alter_column("ads", "media_url", new_column_name="image_url")
