# S3 Module Main
resource "aws_s3_bucket" "s3_bucket" {
  bucket = "${var.project_name}-${var.environment}-data"
}
