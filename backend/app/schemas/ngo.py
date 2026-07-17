from pydantic import BaseModel, EmailStr, ConfigDict


class NGOOut(BaseModel):
    id: str
    name: str
    darpan_id: str | None
    city: str | None
    website: str | None
    focus_areas: list[str] | None
    verified: bool
    model_config = ConfigDict(from_attributes=True)


class NGOApplyIn(BaseModel):
    """What we ask an NGO for at application time. Deliberately minimal —
    darpan_id is optional here because plenty of real orgs won't have it
    handy on a first submission; verification (checking it against the
    NGO Darpan registry) happens as a manual follow-up, not automatically,
    which is why every application lands as `verified=False` until a human
    confirms it."""
    name: str
    contact_email: EmailStr
    city: str | None = None
    website: str | None = None
    darpan_id: str | None = None
    focus_areas: list[str] | None = None
    message: str | None = None
