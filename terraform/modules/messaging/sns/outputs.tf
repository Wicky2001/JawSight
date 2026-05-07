output "topic_arn" {
  description = "ARN of the notifications topic"
  value       = aws_sns_topic.notifications.arn
}
