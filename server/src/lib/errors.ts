/**
 * Custom Error Classes for Better Error Handling
 *
 * These provide:
 * - Consistent error structure
 * - Appropriate HTTP status codes
 * - Better debugging information
 * - Type safety
 */

import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Base Application Error
 * All custom errors extend this
 */

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly isOperational: boolean;
  public code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 * Use when: Invalid input, malformed request, validation fails
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details?: any) {
    super(message, 400, true, "BAD_REQUEST", details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Authentication required
 * Use when: No auth token, invalid token, expired session
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, true, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but lacks permission
 * Use when: User lacks required role, not business account, etc.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, true, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 * Use when: Place not found, user not found, etc.
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, true, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 * Use when: Duplicate entry, concurrent modification, etc.
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, true, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 * Use when: Zod validation fails, business rule violations
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 422, true, "VALIDATION_ERROR", details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 * Use when: User exceeded rate limits (though middleware handles this)
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, true, "TOO_MANY_REQUESTS");
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * 500 Internal Server Error - Unexpected server errors
 * Use when: Database errors, third-party API failures, unexpected errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, 500, false, "INTERNAL_ERROR", details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 503 Service Unavailable - External service down
 * Use when: Database unreachable, Cloudinary down, Resend down
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string = "Service") {
    super(
      `${service} is currently unavailable`,
      503,
      true,
      "SERVICE_UNAVAILABLE"
    );
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Database-specific error
 * Use when: Database queries fail
 */
export class DatabaseError extends InternalServerError {
  constructor(message: string = "Database operation failed", details?: any) {
    super(message, details);
    this.code = "DATABASE_ERROR";
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External API error
 * Use when: Third-party API calls fail (Google, Cloudinary, Resend)
 */
export class ExternalAPIError extends InternalServerError {
  constructor(service: string, message?: string, details?: any) {
    super(message || `${service} API request failed`, details);
    this.code = "EXTERNAL_API_ERROR";
    Object.setPrototypeOf(this, ExternalAPIError.prototype);
  }
}
