import { Hono } from "hono";
import { db } from "../../db";
import { and, desc, eq, sql } from "drizzle-orm";
import { Resend } from "resend";
import { Google } from "../../lib/google";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { reviewFormSchema, reviewReportSchema } from "../../lib/schemas";
import {
  Place,
  Review,
  ReviewImage,
  ReviewLike,
  ReviewReport,
} from "../../db/schema";
import { processReviewImagesInBackground } from "../../lib/helpers";

export const reviewRouter = new Hono();

reviewRouter.get("/breeds", async (c) => {
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
    console.error("Error fetching dog breeds:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

reviewRouter.post("/create", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = reviewFormSchema.parse(body);

    const existingReview = await db
      .select({ id: Review.id })
      .from(Review)
      .where(
        and(
          eq(Review.userId, user.id),
          eq(Review.placeId, validatedData.placeId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return c.json({ error: "You have already reviewed this place" }, 409);
    }

    const reviewData = {
      rating: validatedData.rating,
      title: validatedData.title,
      content: validatedData.content,
      visitDate: new Date(validatedData.visitDate),
      numDogs: validatedData.numDogs,
      dogBreeds: validatedData.dogBreeds,
      timeOfVisit: validatedData.timeOfVisit,
      isFirstVisit: validatedData.isFirstVisit,
      placeId: validatedData.placeId,
      userId: user.id,
    };

    const result = await db
      .insert(Review)
      .values(reviewData)
      .returning({ reviewId: Review.id });

    const reviewId = result[0].reviewId;

    if (validatedData.images.length > 0) {
      setImmediate(() => {
        processReviewImagesInBackground(
          validatedData.images,
          validatedData.placeSlug,
          reviewId
        );
      });
    }

    return c.json(
      {
        success: true,
        placeId: validatedData.placeId,
        placeSlug: validatedData.placeSlug,
        reviewId: reviewId,
        message: "Review created! Images are being processed.",
      },
      201
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

reviewRouter.get("/:slug", optionalAuthMiddleware, async (c) => {
  try {
    const user = c.get("user");

    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Place slug is required" }, 400);
    }

    const page = Number(c.req.query("page")) || 0;

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    const reviews = await db.query.Review.findMany({
      where: eq(Review.placeId, place.id),
      orderBy: desc(Review.createdAt),
      limit: 10,
      offset: page * 10,
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
    console.error("Error fetching reviews:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

reviewRouter.get("/:slug/stats", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Place slug is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
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
    console.error("Error fetching review stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

reviewRouter.post("/:slug/like", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Review slug is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    const review = await db.query.Review.findFirst({
      where: eq(Review.placeId, place.id),
    });

    if (!review) {
      return c.json({ error: "Review not found" }, 404);
    }

    if (review.userId === user.id) {
      return c.json({ error: "You cannot like your own review" }, 400);
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
    console.error("Error liking/unliking review:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

reviewRouter.post("/:slug/report", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Review slug is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    const review = await db.query.Review.findFirst({
      where: eq(Review.placeId, place.id),
    });

    if (!review) {
      return c.json({ error: "Review not found" }, 404);
    }

    if (review.userId === user.id) {
      return c.json({ error: "You cannot report your own review" }, 400);
    }

    const existingReport = await db.query.ReviewReport.findFirst({
      where: and(
        eq(ReviewReport.userId, user.id),
        eq(ReviewReport.reviewId, review.id)
      ),
    });

    if (existingReport) {
      return c.json(
        {
          error:
            "You have already reported this review, if you want to update you report please do so in your profile settings.",
        },
        400
      );
    }

    const body = await c.req.json();
    const validatedData = reviewReportSchema.parse(body);

    await db.insert(ReviewReport).values({
      userId: user.id,
      reviewId: review.id,
      reason: validatedData.reason,
      details: validatedData.details,
      status: "pending",
      reviewedAt: new Date(),
      reviewedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json({ success: true, action: "added" }, 200);
  } catch (error) {
    console.error("Error reporting review:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
