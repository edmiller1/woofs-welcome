import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";

const getClientIdentifier = (c: Context) => {
  const forwardedFor =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip");

  if (forwardedFor) {
    // If multiple IPs in x-forwarded-for, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback to direct connection (won't work behind proxy)
  return "unknown";
};

const createRateLimitMessage = (limit: number, window: string) => {
  return `Too many requests. You can make ${limit} requests per ${window}. Please try again later.`;
};

/**
 * STRICT Rate Limit - For Authentication Endpoints
 *
 * Use Case: Sign-in, sign-up, OTP verification
 * Why Strict: Prevents brute force attacks, credential stuffing, OTP spam
 *
 * Limit: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) => {
    return c.json(
      {
        error: "Too many authentication attempts",
        message: createRateLimitMessage(5, "15 minutes"),
        retryAfter: c.get("ratelimit-reset"),
      },
      429
    );
  },
});

/**
 * MODERATE Rate Limit - For Write Operations
 *
 * Use Case: Creating reviews, uploading images, favoriting places
 * Why Moderate: Prevents spam while allowing legitimate heavy usage
 *
 * Limit: 20 requests per 15 minutes per IP
 */
export const writeRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) => {
    return c.json(
      {
        error: "Too many requests",
        message: createRateLimitMessage(20, "15 minutes"),
        retryAfter: c.get("ratelimit-reset"),
      },
      429
    );
  },
});

/**
 * LENIENT Rate Limit - For Read Operations
 *
 * Use Case: Browsing places, viewing reviews, searching
 * Why Lenient: Users legitimately browse many pages
 *
 * Limit: 100 requests per 15 minutes per IP
 */
export const readRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) => {
    return c.json(
      {
        error: "Too many requests",
        message: createRateLimitMessage(100, "15 minutes"),
        retryAfter: c.get("ratelimit-reset"),
      },
      429
    );
  },
});

/**
 * GLOBAL Rate Limit - For All Endpoints
 *
 * Use Case: Catch-all protection against DDoS
 * Why Needed: Prevents overwhelming the server
 *
 * Limit: 200 requests per 15 minutes per IP
 * This should be higher than any specific limiter
 */
export const globalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Total requests across all endpoints
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) => {
    return c.json(
      {
        error: "Too many requests from your IP",
        message:
          "You've exceeded the maximum number of requests. Please try again later.",
        retryAfter: c.get("ratelimit-reset"),
      },
      429
    );
  },
});

/**
 * User-Specific Rate Limiter (for authenticated actions)
 *
 * Use Case: Limit per-user actions (reviews, claims)
 * Why Needed: Prevents spam even from legitimate users
 */
export const createUserRateLimiter = (limit: number, windowMs: number) => {
  return rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      // Use user ID if authenticated, fallback to IP
      const user = c.get("user");
      return user?.id || getClientIdentifier(c);
    },
    handler: (c) => {
      return c.json(
        {
          error: "Rate limit exceeded",
          message: `You can only perform this action ${limit} times per ${windowMs / 60000} minutes.`,
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429
      );
    },
  });
};

// Pre-configured user rate limiters for common use cases
export const reviewRateLimiter = createUserRateLimiter(
  5, // 5 reviews
  60 * 60 * 1000 // per hour
);

export const favouriteRateLimiter = createUserRateLimiter(
  50, // 50 favorites
  60 * 60 * 1000 // per hour
);

export const imageUploadRateLimiter = createUserRateLimiter(
  30, // 30 image uploads (5 reviews × 6 images)
  60 * 60 * 1000 // per hour
);
