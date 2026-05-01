import logging
import traceback
from config.settings import ENV

logger = logging.getLogger()
logger.setLevel(logging.INFO)

if logger.hasHandlers():
    logger.handlers.clear()

if ENV == "development":
    from colorlog import ColoredFormatter
    handler = logging.StreamHandler()

    formatter = ColoredFormatter(
        "%(log_color)s%(levelname)s - %(message)s",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "bold_red",
        }
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)
else:
    # Production → clean logs
    logger.setLevel(logging.INFO)

def log_exception(exc: Exception, context: str = None):
    tb = traceback.format_exc()
    header = f"❌ ERROR: {context}" if context else "❌ ERROR"
    logger.error("%s\n%s", header, tb)
