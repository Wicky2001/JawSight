import cv2
import boto3
from botocore.exceptions import ClientError
from config import settings
from utils.helpers import logger, log_exception, get_boto3_session
from models.exceptions import S3BucketError

session = get_boto3_session()
s3_client = session.client('s3')

def read_file_from_s3(object_key: str) -> bytes:
    """
    Reads a file from S3 directly into memory as bytes.
    """
    logger.debug("🔧 DEBUG: read_file_from_s3 started for key=%s", object_key)
    try:
        response = s3_client.get_object(Bucket=settings.BUCKET_NAME, Key=object_key)
        file_content = response['Body'].read()
        logger.info("✅ SUCCESS: Successfully read '%s' (%d bytes)", object_key, len(file_content))
        return file_content
    except ClientError as e:
        log_exception(e, f"Error reading from S3: {object_key}")
        raise S3BucketError(f"Error reading from S3: {object_key}") from e

def save_image_to_s3_bucket(image_data_list: list):
    """
    Uploads a list of images (OpenCV BGR format) to S3.
    """
    logger.debug("🔧 DEBUG: save_image_to_s3_bucket started for %d images", len(image_data_list))
    key = "unknown"
    try:
        for item in image_data_list:
            key = item["key"]
            img_bgr = item["image"]

            success, buffer = cv2.imencode('.png', img_bgr)
            if not success:
                raise ValueError(f"Corrupted image data for key: {key}")

            s3_client.put_object(
                Bucket=settings.BUCKET_NAME,
                Key=key,
                Body=buffer.tobytes(),
                ContentType='image/png'
            )
            logger.info("✅ SUCCESS: Uploaded '%s.png'", key)
    except ClientError as e:
        log_exception(e, f"Error uploading to S3 for key: {key}")
        raise S3BucketError(f"Error uploading to S3: {key}") from e
    except ValueError as ve:
        log_exception(ve, f"Value error during S3 upload for key: {key}")
        raise
    except Exception as e:
        log_exception(e, f"Unexpected error during S3 upload for key: {key}")
        raise

def has_at_least_n_objects(prefix: str, n: int = 4) -> bool:
    """
    Checks if an S3 prefix contains at least n objects.
    """
    logger.debug("🔧 DEBUG: has_at_least_n_objects started for prefix=%s, n=%d", prefix, n)
    try:
        if not prefix.endswith('/'):
            prefix += '/'

        response = s3_client.list_objects_v2(
            Bucket=settings.BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=n
        )
        contents = response.get('Contents', [])
        count = sum(1 for obj in contents if obj.get('Key') != prefix)
        return count >= n
    except ClientError as e:
        log_exception(e, f"Error accessing S3 prefix: {prefix}")
        error_message = e.response.get("Error", {}).get("Message", "Unknown error")
        raise S3BucketError(f"Error accessing S3: {error_message}") from e
