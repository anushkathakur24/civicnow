from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AuditLogOut(BaseModel):
    """A single, real entry in an issue's version history. `actor_id` is the
    account that made the change (nullable — historical seed entries predate
    per-user attribution being wired up everywhere); `action`/`metadata`
    describe what actually happened, never a fabricated review/approval step
    that didn't occur."""
    action: str
    target_type: str | None
    target_id: str | None
    log_metadata: dict | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
