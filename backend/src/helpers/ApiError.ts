class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string> | undefined;
  success: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string>,
  ) {
    super(message);

    this.statusCode = statusCode;

    this.errors = errors;
    this.success = false;
  }
}

export default ApiError;