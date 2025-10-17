import { Hono } from "hono";
import { db } from "../../db";
import { and, desc, eq, sql } from "drizzle-orm";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { Place, Review, ReviewLike, ReviewReport } from "../../db/schema";
import { processReviewImagesInBackground } from "../../lib/helpers";
import {
  reviewRateLimiter,
  readRateLimiter,
  writeRateLimiter,
} from "../../middleware/rate-limit";
import {
  AppError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors";
import { sanitizePlainText, sanitizeRichText } from "../../lib/sanitize";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  createReviewSchema,
  getReviewsQuerySchema,
  type CreateReviewInput,
  type ReportReviewInput,
  type GetReviewsQuery,
} from "./schemas";
import { ReviewService } from "../../services/review.service";

export const reviewRouter = new Hono();

/**
 * GET /review/breeds
 * Get all dog breeds
 */
reviewRouter.get("/breeds", readRateLimiter, async (c) => {
  const breeds = await ReviewService.getDogBreeds();
  return c.json({ breeds }, 200);
});

/**
 * POST /review/create
 * Create a new review
 */
reviewRouter.post(
  "/create",
  authMiddleware,
  reviewRateLimiter,
  validateBody(createReviewSchema),
  async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError();
    }

    const validatedData = c.get("validatedBody") as CreateReviewInput;

    const result = await ReviewService.createReview(user.id, validatedData);

    return c.json(result, 201);
  }
);

/**
 * GET /review/:slug
 * Get reviews for a place
 */
reviewRouter.get(
  "/:slug",
  optionalAuthMiddleware,
  readRateLimiter,
  validateQuery(getReviewsQuerySchema),
  async (c) => {
    const user = c.get("user");
    const { slug } = c.req.param();
    const query = c.get("validatedQuery") as GetReviewsQuery;

    const reviews = await ReviewService.getPlaceReviews(slug, query, user?.id);

    return c.json({ reviews }, 200);
  }
);

/**
 * GET /review/:slug/stats
 * Get review statistics for a place
 */
reviewRouter.get("/:slug/stats", async (c) => {
  const { slug } = c.req.param();

  const stats = await ReviewService.getReviewStats(slug);

  return c.json(stats, 200);
});

/**
 * POST /review/like/:reviewId
 * Like or unlike a review
 */
reviewRouter.post(
  "/:slug/like",
  authMiddleware,
  writeRateLimiter,
  async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No auth token");
    }

    const { slug } = c.req.param();

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const result = await ReviewService.toggleReviewLike(user.id, slug);

    return c.json({ success: true, ...result }, 200);
  }
);

/**
 * POST /review/report/:reviewId
 * Report a review
 */
reviewRouter.post(
  "/:slug/report",
  authMiddleware,
  writeRateLimiter,
  async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No auth token");
    }

    const { slug } = c.req.param();

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const reportData = c.get("validatedBody") as ReportReviewInput;

    const result = ReviewService.reportReview(user.id, slug, reportData);

    return c.json(result, 200);
  }
);
