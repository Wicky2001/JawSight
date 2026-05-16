/**
 * ApiError is the application's standardized error type returned to clients.
 *
 * @param statusCode - HTTP status code to send to the client
 * @param message - Short error message safe for clients
 * @param validationErrors - Optional map of validation field -> message
 * @param original_error - The original internal error object (kept for server-side debugging only)
 */
class ApiError extends Error {
  statusCode: number;
  validationErrors?: Record<string, string> | undefined;
  success: boolean;
  original_error?: unknown;

  /**
   * Create a new ApiError
   * @param statusCode HTTP status code
   * @param message Client-safe error message
   * @param validationErrors Optional validation details (field => message)
   * @param original_error Internal original error to be logged on the server
   */
  constructor(
    statusCode: number,
    message: string,
    validationErrors?: Record<string, string>,
    original_error?: unknown,
  ) {
    super(message);

    this.statusCode = statusCode;

    this.validationErrors = validationErrors;
    this.success = false;
    this.original_error = original_error;
  }
}

export default ApiError;
