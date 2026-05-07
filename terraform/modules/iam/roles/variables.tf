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

variable "input_bucket_arn" {
  description = "ARN of input bucket"
  type        = string
  default     = ""
}

variable "output_bucket_arn" {
  description = "ARN of output bucket"
  type        = string
  default     = ""
}

variable "image_jobs_queue_arn" {
  description = "ARN of image jobs sqs queue"
  type        = string
  default     = ""
}

variable "processed_results_queue_arn" {
  description = "ARN of processed results sqs queue"
  type        = string
  default     = ""
}

variable "sns_topic_arn" {
  description = "ARN of sns topic"
  type        = string
  default     = ""
}
