import { z } from "zod";

export const createProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  isBusinessAccount: z.boolean().default(false),
  provider: z.string(),
  businessName: z.string().optional(),
  businessEmail: z.string().email("Invalid email format").optional(),
  businessPhone: z.string().optional(),
}).refine((data) => {
  // If it's a business account, require business details
  if (data.isBusinessAccount) {
    return data.businessName && data.businessName.length > 0;
  }
  return true;
}, {
  message: "Business name is required for business accounts",
  path: ["businessName"],
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;