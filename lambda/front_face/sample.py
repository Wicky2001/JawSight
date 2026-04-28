import json
import boto3
import logging
from datetime import datetime
from botocore.exceptions import ClientError

# AWS clients (initialized once - reused)
s3 = boto3.client('s3')

# Logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variable
BUCKET_NAME = ""


def lambda_handler(event, context):
    """
    SQS -> Lambda -> S3
    Safe version with:
    - partial batch handling
    - idempotency
    - error isolation
    """

    failures = []

    for record in event['Records']:
        message_id = record['messageId']

        try:
            # 🔹 Parse message
            body = json.loads(record['body'])

            doctor_id = body.get("doctor_id")
            patient_id = body.get("patient_id")
            image_url = body.get("imageUrl")
            iteration_id = body.get("iterationId")

            # 🔹 Validate input (important safety)
            if not doctor_id or not iteration_id:
                raise ValueError("Missing required fields")

            # 🔹 Idempotent key (VERY IMPORTANT)
            file_key = f"records/{doctor_id}_{patient_id}_{iteration_id}.json"

            # 🔹 Check if already processed (idempotency)
            if check_if_exists(file_key):
                logger.info(f"Skipping duplicate: {file_key}")
                continue

            # 🔹 Prepare data
            data = {
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "imageUrl": image_url,
                "iterationId": iteration_id,
                "processed_at": datetime.utcnow().isoformat()
            }

            # 🔹 Save to S3
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=file_key,
                Body=json.dumps(data),
                ContentType="application/json"
            )

            logger.info(f"Saved: {file_key}")

        except Exception as e:
            logger.error(f"Failed message {message_id}: {str(e)}")

            # 🔴 Mark only this message as failed
            failures.append({
                "itemIdentifier": message_id
            })

    # 🔹 VERY IMPORTANT RESPONSE
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
            raise