export class AqTractError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "AqTractError";
  }
}

export class NotFoundError extends AqTractError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AqTractError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AqTractError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends AqTractError {
  constructor(public retryAfter: number) {
    super("Rate limited", 429, "RATE_LIMITED");
    this.name = "RateLimitError";
  }
}
