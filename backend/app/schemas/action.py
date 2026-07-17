from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ActionSubmitRequest(BaseModel):
    action_definition_id: int
    idempotency_key: str = Field(min_length=8, max_length=100)
    evidence_url: str | None = None
    reference_number: str | None = None


class ActionSubmissionOut(BaseModel):
    id: str
    action_definition_id: int
    verification_state: str
    points_awarded: int
    submitted_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ScoreBreakdown(BaseModel):
    impact_score: int
    tier: str
    issues_supported: int
    rti_grievance_count: int
    volunteering_count: int
    awareness_count: int
    donation_count: int
    advocacy_count: int
    current_streak: int
