import json
from botocore.exceptions import ClientError
from config import settings
from utils.helpers import logger, log_exception, get_boto3_session

session = get_boto3_session()
sns_client = session.client('sns')

def push_to_sns(message: str, success: bool, data: dict):
    """
    Publishes a notification message to an SNS topic.
    """
    try:
        payload = {
            "message": message,
            "status": success,
            "data": data
        }

        response = sns_client.publish(
            TopicArn=settings.SNS_TOPIC_ARN,
            Message=json.dumps(payload),
            Subject='Lambda Processing Notification'
        )

        logger.info("✅ SUCCESS: Pushed to SNS successfully (MessageId=%s)", response.get('MessageId'))
        return response

    except ClientError as e:
        log_exception(e, "push_to_sns AWS error")
        # Depending on requirements, we might want to raise here, 
        # but original code just logged and returned None.
        return None
    except Exception as e:
        log_exception(e, "push_to_sns unexpected error")
        return None
