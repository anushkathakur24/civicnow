from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    display_name: str = Field(min_length=1, max_length=120)
    persona_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: str | None
    city: str | None
    persona_id: str | None
    created_at: datetime
    leaderboard_opt_in: bool
    show_real_name_public: bool

    model_config = ConfigDict(from_attributes=True)


class PrivacyUpdate(BaseModel):
    """Both settings are changeable anytime from the profile page — neither
    is a one-time choice made at registration. `show_real_name_public`
    defaults to False (anonymous) independently of `leaderboard_opt_in`:
    opting into the leaderboard doesn't force you to also be named on it."""
    leaderboard_opt_in: bool | None = None
    show_real_name_public: bool | None = None
