class UnsuitableImageError(Exception):
    """Raised when an image is not suitable."""
    pass

class S3BucketError(Exception):
     """Raised when there is an issue with the S3 bucket."""
     pass