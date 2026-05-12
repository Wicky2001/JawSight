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

//visibility timeout for SQS messages, should be greater than Lambda timeout to prevent premature retries
variable "sqs_visibility_timeout" {
  description = "sqs message visibility timeout"
  type = number
  default = 960
}