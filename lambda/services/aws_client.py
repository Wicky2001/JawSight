import boto3
from config.settings import ENV, AWS_PROFILE
from utils.logger import logger

_session = None

def get_boto_session():
    global _session
    if _session is None:
        logger.info("Checking AWS session... environment=%s", ENV)
        if ENV == 'development':
            logger.info("✅ SUCCESS: Setting up custom AWS session for development using profile '%s'", AWS_PROFILE)
            _session = boto3.Session(profile_name=AWS_PROFILE)
        else:
            logger.info("✅ SUCCESS: Using default implicit AWS session (production).")
            _session = boto3.Session()
    return _session

s3_client = get_boto_session().client('s3')
sns_client = get_boto_session().client('sns')
