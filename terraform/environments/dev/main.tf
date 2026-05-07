# Include shared provider and version configuration
# NOTE: In standard Terraform, providers in another directory won't auto-load, 
# so you often symlink them or define a provider block here pointing to the same setup.
# Here we just define the base or use terragrunt, but as requested:
terraform {
  required_version = ">= 1.14.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "s3" {
  source       = "../../modules/storage/s3"
  project_name = var.project_name
  environment  = var.environment
}

module "sqs" {
  source       = "../../modules/messaging/sqs"
  project_name = var.project_name
  environment  = var.environment
}

module "sns" {
  source       = "../../modules/messaging/sns"
  project_name = var.project_name
  environment  = var.environment
}

module "sns_subscription" {
  source      = "../../modules/messaging/subscriptions"
  topic_arn   = module.sns.topic_arn
  webhook_url = "https://example.com/webhook" # Placeholder
}

module "ecr" {
  source       = "../../modules/compute/ecr"
  project_name = var.project_name
  environment  = var.environment
}

module "iam" {
  source                      = "../../modules/iam/roles"
  project_name                = var.project_name
  environment                 = var.environment
  input_bucket_arn            = module.s3.input_bucket_arn
  output_bucket_arn           = module.s3.output_bucket_arn
  image_jobs_queue_arn        = module.sqs.image_jobs_queue_arn
  processed_results_queue_arn = module.sqs.processed_results_queue_arn
  sns_topic_arn               = module.sns.topic_arn
}

module "lambda" {
  source                      = "../../modules/compute/lambda"
  project_name                = var.project_name
  environment                 = var.environment
  lambda_role_arn             = module.iam.lambda_role_arn
  ecr_repository_url          = module.ecr.repository_url
  timeout                     = var.lambda_timeout
  memory                      = var.lambda_memory
  input_bucket_name           = module.s3.input_bucket_name
  output_bucket_name          = module.s3.output_bucket_name
  sns_topic_arn               = module.sns.topic_arn
  processed_results_queue_url = module.sqs.processed_results_queue_url
  image_jobs_queue_arn        = module.sqs.image_jobs_queue_arn
}
