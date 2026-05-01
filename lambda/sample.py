import json
import boto3
import logging
from datetime import datetime,timezone
from botocore.exceptions import ClientError

# AWS clients (initialized once - reused for performance)
s3 = boto3.client('s3')
sns = boto3.client('sns') # Added SNS Client

# Logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables & Constants
BUCKET_NAME = "result-images-915658834610-us-east-1-an"
SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:915658834610:model_process_status"



def push_to_sns(message, status, data):
    try:
        

        if status == "success":
            payload = {
            "message": message,
            "status": status,
            "data": data
        }

            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Message=json.dumps(payload),  
                Subject='Lambda Processing Complete'
            )
        else:
            payload = {
            "message": message,
            "status": status,
            "data": {
                "doctor_id": data.get("doctor_id"),
                "patient_id": data.get("patient_id"),
                "iterationId": data.get("iterationId")
            },
        }

            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Message=json.dumps(payload),  
                Subject='Lambda Processing Failed'
            )    



        logger.info("Pushed to SNS successfully")

    except Exception as e:
        logger.error(f"Failed to push to SNS: {str(e)}")
        

    
 


def lambda_handler(event, context):
    """
    SQS -> Lambda -> S3 -> SNS
    Safe version with:
    - partial batch handling
    - idempotency
    - error isolation
    """

    failures = []



    for record in event['Records']:
        message_id = record['messageId']

        try:
            body = json.loads(record['body'])

            doctor_id = body.get("doctor_id")
            patient_id = body.get("patient_id")
            image_url = body.get("imageUrl")
            iteration_id = body.get("iterationId")

            if not doctor_id or not iteration_id:
                raise ValueError("Missing required fields")

            file_key = f"records/{doctor_id}_{patient_id}_{iteration_id}.json"

            data = {
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "imageUrl": image_url,
                "iterationId": iteration_id,
                "processed_at": datetime.now(timezone.utc)
            }

            if check_if_exists(file_key):
                logger.info(f"Skipping S3 upload for duplicate: {file_key}")
            else:
                
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key=file_key,
                    Body=json.dumps(data),
                    ContentType="application/json"
                )
                logger.info(f"Saved: {file_key}")

         
           
            push_to_sns("Your images have been processed successfully. You can now view the results in result page.", "success", data)

        except Exception as e:
            logger.error(f"Failed message {message_id}: {str(e)}")
            
            push_to_sns("While processing your images, we encountered an error. Failed images will be retried automatically. If you didn't see the result on the result page after 10 minutes, please upload the images again. We apologize for the inconvenience.", "failed", data)

            failures.append({
                "itemIdentifier": message_id
            })

    return {
        "batchItemFailures": failures
    }


def check_if_exists(key):
    """Check if file already exists in S3 (idempotency)"""
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        else:
            raise e