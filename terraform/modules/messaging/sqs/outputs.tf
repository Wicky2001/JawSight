output "image_jobs_queue_arn" {
  description = "ARN of the image jobs queue"
  value       = aws_sqs_queue.image_jobs.arn
}

output "image_jobs_queue_url" {
  description = "URL of the image jobs queue"
  value       = aws_sqs_queue.image_jobs.url
}

output "processed_results_queue_arn" {
  description = "ARN of the processed results queue"
  value       = aws_sqs_queue.processed_results.arn
}

output "processed_results_queue_url" {
  description = "URL of the processed results queue"
  value       = aws_sqs_queue.processed_results.url
}
