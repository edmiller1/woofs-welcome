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

export const reviewRouter = new Hono();

// Read endpoint - lenient (100 req/15min)
reviewRouter.get("/breeds", readRateLimiter, async (c) => {
  try {
    const breeds = await db.query.DogBreed.findMany({
      orderBy: (breed, { asc }) => [asc(breed.name)],
    });

    const sortedBreeds = breeds.sort((a, b) => {
      if (a.name === "Mixed Breed") return -1;
      if (b.name === "Mixed Breed") return 1;
      return a.name.localeCompare(b.name);
    });

    return c.json({ breeds: sortedBreeds }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch dog breeds", {
      originalError: error,
    });
  }
});

// (5 reviews/hour per user)
// Create review
reviewRouter.post(
  "/create",
  authMiddleware,
  reviewRateLimiter,
  validateBody(createReviewSchema), // ← Add validation
  async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError();
    }

    try {
      // Get validated body data
      const validatedData = c.get("validatedBody") as CreateReviewInput;

      // ✅ SANITIZE USER INPUT
      const sanitizedData = {
        ...validatedData,
        title: sanitizePlainText(validatedData.title),
        content: sanitizeRichText(validatedData.content),
        dogBreeds: validatedData.dogBreeds.map((breed) =>
          sanitizePlainText(breed)
        ),
      };

      // Check for existing review
      const existingReview = await db
        .select({ id: Review.id })
        .from(Review)
        .where(
          and(
            eq(Review.userId, user.id),
            eq(Review.placeId, sanitizedData.placeId)
          )
        )
        .limit(1);

      if (existingReview.length > 0) {
        throw new ConflictError("You have already reviewed this place");
      }

      const reviewData = {
        rating: sanitizedData.rating,
        title: sanitizedData.title,
        content: sanitizedData.content,
        visitDate: new Date(sanitizedData.visitDate),
        numDogs: sanitizedData.numDogs,
        dogBreeds: sanitizedData.dogBreeds,
        timeOfVisit: sanitizedData.timeOfVisit,
        isFirstVisit: sanitizedData.isFirstVisit,
        placeId: sanitizedData.placeId,
        userId: user.id,
      };

      const result = await db
        .insert(Review)
        .values(reviewData)
        .returning({ reviewId: Review.id });

      const reviewId = result[0].reviewId;

      // Background image processing
      if (sanitizedData.images.length > 0) {
        setImmediate(() => {
          processReviewImagesInBackground(
            sanitizedData.images,
            sanitizedData.placeSlug,
            reviewId
          );
        });
      }

      return c.json(
        {
          success: true,
          placeId: sanitizedData.placeId,
          placeSlug: sanitizedData.placeSlug,
          reviewId: reviewId,
          message: "Review created! Images are being processed.",
        },
        201
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to create review", {
        originalError: error,
      });
    }
  }
);

reviewRouter.get(
  "/:slug",
  optionalAuthMiddleware,
  readRateLimiter,
  validateQuery(getReviewsQuerySchema),
  async (c) => {
    try {
      const user = c.get("user");

      const { slug } = c.req.param();

      const query = c.get("validatedQuery") as GetReviewsQuery;

      if (!slug) {
        throw new BadRequestError("Place slug is required");
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const reviews = await db.query.Review.findMany({
        where: eq(Review.placeId, place.id),
        orderBy: desc(Review.createdAt),
        limit: query.limit,
        offset: query.page * query.limit,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              emailVerified: true,
              image: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          images: true,
          likes: true,
          reports: true,
        },
      });

      if (user) {
        const reviewsWithLikeStatus = reviews.map((review) => ({
          ...review,
          hasLiked: review.likes.some((like) => like.userId === user?.id),
          hasReported: review.reports.some(
            (report) => report.userId === user?.id
          ),
          likes: undefined,
        }));

        return c.json({ reviews: reviewsWithLikeStatus }, 200);
      }

      return c.json({ reviews }, 200);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch reviews", {
        originalError: error,
      });
    }
  }
);

