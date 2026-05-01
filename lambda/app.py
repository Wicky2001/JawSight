import json
from utils.logger import logger
from models.exceptions import S3BucketError, UnsuitableImageError
from config.settings import BUCKET_NAME
from services.s3_service import has_at_least_n_objects, save_image_to_s3_bucket
from services.sns_service import push_to_sns
from services.image_service import process_images

def lambda_handler(event, context):
    """
    SQS -> Lambda -> S3 -> SNS
    Safe version with:
    - partial batch handling
    - idempotency
    - error isolation
    """
    logger.info("✅ SUCCESS: lambda_handler started with %d records", len(event.get('Records', [])))

    failures = []

    for record in event['Records']:
        message_id = record['messageId']

        try:
            body = json.loads(record['body'])

            doctor_id = body.get("doctor_id")
            patient_id = body.get("patient_id")
            iteration_id = body.get("iterationId")

            if not doctor_id or not iteration_id or not patient_id:
                raise ValueError("Missing required fields")

            output_folder_key = f"{doctor_id}/{patient_id}/{iteration_id}/out/"
            
            input_image_details = body.get("input_image_details", [])
            if not input_image_details or len(input_image_details) < 3:
                raise ValueError("Expected at least 3 input images for left, right and front views.")

            if has_at_least_n_objects(output_folder_key, 3):
                logger.warning(f"⚠️ WARNING: Skipping. Duplicate message: {output_folder_key}")
                continue
            
            output_image_data = process_images(input_image_details)
            
            s3_upload_details = [
                {"key": f"{output_folder_key}left", "image": output_image_data["left_image"]},
                {"key": f"{output_folder_key}right", "image": output_image_data["right_image"]},
                {"key": f"{output_folder_key}front", "image": output_image_data["front_image"]}
            ]
            
            save_image_to_s3_bucket(s3_upload_details)
            
            sns_message_data = {
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "iterationId": iteration_id,
                "bucket_name": BUCKET_NAME,
                "output_images_keys":{
                    "left": f"{output_folder_key}left.png",
                    "right": f"{output_folder_key}right.png",
                    "front": f"{output_folder_key}front.png"
                },
            }
            
            push_to_sns("Your images have been processed successfully. You can now view the results in result page.", "success", sns_message_data)
            
        except S3BucketError as s3e:

            sns_status_message = (
                "While processing your images, we encountered an error related to our storage system. "
                "Failed images will be retried automatically. If you didn't see the result after 10 minutes, "
                "please upload the images again."
            )

            original_error_code = None
            if s3e.__cause__ and hasattr(s3e.__cause__, "response"):
                original_error_code = s3e.__cause__.response.get("Error", {}).get("Code")
            
            logger.error(f"Original S3 error code: {original_error_code}")
            retry_needed = False

            # -------------------------
            # 🟢 USER ERRORS (NO RETRY)
            # -------------------------
            if original_error_code in [
                "NoSuchKey",
                "InvalidObjectState",   
                "InvalidArgument",
                "BadDigest"
            ]:
                logger.error("User-side error: %s", original_error_code)

                sns_status_message = (
                    "One or more of your uploaded images are invalid, corrupted, or not accessible. "
                    "Please upload valid images and try again."
                )

            # -------------------------
            # 🔴 OUR SYSTEM ERRORS (RETRY)
            # -------------------------
            elif original_error_code in [
                "NoSuchBucket",
                "AccessDenied",
                "AllAccessDisabled"
            ]:
                logger.critical("System configuration error: %s", original_error_code)
                retry_needed = True

            # -------------------------
            # 🔴 AWS TEMPORARY ERRORS (RETRY)
            # -------------------------
            elif original_error_code in [
                "SlowDown",
                "InternalError",
                "ServiceUnavailable"
            ]:
                logger.warning("AWS temporary issue: %s", original_error_code)
                retry_needed = True

            # -------------------------
            # 🔴 UPLOAD-SPECIFIC ERRORS
            # -------------------------
            elif original_error_code in [
                "EntityTooLarge"
            ]:
                logger.error("File too large")

                sns_status_message = (
                    "The uploaded image is too large. Please upload a smaller file."
                )

            # -------------------------
            # ❓ UNKNOWN ERROR
            # -------------------------
            else:
                logger.error("Unexpected S3 error: %s", original_error_code)
                retry_needed = True  # safer default

            # -------------------------
            # RETRY HANDLING
            # -------------------------
            if retry_needed:
                failures.append({
                    "itemIdentifier": message_id
                })

            # -------------------------
            # SEND SNS
            # -------------------------
            sns_message_data = {
                "doctor_id": body.get("doctor_id"),
                "patient_id": body.get("patient_id"),
                "iterationId": body.get("iterationId"),
            }

            push_to_sns(sns_status_message, False, sns_message_data)

            
        except ValueError as ve:
            logger.error(f": Value Error failed for message {message_id}: {str(ve)}")
            
            sns_message_data = {
                "doctor_id": body.get("doctor_id"),
                "patient_id": body.get("patient_id"),
                "iterationId": body.get("iterationId"),
               
            }
            
            push_to_sns(f"Error occured while processing your request. Please upload images again and try again.{str(ve)}",False,sns_message_data)
            
        except UnsuitableImageError as uie:
            logger.error(f": Image processing issue for message {message_id}: {str(uie)}")
            
            sns_message_data = {
                "doctor_id": body.get("doctor_id"),
                "patient_id": body.get("patient_id"),
                "iterationId": body.get("iterationId"),
            
            }
            
            push_to_sns("Uploaded images corroupted. Please upload the images again and try again.", False, sns_message_data)
        
        except Exception as e:
            logger.error(f"❌ UNEXPECTED ERROR: Failed message {message_id}: {str(e)}")
            
            sns_message_data = {
                "doctor_id": body.get("doctor_id"),
                "patient_id": body.get("patient_id"),
                "iterationId": body.get("iterationId"),
                "output_images_keys": None,
            }
            
            push_to_sns("While processing your images, we encountered an error. Failed images will be retried automatically. If you didn't see the result on the result page after 10 minutes, please upload the images again. We apologize for the inconvenience.", False, sns_message_data)

            failures.append({
                "itemIdentifier": message_id
            })

    logger.info("✅ SUCCESS: lambda_handler completed with %d failures", len(failures))
    return {
        "batchItemFailures": failures
    }





# Your sample data object
dataObject = {
    "doctor_id": "D_737383",
    "patient_id": "P_36333",
    "iterationId": "ydedeybyebd",
    "input_image_details":[
        {
            "side": "right",
            "bucket_key":"D_737383/P_36333/ydedeybyebd/input/right.png"
        },
        {
            "side": "left",
            "bucket_key":"D_737383/P_36333/ydedeybyebd/input/left.png"
        },
        {
            "side": "front",
            "bucket_key":"D_737383/P_36333/ydedeybyebd/input/front.png",
            "csv_key":"D_737383/P_36333/ydedeybyebd/input/front.csv"
        }
    ]
}

# 1. Wrap it in a mock SQS event
mock_sqs_event = {
    "Records": [
        {
            "messageId": "local-test-message-001",
            "body": json.dumps(dataObject)  # Notice we are converting the dict to a JSON string here
        }
    ]
}

# 2. AWS Context object is usually None for simple local testing
mock_context = None

# 3. Trigger the function locally
if __name__ == "__main__":
    logger.info("✅ SUCCESS: Starting local Lambda test...")
    response = lambda_handler(mock_sqs_event, mock_context)
    logger.info("✅ SUCCESS: Lambda execution finished")
    logger.info("✅ SUCCESS: Response: %s", json.dumps(response, indent=2))