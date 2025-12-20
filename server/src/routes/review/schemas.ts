import { z } from "zod";

export const reviewIdParamSchema = z.object({
  reviewId: z.string().uuid("Invalid review ID"),
});

export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>;

export const createReviewSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
  placeSlug: z.string().min(1, "Place slug is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(20, "Review content must be at least 20 characters")
    .max(2000, "Review content must be less than 2000 characters"),
  visitDate: z.string().date("Invalid date format"),
  numDogs: z
    .number()
    .int()
    .min(1)
    .max(10, "Number of dogs must be between 1 and 10"),
  dogBreeds: z
    .array(z.string())
    .min(1, "At least one dog breed is required")
    .max(6, "Maximum 6 dog breeds allowed"),
  timeOfVisit: z.enum(["morning", "afternoon", "evening"], {
    errorMap: () => ({ message: "Invalid time of visit" }),
  }),
  isFirstVisit: z.boolean(),
  images: z
    .array(z.string())
    .max(6, "Maximum 6 images allowed")
    .optional()
    .default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reportReviewSchema = z.object({
  reason: z.enum(
    [
      "sexuallyExplicit",
      "hateSpeech",
      "violence",
      "falseInformation",
      "notPersonal",
      "wrongPlace",
      "spam",
      "other",
    ],
    {
      errorMap: () => ({ message: "Invalid report reason" }),
    }
  ),
  details: z
    .string()
    .max(500, "Details must be less than 500 characters")
    .optional()
    .default(""),
});

export type ReportReviewInput = z.infer<typeof reportReviewSchema>;

export const getReviewsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional()
    .default("0"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default("10"),
  sortBy: z.enum(["recent", "helpful", "rating"]).optional().default("recent"),
});

export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;

// What the frontend sends
export const editReviewRequestSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
  placeSlug: z.string().min(1, "Place slug is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(20, "Review content must be at least 20 characters")
    .max(2000, "Review content must be less than 2000 characters"),
  visitDate: z.string().date("Invalid date format"),
  numDogs: z
    .number()
    .int()
    .min(1)
    .max(10, "Number of dogs must be between 1 and 10"),
  dogBreeds: z
    .array(z.string())
    .min(1, "At least one dog breed is required")
    .max(6, "Maximum 6 dog breeds allowed"),
  timeOfVisit: z.enum(["morning", "afternoon", "evening"], {
    errorMap: () => ({ message: "Invalid time of visit" }),
  }),
  isFirstVisit: z.boolean(),
  newImages: z.array(z.string()).optional().default([]),
  imagesToDelete: z.array(z.string()).optional().default([]),
});

// Internal schema (used in service layer with existingImageCount added)
export const editReviewSchema = editReviewRequestSchema
  .extend({
    existingImageCount: z.number().int().min(0).optional().default(0),
  })
  .refine(
    (data) => {
      const remainingExisting =
        data.existingImageCount - (data.imagesToDelete?.length || 0);
      const newImagesCount = data.newImages?.length || 0;
      const totalImages = remainingExisting + newImagesCount;

      return totalImages <= 6;
    },
    {
      message:
        "Total images cannot exceed 6. Please remove some existing images before adding new ones.",
      path: ["newImages"],
    }
  );

export type EditReviewRequest = z.infer<typeof editReviewRequestSchema>;
export type EditReviewInput = z.infer<typeof editReviewSchema>;
