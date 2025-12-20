import { db } from "../db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  Review,
  ReviewLike,
  ReviewReport,
  Place,
  ReviewImage,
} from "../db/schema";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
  AppError,
  UnauthorizedError,
} from "../lib/errors";
import { sanitizePlainText, sanitizeRichText } from "../lib/sanitize";
import { processReviewImagesInBackground } from "../lib/helpers";
import {
  type CreateReviewInput,
  type ReportReviewInput,
  type GetReviewsQuery,
  type EditReviewInput,
  editReviewSchema,
  EditReviewRequest,
} from "../routes/review/schemas";
import { Cloudinary } from "../lib/cloudinary";

/**
 * Review Service
 *
 * Handles all review-related business logic
 */
export class ReviewService {
  /**
   * Get all dog breeds
   */
  static async getDogBreeds() {
    try {
      const breeds = await db.query.DogBreed.findMany({
        orderBy: (breed, { asc }) => [asc(breed.name)],
      });

      const sortedBreeds = breeds.sort((a, b) => {
        if (a.name === "Mixed Breed") return -1;
        if (b.name === "Mixed Breed") return 1;
        return a.name.localeCompare(b.name);
      });

      return sortedBreeds;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch dog breeds", {
        originalError: error,
      });
    }
  }

  /**
   * Create a new review
   */
  static async createReview(userId: string, data: CreateReviewInput) {
    try {
      // 1. Sanitize user input
      const sanitizedData = {
        ...data,
        title: sanitizePlainText(data.title),
        content: sanitizeRichText(data.content),
        dogBreeds: data.dogBreeds.map((breed) => sanitizePlainText(breed)),
      };

      // 2. Check if user already reviewed this place
      const existingReview = await this.findUserReviewForPlace(
        userId,
        data.placeId
      );

      if (existingReview) {
        throw new ConflictError("You have already reviewed this place");
      }

      // 3. Prepare review data
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
        userId: userId,
      };

      // 4. Insert review into database
      const result = await db
        .insert(Review)
        .values(reviewData)
        .returning({ reviewId: Review.id });

      const reviewId = result[0].reviewId;

      // 5. Process images in background if any
      if (sanitizedData.images && sanitizedData.images.length > 0) {
        this.processReviewImages(
          reviewId,
          sanitizedData.images,
          sanitizedData.placeSlug
        );
      }

      return {
        success: true,
        placeId: sanitizedData.placeId,
        placeSlug: sanitizedData.placeSlug,
        reviewId: reviewId,
        message: "Review created! Images are being processed.",
      };
    } catch (error) {
      console.log("Error creating review:", error);
      if (
        error instanceof ConflictError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }

      // Wrap unknown errors
      throw new DatabaseError("Failed to create review", {
        originalError: error,
      });
    }
  }

  /**
   * Get reviews for a place
   */
  static async getPlaceReviews(
    placeSlug: string,
    query: GetReviewsQuery,
    userId?: string
  ) {
    try {
      // 1. Find the place
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, placeSlug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      console.log(query);

      // 2. Fetch reviews
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
              image: true,
            },
          },
          images: true,
          likes: true,
          reports: true,
        },
      });

      // 3. Add user-specific data if authenticated
      if (userId) {
        return reviews.map((review) => ({
          ...review,
          hasLiked: review.likes.some((like) => like.userId === userId),
          hasReported: review.reports.some(
            (report) => report.userId === userId
          ),
          likes: undefined,
          reports: undefined,
        }));
      }

      return reviews;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DatabaseError("Failed to fetch reviews", {
        originalError: error,
      });
    }
  }

  /**
   * Get review statistics for a place
   */
  static async getReviewStats(placeSlug: string) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, placeSlug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      // Get all reviews for rating breakdown
      const reviews = await db.query.Review.findMany({
        where: eq(Review.placeId, place.id),
        columns: {
          rating: true,
        },
      });

      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          reviewBreakdown: [
            { rating: 5, count: 0, percentage: 0 },
            { rating: 4, count: 0, percentage: 0 },
            { rating: 3, count: 0, percentage: 0 },
            { rating: 2, count: 0, percentage: 0 },
            { rating: 1, count: 0, percentage: 0 },
          ],
        };
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Number((totalRating / totalReviews).toFixed(1));

      // Calculate breakdown
      const breakdown = [5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.filter((r) => r.rating === rating).length;
        const percentage = Math.round((count / totalReviews) * 100);
        return { rating, count, percentage };
      });

      return {
        totalReviews,
        averageRating,
        reviewBreakdown: breakdown,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DatabaseError("Failed to fetch review stats", {
        originalError: error,
      });
    }
  }

  /**
   * Toggle like on a review
   */
  static async toggleReviewLike(userId: string, slug: string) {
    try {
      // 1. Get the place
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      // 2. Check if review exists
      const review = await db.query.Review.findFirst({
        where: eq(Review.id, place.id),
      });

      if (!review) {
        throw new NotFoundError("Review");
      }

      // 3. Can't like own review
      if (review.userId === userId) {
        throw new BadRequestError("You cannot like your own review");
      }

      // 4. Check if already liked
      const existingLike = await db.query.ReviewLike.findFirst({
        where: and(
          eq(ReviewLike.reviewId, review.id),
          eq(ReviewLike.userId, userId)
        ),
      });

      if (existingLike) {
        // Unlike: Remove like and decrement count
        await db.transaction(async (tx) => {
          await tx.delete(ReviewLike).where(eq(ReviewLike.id, existingLike.id));
          await tx
            .update(Review)
            .set({ likesCount: sql`${Review.likesCount} - 1` })
            .where(eq(Review.id, review.id));
        });

        return { action: "unliked" };
      } else {
        // Like: Add like and increment count
        await db.transaction(async (tx) => {
          await tx.insert(ReviewLike).values({
            userId: userId,
            reviewId: review.id,
            createdAt: new Date(),
          });
          await tx
            .update(Review)
            .set({ likesCount: sql`${Review.likesCount} + 1` })
            .where(eq(Review.id, review.id));
        });

        return { action: "liked" };
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }

      throw new DatabaseError("Failed to update review like", {
        originalError: error,
      });
    }
  }

  /**
   * Report a review
   */
  static async reportReview(
    userId: string,
    slug: string,
    reportData: ReportReviewInput
  ) {
    try {
      // 1. Get the place
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      // 2. Check if review exists
      const review = await db.query.Review.findFirst({
        where: eq(Review.placeId, place.id),
      });

      if (!review) {
        throw new NotFoundError("Review");
      }

      // 3. Can't report own review
      if (review.userId === userId) {
        throw new BadRequestError("You cannot report your own review");
      }

      // 4. Check if already reported
      const existingReport = await db.query.ReviewReport.findFirst({
        where: and(
          eq(ReviewReport.reviewId, review.id),
          eq(ReviewReport.userId, userId)
        ),
      });

      if (existingReport) {
        throw new ConflictError(
          "You have already reported this review. Update your report in your profile settings."
        );
      }

      // 5. Sanitize report data
      const sanitizedReport = {
        reason: sanitizePlainText(reportData.reason),
        details: sanitizeRichText(reportData.details || ""),
      };

      // 6. Create report
      await db.insert(ReviewReport).values({
        userId: userId,
        reviewId: review.id,
        reason: sanitizedReport.reason,
        details: sanitizedReport.details,
        status: "pending",
        reviewedAt: new Date(),
        reviewedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Report submitted successfully",
      };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError ||
        error instanceof ConflictError
      ) {
        throw error;
      }

      throw new DatabaseError("Failed to report review", {
        originalError: error,
      });
    }
  }

  static async deleteReview(userId: string, reviewId: string) {
    try {
      const reviewImages = await db.query.ReviewImage.findMany({
        where: eq(ReviewImage.reviewId, reviewId),
      });

      const review = await db.transaction(async (tx) => {
        await tx
          .delete(Review)
          .where(and(eq(Review.userId, userId), eq(Review.id, reviewId)));
        await tx.delete(ReviewImage).where(eq(ReviewImage.reviewId, reviewId));
        await tx.delete(ReviewLike).where(eq(ReviewLike.reviewId, reviewId));
        await tx
          .delete(ReviewReport)
          .where(eq(ReviewReport.reviewId, reviewId));

        const [review] = await tx
          .select({ id: Review.id })
          .from(Review)
          .where(eq(Review.id, reviewId));
        return review;
      });

      if (!review) {
        reviewImages.forEach(async (image) => {
          await Cloudinary.deleteImage(image.publicId);
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting review:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete review", {
        originalError: error,
      });
    }
  }

  static async editReview(
    userId: string,
    reviewId: string,
    data: EditReviewRequest
  ) {
    try {
      const review = await db.query.Review.findFirst({
        where: eq(Review.id, reviewId),
        with: {
          images: true,
        },
      });

      if (!review) {
        throw new NotFoundError("Review");
      }

      if (review.userId !== userId) {
        throw new UnauthorizedError("You cannot edit this review");
      }

      // Validate image count manually
      const remainingExisting =
        review.images.length - (data.imagesToDelete?.length || 0);
      const totalImages = remainingExisting + (data.newImages?.length || 0);

      if (totalImages > 6) {
        throw new BadRequestError(
          "Total images cannot exceed 6. Please remove some existing images before adding new ones."
        );
      }

      const validationData = {
        ...data,
        existingImageCount: review.images.length,
      };

      const result = editReviewSchema.safeParse(validationData);

      if (!result.success) {
        throw new BadRequestError("Invalid review data", {
          details: result.error.message,
        });
      }

      const resultData = {
        ...result.data,
        title: sanitizePlainText(result.data.title),
        content: sanitizeRichText(result.data.content),
        dogBreeds: result.data.dogBreeds.map((breed) =>
          sanitizePlainText(breed)
        ),
      };

      // Get images to delete (for Cloudinary cleanup)
      let imagesToDeleteFromCloudinary: { publicId: string }[] = [];

      if (data.imagesToDelete && data.imagesToDelete.length > 0) {
        imagesToDeleteFromCloudinary = await db.query.ReviewImage.findMany({
          where: inArray(ReviewImage.publicId, data.imagesToDelete),
          columns: {
            publicId: true,
          },
        });
      }

      await db.transaction(async (tx) => {
        // 1. Update the review
        await tx
          .update(Review)
          .set({
            rating: resultData.rating,
            title: resultData.title,
            content: resultData.content,
            visitDate: new Date(resultData.visitDate),
            numDogs: resultData.numDogs,
            dogBreeds: resultData.dogBreeds,
            timeOfVisit: resultData.timeOfVisit,
            isFirstVisit: resultData.isFirstVisit,
            updatedAt: new Date(),
          })
          .where(eq(Review.id, reviewId));

        // 2. Delete images from database
        if (data.imagesToDelete && data.imagesToDelete.length > 0) {
          await tx
            .delete(ReviewImage)
            .where(inArray(ReviewImage.publicId, data.imagesToDelete));
        }
      });

      // 3. Delete images from Cloudinary (outside transaction - external service)
      // If this fails, images will be orphaned in Cloudinary but DB is consistent
      if (imagesToDeleteFromCloudinary.length > 0) {
        const deletePromises = imagesToDeleteFromCloudinary.map((img) =>
          Cloudinary.deleteImage(img.publicId).catch((err) => {
            console.error(
              `Failed to delete image ${img.publicId} from Cloudinary:`,
              err
            );
            // Don't throw - log and continue
          })
        );
        await Promise.allSettled(deletePromises);
      }

      // 4. Process new images in background
      if (data.newImages && data.newImages.length > 0) {
        processReviewImagesInBackground(
          data.newImages,
          data.placeSlug,
          reviewId
        ).catch((err) => {
          console.error(
            `Failed to process images for review ${reviewId}:`,
            err
          );
        });
      }

      return {
        success: true,
        message: "Review updated successfully!",
        reviewId,
      };
    } catch (error) {
      console.error("Error editing review:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to edit review", {
        originalError: error,
      });
    }
  }

  /**
   * PRIVATE HELPER METHODS
   */

  /**
   * Find a user's existing review for a place
   */
  private static async findUserReviewForPlace(userId: string, placeId: string) {
    return await db.query.Review.findFirst({
      where: and(eq(Review.userId, userId), eq(Review.placeId, placeId)),
    });
  }

  /**
   * Process review images in the background
   */
  private static processReviewImages(
    reviewId: string,
    images: string[],
    placeSlug: string
  ) {
    setImmediate(() => {
      processReviewImagesInBackground(images, placeSlug, reviewId);
    });
  }
}
