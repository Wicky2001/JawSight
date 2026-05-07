output "lambda_role_arn" {
  description = "ARN of the lambda execution role"
  value       = aws_iam_role.lambda_exec.arn
}
