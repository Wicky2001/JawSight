output "lambda_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.processor.arn
}

# Additional outputs for better resource management
output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.processor.function_name
}

output "lambda_log_group_name" {
  description = "CloudWatch Log Group name for the Lambda function"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}
