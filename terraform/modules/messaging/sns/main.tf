resource "aws_sns_topic" "notifications" {
  name = "${var.project_name}-${var.environment}-notifications"
  
  # Display name (currently not set in your topic)
  display_name = "Model Process Status Notifications"
  
  # Tracing configuration - PassThrough mode
  tracing_config = "PassThrough"
  
  # Delivery policy for HTTP/HTTPS subscriptions
  delivery_policy = jsonencode({
    "http" = {
      "defaultHealthyRetryPolicy" = {
        "minDelayTarget"     = 20
        "maxDelayTarget"     = 20
        "numRetries"         = 3
        "numMaxDelayRetries" = 0
        "numMinDelayRetries" = 0
        "numNoDelayRetries"  = 0
        "backoffFunction"    = "linear"
      }
      "disableSubscriptionOverrides" = false
      "defaultThrottlePolicy" = {
        "maxReceivesPerSecond" = 1
      }
    }
  })
  
  tags = {
    Name        = "${var.project_name}-${var.environment}-notifications"
    Purpose     = "Model processing status notifications"
    Environment = var.environment
  }
}

