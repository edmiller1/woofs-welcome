import type { Context } from "hono"; // ← Add StatusCode import
import { AppError } from "../lib/errors";
import { ZodError } from "zod";

/**
 * Error Response Interface
 * Consistent structure for all error responses
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
    stack?: string; // Only in development
  };
}

/**
 * Format error for client response
 */
function formatErrorResponse(
  error: AppError | Error,
  isDevelopment: boolean
): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      message: error.message,
    },
  };

  // Add error code if it's an AppError
  if (error instanceof AppError) {
    response.error.code = error.code;

    // Add details if available (e.g., validation errors)
    if (error.details) {
      response.error.details = error.details;
    }
  }

  // Include stack trace only in development
  if (isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Log error with appropriate level and structure
 */
function logError(error: AppError | Error, context: Context) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: context.req.method,
    path: context.req.path,
    statusCode: error instanceof AppError ? error.statusCode : 500,
    message: error.message,
    code: error instanceof AppError ? error.code : "UNKNOWN_ERROR",
    stack: error.stack,
  };

  // Log based on error severity
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      // Server errors - log as error
      console.error("❌ SERVER ERROR:", JSON.stringify(logData, null, 2));
    } else if (error.statusCode >= 400) {
      // Client errors - log as warning
      console.warn("⚠️  CLIENT ERROR:", JSON.stringify(logData, null, 2));
    }
  } else {
    // Unknown errors - log as error
    console.error("❌ UNKNOWN ERROR:", JSON.stringify(logData, null, 2));
  }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): AppError {
  const details = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return new AppError(
    "Validation failed",
    422,
    true,
    "VALIDATION_ERROR",
    details
  );
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = async (error: Error, c: Context) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    error = handleZodError(error);
  }

  // Handle operational AppErrors
  if (error instanceof AppError) {
    logError(error, c);

    return c.json(formatErrorResponse(error, isDevelopment), error.statusCode);
  }

  // Handle unexpected errors
  logError(error, c);

  return c.json(
    formatErrorResponse(
      new AppError(
        isDevelopment ? error.message : "Internal server error",
        500,
        false
      ),
      isDevelopment
    ),
    500
  );
};
