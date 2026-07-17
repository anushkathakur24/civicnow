from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator


class SourceOut(BaseModel):
    title: str
    url: str
    model_config = ConfigDict(from_attributes=True)

class TimelineEventOut(BaseModel):
    event_date: date
    event_text: str
    model_config = ConfigDict(from_attributes=True)

class PromiseOut(BaseModel):
    made_by: str
    promise_text: str
    deadline_date: date | None
    status: str
    model_config = ConfigDict(from_attributes=True)

class ActionDefinitionOut(BaseModel):
    id: int
    action_text: str
    impact: str
    category: str
    verification_method: str
    base_points: int
    effort_hours: float | None
    cost_inr: float | None
    recurring: bool
    model_config = ConfigDict(from_attributes=True)

class IssueSummary(BaseModel):
    id: str
    title: str
    category: str
    urgency: str
    status: str
    summary: str
    model_config = ConfigDict(from_attributes=True)

class IssueDetail(IssueSummary):
    current_ask: str | None
    accountability_mechanism: str | None
    sensitive_note: str | None
    timeline: list[TimelineEventOut] = []
    promises: list[PromiseOut] = []
    sources: list[SourceOut] = []
    responsible_bodies: list[str] = []
    model_config = ConfigDict(from_attributes=True)

    @field_validator("responsible_bodies", mode="before")
    @classmethod
    def _extract_body_names(cls, v):
        # `Issue.responsible_bodies` is a relationship of ResponsibleBody ORM
        # objects, not plain strings — pull `.body_name` out before Pydantic
        # validates the field, so IssueDetail.model_validate(issue) works
        # directly instead of needing a manual override in the router.
        return [b.body_name if hasattr(b, "body_name") else b for b in v]
