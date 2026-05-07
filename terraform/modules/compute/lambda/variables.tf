variable "project_name" {
  description = "Project name"
  type        = string
  default     = "image-processor"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "lambda_role_arn" {
  description = "IAM Role ARN for Lambda"
  type        = string
  default     = ""
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
  default     = ""
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 900
}

variable "memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 2048
}

variable "input_bucket_name" {
  description = "Input bucket name"
  type        = string
  default     = ""
}

variable "output_bucket_name" {
  description = "Output bucket name"
  type        = string
  default     = ""
}

variable "sns_topic_arn" {
  description = "SNS Topic ARN"
  type        = string
  default     = ""
}

variable "processed_results_queue_url" {
  description = "Processed SQS URL"
  type        = string
  default     = ""
}

variable "image_jobs_queue_arn" {
  description = "Input SQS ARN"
  type        = string
  default     = ""
}
