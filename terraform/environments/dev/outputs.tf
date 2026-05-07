output "input_bucket_name" {
  description = "Input Bucket Name"
  value       = module.s3.input_bucket_name
}

output "input_bucket_arn" {
  description = "Input Bucket ARN"
  value       = module.s3.input_bucket_arn
}

output "output_bucket_name" {
  description = "Output Bucket Name"
  value       = module.s3.output_bucket_name
}

output "output_bucket_arn" {
  description = "Output Bucket ARN"
  value       = module.s3.output_bucket_arn
}

output "image_jobs_queue_arn" {
  description = "Image Jobs SQS ARN"
  value       = module.sqs.image_jobs_queue_arn
}

output "image_jobs_queue_url" {
  description = "Image Jobs SQS URL"
  value       = module.sqs.image_jobs_queue_url
}

output "processed_results_queue_arn" {
  description = "Processed Results SQS ARN"
  value       = module.sqs.processed_results_queue_arn
}

output "processed_results_queue_url" {
  description = "Processed Results SQS URL"
  value       = module.sqs.processed_results_queue_url
}

output "sns_topic_arn" {
  description = "SNS Topic ARN"
  value       = module.sns.topic_arn
}

output "lambda_arn" {
  description = "Lambda ARN"
  value       = module.lambda.lambda_arn
}

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = module.ecr.repository_url
}

output "iam_role_arn" {
  description = "IAM Role ARN"
  value       = module.iam.lambda_role_arn
}
