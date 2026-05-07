resource "aws_lambda_function" "processor" {
  function_name = "${var.project_name}-${var.environment}-lambda"
  role          = var.lambda_role_arn
  package_type  = "Image"
  image_uri     = "${var.ecr_repository_url}:latest"
  timeout       = var.timeout
  memory_size   = var.memory

  environment {
    variables = {
      INPUT_BUCKET  = var.input_bucket_name
      OUTPUT_BUCKET = var.output_bucket_name
      SNS_TOPIC_ARN = var.sns_topic_arn
      QUEUE_URL     = var.processed_results_queue_url
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.image_jobs_queue_arn
  function_name    = aws_lambda_function.processor.arn
}
