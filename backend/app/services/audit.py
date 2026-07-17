"""Real, non-simulated content-change history.

This is deliberately thin: it writes one AuditLog row per genuine
content-authoring event (issue creation, a timeline event being added, an
editorial correction, etc). It does NOT claim events happened that didn't —
there is no automated editorial-review workflow yet, so seed-data entries are
logged with action names like "issue.created" / "timeline_event.added"
(what actually happened: content was authored and committed), never
"issue.reviewed" or "issue.approved" (which would imply a review step that
doesn't exist). See CivicNow product principle: version history must be
honest about what it represents, same as every other piece of displayed data.
"""
from app.models.system import AuditLog


def log_change(db, action: str, target_type: str, target_id: str, actor_id: str | None = None, metadata: dict | None = None) -> AuditLog:
    """Create (but do not commit) an AuditLog row. Caller controls the
    transaction boundary so this can be batched with the rest of a seed/
    editorial operation and committed once."""
    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        log_metadata=metadata,
    )
    db.add(entry)
    return entry
