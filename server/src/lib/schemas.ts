import { z } from "zod";

export const reviewFormSchema = z.object({
  // Core fields
  rating: z
    .number()
    .min(1, "Rating is required")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(30, "Review must be less than 30 characters"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be less than 1000 characters"),
  visitDate: z.string({ required_error: "Visit date is required" }),

  // Dog details
  numDogs: z
    .number()
    .min(1, "Must have at least 1 dog")
    .max(10, "Maximum 10 dogs allowed"),
  dogBreeds: z.array(z.string()).min(1, "Please select at least one dog breed"),
  timeOfVisit: z.enum(["morning", "afternoon", "evening"], {
    required_error: "Please select time of visit",
  }),

  isFirstVisit: z.boolean().default(true),
  images: z.array(z.string()).max(6, "Maximum 6 images allowed"),
  placeId: z.string({ required_error: "Place ID is required" }),
  placeSlug: z.string({ required_error: "Place slug is required" }),
});

export const reviewReportSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  details: z.string().min(1, "Details are required"),
});
