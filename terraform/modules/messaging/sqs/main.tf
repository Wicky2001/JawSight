resource "aws_sqs_queue" "image_jobs" {
  name = "${var.project_name}-${var.environment}-image-jobs"
}

resource "aws_sqs_queue" "processed_results" {
  name = "${var.project_name}-${var.environment}-processed-results"
}
