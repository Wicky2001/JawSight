output "image_processing_queue_arn" {
  description = "ARN of the image processing queue"
  value       = aws_sqs_queue.image_processing_queue.arn
}

output "image_processing_queue_url" {
  description = "URL of the image processing queue"
  value       = aws_sqs_queue.image_processing_queue.url
}

output "image_processing_dlq_arn" {
  description = "ARN of the image processing dead letter queue"
  value       = aws_sqs_queue.image_processing_dlq.arn
}