reviewRouter.get("/:slug/stats", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      throw new BadRequestError("Place slug is required");
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      throw new NotFoundError("Place");
    }

    const reviewStats = await db
      .select({
        rating: Review.rating,
        count: sql<number>`COUNT(*)`,
      })
      .from(Review)
      .where(eq(Review.placeId, place.id))
      .groupBy(Review.rating);

    const totalReviews = reviewStats.reduce(
      (sum, r) => sum + Number(r.count),
      0
    );

    if (totalReviews === 0) {
      return c.json({
        totalReviews: 0,
        averageRating: 0,
        breakdown: Array.from({ length: 5 }, (_, i) => ({
          rating: 5 - i,
          count: 0,
          percentage: 0,
        })),
      });
    }

    const totalPoints = reviewStats.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating = totalPoints / totalReviews;

    const reviewBreakdown = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const found = reviewStats.find((r) => r.rating === rating);
      const count = found?.count || 0;
      const percentage = Math.round((count / totalReviews) * 100);

      return {
        rating,
        count,
        percentage,
      };
    });

    return c.json(
      {
        totalReviews: Number(totalReviews),
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewBreakdown,
      },
      200
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch review stats", {
      originalError: error,
    });
  }
});

// 20 req/15min
reviewRouter.post(
  "/:slug/like",
  authMiddleware,
  writeRateLimiter,
  async (c) => {
    try {
      const user = c.get("user");

      if (!user) {
        throw new UnauthorizedError("No auth token");
      }

      const { slug } = c.req.param();

      if (!slug) {
        throw new BadRequestError("Review slug is required");
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const review = await db.query.Review.findFirst({
        where: eq(Review.placeId, place.id),
      });

      if (!review) {
        throw new NotFoundError("Review");
      }

      if (review.userId === user.id) {
        throw new ConflictError("You cannot like your own review");
      }

      const existingLike = await db.query.ReviewLike.findFirst({
        where: and(
          eq(ReviewLike.userId, user.id),
          eq(ReviewLike.reviewId, review.id)
        ),
      });

      if (existingLike) {
        await db.transaction(async (tx) => {
          await tx.delete(ReviewLike).where(eq(ReviewLike.id, existingLike.id));
          await tx
            .update(Review)
            .set({ likesCount: sql`${Review.likesCount} - 1` })
            .where(eq(Review.id, review.id));
        });
        await db.delete(ReviewLike).where(eq(ReviewLike.id, existingLike.id));
        return c.json({ success: true, action: "removed" }, 200);
      } else {
        await db.transaction(async (tx) => {
          await tx.insert(ReviewLike).values({
            userId: user.id,
            reviewId: review.id,
            createdAt: new Date(),
          });
          await tx
            .update(Review)
            .set({ likesCount: sql`${Review.likesCount} + 1` })
            .where(eq(Review.id, review.id));
        });
        return c.json({ success: true, action: "added" }, 200);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to liking/unliking review", {
        originalError: error,
      });
    }
  }
);

// 20 req/15min
reviewRouter.post(
  "/:slug/report",
  authMiddleware,
  writeRateLimiter,
  async (c) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No auth token");
    }
    try {
      const { slug } = c.req.param();

      if (!slug) {
        throw new BadRequestError("Review slug is required");
      }

      const reportData = c.get("validatedBody") as ReportReviewInput;

      // ✅ SANITIZE REPORT DATA
      const sanitizedReport = {
        reason: sanitizePlainText(reportData.reason),
        details: sanitizeRichText(reportData.details || ""),
      };

      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const review = await db.query.Review.findFirst({
        where: eq(Review.placeId, place.id),
      });

      if (!review) {
        throw new NotFoundError("Review");
      }

      if (review.userId === user.id) {
        throw new BadRequestError("You cannot report your own review");
      }

      const existingReport = await db.query.ReviewReport.findFirst({
        where: and(
          eq(ReviewReport.userId, user.id),
          eq(ReviewReport.reviewId, review.id)
        ),
      });

      if (existingReport) {
        throw new ConflictError(
          "You have already reported this review, if you want to update you report please do so in your profile settings."
        );
      }

      await db.insert(ReviewReport).values({
        userId: user.id,
        reviewId: review.id,
        reason: sanitizedReport.reason,
        details: sanitizedReport.details,
        status: "pending",
        reviewedAt: new Date(),
        reviewedBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return c.json({ success: true, action: "added" }, 200);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to report review", {
        originalError: error,
      });
    }
  }
);
