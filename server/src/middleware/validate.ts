import { Context, Next } from "hono";
import { z, ZodSchema } from "zod";
import { ValidationError } from "../lib/errors";

/**
 * Validation middleware factory
 *
 * Creates middleware to validate request data against Zod schemas
 */

/**
 * Validate request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);

      // Store validated data in context
      c.set("validatedBody", validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Invalid request body", details);
      }
      throw error;
    }
  };
}

/**
 * Validate path parameters
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      const validated = schema.parse(params);

      // Store validated data in context
      c.set("validatedParams", validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Invalid path parameters", details);
      }
      throw error;
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);

      // Store validated data in context
      c.set("validatedQuery", validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Invalid query parameters", details);
      }
      throw error;
    }
  };
}

// Extend Hono's context types to include validated data
declare module "hono" {
  interface ContextVariableMap {
    validatedBody?: any;
    validatedParams?: any;
    validatedQuery?: any;
  }
}
