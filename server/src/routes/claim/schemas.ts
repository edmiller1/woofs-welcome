import { z } from "zod";

// Role options for the claimer
export const claimRoleEnum = z.enum([
  "Owner",
  "Manager",
  "Marketing Manager",
  "Staff",
  "Other",
]);

// Schema for submitting a claim
export const submitClaimSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
  businessId: z.string().min(1, "Business ID is required"),
  businessEmail: z.string().email("Invalid business email"),
  businessPhone: z.string().min(5, "Phone number is required"),
  role: claimRoleEnum,
  additionalNotes: z.string().optional(),
});

// Schema for uploading verification documents
export const uploadVerificationDocsSchema = z
  .object({
    data: z.string().min(1, "File data is required"),
    fileName: z.string().min(1, "File name is required"),
  })
  .array();

// Schema for checking if a place can be claimed
export const checkClaimEligibilitySchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
});

// Schema for getting claims by business
export const getBusinessClaimsSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
});

// Schema for getting claim by ID
export const getClaimByIdSchema = z.object({
  claimId: z.string().uuid("Invalid claim ID"),
});

// Schema for admin approval/rejection
export const reviewClaimSchema = z.object({
  claimId: z.string().uuid("Invalid claim ID"),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export type SubmitClaimInput = z.infer<typeof submitClaimSchema>;
export type UploadVerificationDocsInput = z.infer<
  typeof uploadVerificationDocsSchema
>;
export type CheckClaimEligibilityInput = z.infer<
  typeof checkClaimEligibilitySchema
>;
export type GetClaimByIdInput = z.infer<typeof getClaimByIdSchema>;
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;
export type GetBusinessClaimsInput = z.infer<typeof getBusinessClaimsSchema>;
