import logging
import traceback
import boto3
from config import settings

def get_logger():
    """
    Configures and returns a logger instance.
    """
    logger = logging.getLogger()
    
    # Avoid duplicate handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    if settings.ENV == "development":
        try:
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
            logger.setLevel(logging.DEBUG)
        except ImportError:
            handler = logging.StreamHandler()
            formatter = logging.Formatter("%(levelname)s - %(message)s")
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(logging.DEBUG)
    else:
        # Production → clean logs
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

    return logger

logger = get_logger()

def log_exception(exc: Exception, context: str = None):
    """
    Log a full stack trace for easier debugging.
    """
    tb = traceback.format_exc()
    header = f"❌ ERROR: {context}" if context else "❌ ERROR"
    logger.error("%s\n%s", header, tb)

def get_boto3_session():
    """
    Sets up and returns a boto3 session.
    """
    if settings.ENV == 'development' and settings.AWS_PROFILE:
        return boto3.Session(profile_name=settings.AWS_PROFILE)
    return boto3.Session()
