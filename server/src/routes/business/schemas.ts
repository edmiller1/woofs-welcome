import { z } from "zod";

export const getBusinessByOwnerIdSchema = z.object({
  ownerId: z.string().min(1, "Owner ID is required"),
});
export type BusinessOwnerParam = z.infer<typeof getBusinessByOwnerIdSchema>;

export const createBusinessSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  website: z.string().url("Invalid URL"),
  description: z.string().min(10, "Description is required"),
});

export type CreateBusinessBody = z.infer<typeof createBusinessSchema>;
