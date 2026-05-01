"""
Custom exception classes for the Lambda application.
"""

class UnsuitableImageError(Exception):
    """Raised when an image is not suitable for processing (e.g., failed detection)."""
    pass

class S3BucketError(Exception):
    """Raised when there is an issue with S3 operations."""
    pass
