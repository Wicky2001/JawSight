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

variable "s3_bucket_name" {
  description = "Data bucket name"
  type        = string
  default     = ""
}

variable "sns_topic_arn" {
  description = "SNS Topic ARN"
  type        = string
  default     = ""
}

variable "image_processing_queue_arn" {
  description = "Image processing SQS ARN"
  type        = string
  default     = ""
}
