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

variable "s3_bucket_arn" {
  description = "ARN of data bucket"
  type        = string
  default     = ""
}

variable "image_processing_queue_arn" {
  description = "ARN of image jobs sqs queue"
  type        = string
  default     = ""
}

variable "sns_topic_arn" {
  description = "ARN of sns topic"
  type        = string
  default     = ""
}

variable "ecr_repository_arn" {
  description = "ARN of ecr repository for lambda images"
  type        = string
  default     = ""
}