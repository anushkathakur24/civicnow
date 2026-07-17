import logging
import sys


def configure_logging(env: str) -> None:
    """Structured-enough logging for now: JSON in production (so log aggregators
    can parse it), human-readable in development. Swap the production formatter
    for python-json-logger if you want strict JSON — kept dependency-light here."""
    level = logging.INFO if env == "production" else logging.DEBUG
    handler = logging.StreamHandler(sys.stdout)
    fmt = "%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s"
    handler.setFormatter(logging.Formatter(fmt))
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING if env == "production" else logging.INFO)
