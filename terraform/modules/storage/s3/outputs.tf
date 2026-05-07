output "input_bucket_name" {
  description = "Name of the input bucket"
  value       = aws_s3_bucket.input_bucket.id
}

output "input_bucket_arn" {
  description = "ARN of the input bucket"
  value       = aws_s3_bucket.input_bucket.arn
}

output "output_bucket_name" {
  description = "Name of the output bucket"
  value       = aws_s3_bucket.output_bucket.id
}

output "output_bucket_arn" {
  description = "ARN of the output bucket"
  value       = aws_s3_bucket.output_bucket.arn
}
