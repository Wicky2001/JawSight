import json
from config import settings
from utils.helpers import logger, log_exception
from utils.validators import validate_lambda_event, validate_message_body
from services.s3_service import has_at_least_n_objects, save_image_to_s3_bucket
from services.sns_service import push_to_sns
from services.image_service import process_images
from models.exceptions import S3BucketError, UnsuitableImageError

def lambda_handler(event, context):
    """
    SQS -> Lambda -> S3 -> SNS
    Orchestrates the image processing workflow.
    """
    logger.info("✅ SUCCESS: lambda_handler started with %d records", len(event.get('Records', [])))

    failures = []

    try:
        validate_lambda_event(event)
    except ValueError as ve:
        logger.error(f"Invalid event: {str(ve)}")
        return {"batchItemFailures": []} # Or handle as needed

    for record in event['Records']:
        message_id = record['messageId']
        body = {}
        try:
            body = json.loads(record['body'])
            validate_message_body(body)

            doctor_id = body.get("doctor_id")
            patient_id = body.get("patient_id")
            iteration_id = body.get("iterationId")
            input_image_details = body.get("input_image_details")

            output_folder_key = f"{doctor_id}/{patient_id}/{iteration_id}/out/"
            
            # Idempotency check
            if has_at_least_n_objects(output_folder_key, 3):
                logger.warning(f"⚠️ WARNING: Skipping. Duplicate message: {output_folder_key}")
                continue
            
            # Core Processing
            output_image_data = process_images(input_image_details)
            
            # Prepare uploads
            s3_upload_details = [
                {"key": f"{output_folder_key}left", "image": output_image_data["left_image"]},
                {"key": f"{output_folder_key}right", "image": output_image_data["right_image"]},
                {"key": f"{output_folder_key}front", "image": output_image_data["front_image"]}
            ]
            
            # Save to S3
            save_image_to_s3_bucket(s3_upload_details)
            
            # Success Notification
            sns_message_data = {
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "iterationId": iteration_id,
                "bucket_name": settings.BUCKET_NAME,
                "output_images_keys": {
                    "left": f"{output_folder_key}left.png",
                    "right": f"{output_folder_key}right.png",
                    "front": f"{output_folder_key}front.png"
                },
            }
            
            push_to_sns(
                message="Your images have been processed successfully. You can now view the results in result page.",
                success=True,
                data=sns_message_data
            )
            
        except S3BucketError as s3e:
            handle_s3_error(s3e, body, message_id, failures)
        except ValueError as ve:
            handle_value_error(ve, body, message_id)
        except UnsuitableImageError as uie:
            handle_unsuitable_image_error(uie, body, message_id)
        except Exception as e:
            handle_unexpected_error(e, body, message_id, failures)

    logger.info("✅ SUCCESS: lambda_handler completed with %d failures", len(failures))
    return {
        "batchItemFailures": failures
    }

def handle_s3_error(s3e, body, message_id, failures):
    sns_status_message = (
        "While processing your images, we encountered an error related to our storage system. "
        "Failed images will be retried automatically. If you didn't see the result after 10 minutes, "
        "please upload the images again."
    )

    original_error_code = None
    if s3e.__cause__ and hasattr(s3e.__cause__, "response"):
        original_error_code = s3e.__cause__.response.get("Error", {}).get("Code")
    
    logger.error(f"S3 error code: {original_error_code} for message {message_id}")
    
    retry_needed = False
    if original_error_code in ["NoSuchKey", "InvalidObjectState", "InvalidArgument", "BadDigest"]:
        sns_status_message = (
            "One or more of your uploaded images are invalid, corrupted, or not accessible. "
            "Please upload valid images and try again."
        )
    elif original_error_code in ["NoSuchBucket", "AccessDenied", "AllAccessDisabled", "SlowDown", "InternalError", "ServiceUnavailable"]:
        retry_needed = True
    elif original_error_code == "EntityTooLarge":
        sns_status_message = "The uploaded image is too large. Please upload a smaller file."
    else:
        retry_needed = True

    if retry_needed:
        failures.append({"itemIdentifier": message_id})

    sns_message_data = {
        "doctor_id": body.get("doctor_id"),
        "patient_id": body.get("patient_id"),
        "iterationId": body.get("iterationId"),
    }
    push_to_sns(sns_status_message, False, sns_message_data)

def handle_value_error(ve, body, message_id):
    logger.error(f"Value Error for message {message_id}: {str(ve)}")
    sns_message_data = {
        "doctor_id": body.get("doctor_id"),
        "patient_id": body.get("patient_id"),
        "iterationId": body.get("iterationId"),
    }
    push_to_sns(f"Error occurred while processing your request. Please upload images again and try again. {str(ve)}", False, sns_message_data)

def handle_unsuitable_image_error(uie, body, message_id):
    logger.error(f"Image processing issue for message {message_id}: {str(uie)}")
    sns_message_data = {
        "doctor_id": body.get("doctor_id"),
        "patient_id": body.get("patient_id"),
        "iterationId": body.get("iterationId"),
    }
    push_to_sns("Uploaded images corrupted. Please upload the images again and try again.", False, sns_message_data)

def handle_unexpected_error(e, body, message_id, failures):
    log_exception(e, f"Unexpected error for message {message_id}")
    sns_message_data = {
        "doctor_id": body.get("doctor_id"),
        "patient_id": body.get("patient_id"),
        "iterationId": body.get("iterationId"),
        "output_images_keys": None,
    }
    push_to_sns(
        "While processing your images, we encountered an error. Failed images will be retried automatically. If you didn't see the result on the result page after 10 minutes, please upload the images again.",
        False,
        sns_message_data
    )
    failures.append({"itemIdentifier": message_id})