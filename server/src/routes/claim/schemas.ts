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
  placeSlug: z.string().min(1, "Place slug is required"),
  businessId: z.string().min(1, "Business ID is required"),
  businessEmail: z.string().email("Invalid business email"),
  businessPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+64|0)[2-9]\d{7,9}$/, "Invalid New Zealand phone number"),
  role: claimRoleEnum,
  additionalNotes: z.string().optional(),
  verificationDocuments: z
    .object({
      data: z.string().min(1, "File data is required"),
      fileName: z.string().min(1, "File name is required"),
    })
    .array()
    .min(1, "At least one verification document is required")
    .max(10, "Maximum 10 files allowed"),
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
  placeSlug: z.string().min(1, "Invalid place slug"),
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

// Schema for admin getting claims with optional status filter
export const getClaimsAdminSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

//Schema for rejecting a claim
export const rejectClaimSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
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
export type GetClaimsAdminInput = z.infer<typeof getClaimsAdminSchema>;
export type RejectClaimInput = z.infer<typeof rejectClaimSchema>;
