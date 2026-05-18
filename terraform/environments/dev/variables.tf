variable "project_name" {
  description = "Project name"
  type        = string
  default     = "jawsight-image-processor"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use for deployment"
  type        = string
  default     = "jawsight-dev-terraform"

}

variable "sqs_visibility_timeout" {
  description = "sqs message visibility timeout"
  type        = number
  default     = 960
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 900
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 3008
}

variable "webhook_url" {
  description = "Webhook URL for SNS notifications"
  type        = string
  default     = "https://reluctant-ferocity-monoxide.ngrok-free.dev/api/inference/sns-webhook" 
}

variable "image_uri" {
  description = "lambda image url"
  type        = string
  default     = "915658834610.dkr.ecr.ap-south-1.amazonaws.com/jawsight-image-processor-dev-repo:v2"
}