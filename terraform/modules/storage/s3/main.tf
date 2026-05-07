# S3 Module Main
resource "aws_s3_bucket" "input_bucket" {
  bucket = "${var.project_name}-${var.environment}-input"
}

resource "aws_s3_bucket" "output_bucket" {
  bucket = "${var.project_name}-${var.environment}-output"
}
