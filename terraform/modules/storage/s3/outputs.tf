output "s3_bucket_name" {
  description = "Name of the data bucket"
  value       = aws_s3_bucket.s3_bucket.id
}

output "s3_bucket_arn" {
  description = "ARN of the data bucket"
  value       = aws_s3_bucket.s3_bucket.arn
}
