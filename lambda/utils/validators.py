def validate_lambda_event(event):
    """
    Validates that the SQS event contains all required fields.
    """
    if 'Records' not in event:
        raise ValueError("Invalid event format: 'Records' key missing.")
    
    return True

def validate_message_body(body):
    """
    Validates the parsed JSON body of an SQS message.
    """
    required_fields = ["doctor_id", "patient_id", "iterationId", "input_image_details"]
    for field in required_fields:
        if not body.get(field):
            raise ValueError(f"Missing required field: {field}")
            
    input_image_details = body.get("input_image_details", [])
    if not input_image_details or len(input_image_details) < 3:
        raise ValueError("Expected at least 3 input images for left, right, and front views.")
    
    return True
