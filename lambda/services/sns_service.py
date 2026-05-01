import json
from utils.logger import logger, log_exception
from config.settings import SNS_TOPIC_ARN
from services.aws_client import sns_client

def push_to_sns(message: str, success: bool, data: dict):
    try:
        payload = {
                "message": message,
                "status": success,
                "data": data
        }

        response = sns_client.publish(
                    TopicArn=SNS_TOPIC_ARN,
                    Message=json.dumps(payload),  
                    Subject='Lambda Processing Notification'
                )

        logger.info("✅ SUCCESS: Pushed to SNS successfully (MessageId=%s)", response.get('MessageId'))
        return response

    except Exception as e:
        log_exception(e, "push_to_sns")
