import os
import cv2
from botocore.exceptions import ClientError
from config.settings import BUCKET_NAME
from utils.logger import logger, log_exception
from models.exceptions import S3BucketError
from services.aws_client import s3_client

def read_file_from_s3(object_key):
    """Reads a file from S3 directly into memory as bytes."""
    logger.info("🔧 INFO: read_file_from_s3 started for key=%s", object_key)

    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=object_key)
        file_content = response['Body'].read()

        logger.info(
            "✅ SUCCESS: Successfully read '%s' (%d bytes)",
            object_key,
            len(file_content)
        )

        return file_content

    except ClientError as e:
        log_exception(e, f"Error reading from S3: {object_key}")
        raise S3BucketError(f"Error reading from S3: {object_key}") from e


def save_image_to_s3_bucket(image_data_list):
    logger.info(
        "🔧 INFO: save_image_to_s3_bucket started for %d images",
        len(image_data_list)
    )

    try:
        for item in image_data_list:
            key = item["key"]
            img_bgr = item["image"]

            success, buffer = cv2.imencode('.png', img_bgr)
            if not success:
                raise ValueError(f"Corrupted image data for key: {key}")

            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=key,
                Body=buffer.tobytes(),
                ContentType='image/png'
            )

            logger.info("✅ SUCCESS: Uploaded '%s.png'", key)

    except ClientError as e:
        safe_key = key if 'key' in locals() else "unknown"
        log_exception(e, f"Error uploading to S3 for key: {safe_key}")
        raise S3BucketError(f"Error uploading to S3: {safe_key}") from e

    except ValueError as ve:
        log_exception(ve, "Value error during S3 upload")
        raise  # user error → do NOT wrap

    except Exception as e:
        log_exception(e, "Unexpected error during S3 upload")
        raise


def has_at_least_n_objects(prefix, n=4):
    logger.info(
        "🔧 INFO: has_at_least_n_objects started for prefix=%s, n=%d",
        prefix,
        n
    )

    try:
        if not prefix.endswith('/'):
            prefix += '/'

        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=n
        )

        contents = response.get('Contents', [])

        count = sum(
            1 for obj in contents if obj.get('Key') != prefix
        )

        return count >= n

    except ClientError as e:
        log_exception(e, f"Error accessing S3 prefix: {prefix}")

        error_message = e.response.get("Error", {}).get("Message", "Unknown error")

        raise S3BucketError(
            f"Error accessing S3: {error_message}"
        ) from e
