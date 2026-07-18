import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.api.v1.routers import health, auth, issues, actions, users, leaderboard, ngos

settings = get_settings()
configure_logging(settings.ENV)
logger = logging.getLogger("civicnow")

if settings.SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.ENV, traces_sample_rate=0.1)
    logger.info("sentry_initialized")

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

app = FastAPI(
    title="CivicNow API",
    version="1.0.0",
    description="India's civic action platform — issue tracking, personalized actions, verified Impact Score.",
    docs_url="/docs" if not settings.is_production else None,  # don't expose Swagger publicly in prod
    redoc_url=None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Structured, consistent error shape instead of FastAPI's default — easier
    # for the Next.js frontend to handle uniformly, and never leaks a stack trace.
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "validation_error", "detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_exception", extra={"path": request.url.path})
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "internal_server_error", "detail": "Something went wrong. This has been logged."},
    )


app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(issues.router, prefix="/api/v1")
app.include_router(actions.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(leaderboard.router, prefix="/api/v1")
app.include_router(ngos.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"service": "CivicNow API", "status": "ok", "docs": "/docs" if not settings.is_production else "disabled in production"}
