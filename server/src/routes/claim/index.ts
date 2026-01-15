import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  CheckClaimEligibilityInput,
  checkClaimEligibilitySchema,
  GetBusinessClaimsInput,
  getBusinessClaimsSchema,
  GetClaimByIdInput,
  getClaimByIdSchema,
  GetClaimsAdminInput,
  getClaimsAdminSchema,
  RejectClaimInput,
  rejectClaimSchema,
  SubmitClaimInput,
  submitClaimSchema,
  UploadVerificationDocsInput,
  uploadVerificationDocsSchema,
} from "./schemas";
import { BadRequestError, UnauthorizedError } from "../../lib/errors";
import { ClaimService } from "../../services/claim.service";

export const claimRouter = new Hono();

/**
 * GET /claims/eligibility/:placeId
 * Check if a place can be claimed
 */
claimRouter.get(
  "/eligibility/:placeSlug",
  authMiddleware,
  validateParams(checkClaimEligibilitySchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeSlug } = c.get(
      "validatedParams"
    ) as CheckClaimEligibilityInput;

    const result = await ClaimService.checkClaimEligibility(placeSlug);

    return c.json(result, 200);
  }
);

/**
 * POST /claims/submit
 * Submit a new claim for a place with verification documents
 */
claimRouter.post(
  "/submit",
  authMiddleware,
  validateBody(submitClaimSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const body = c.get("validatedBody") as SubmitClaimInput;

    const result = await ClaimService.submitClaim(
      auth.id,
      body,
      body.verificationDocuments
    );

    return c.json(result, 201);
  }
);

/**
 * POST /claims/:claimId/documents
 * Upload verification documents for a claim
 */
claimRouter.post(
  "/:claimId/documents",
  authMiddleware,
  validateParams(getClaimByIdSchema),
  validateBody(uploadVerificationDocsSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { claimId } = c.get("validatedParams") as GetClaimByIdInput;

    const files = c.get("validatedBody") as UploadVerificationDocsInput;

    if (files.length === 0) {
      throw new BadRequestError("No files provided");
    }

    const result = await ClaimService.addVerificationDocuments(
      claimId,
      auth.id,
      files
    );

    return c.json(result, 200);
  }
);

/**
 * GET /claims/:claimId
 * Get claim details by ID
 */
claimRouter.get(
  "/:claimId",
  authMiddleware,
  validateParams(getClaimByIdSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { claimId } = c.req.param() as GetClaimByIdInput;

    const result = await ClaimService.getClaimById(claimId, auth.id);

    return c.json(result, 200);
  }
);

/**
 * GET /claims/business/:businessId
 * Get all claims for a business
 */
claimRouter.get(
  "/business/:businessId",
  authMiddleware,
  validateParams(getBusinessClaimsSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { businessId } = c.get("validatedParams") as GetBusinessClaimsInput;

    const result = await ClaimService.getBusinessClaims(businessId, auth.id);

    return c.json(result, 200);
  }
);

/**
 * ADMIN ROUTES
 * All routes below require admin access
 */

/**
 * GET /claims/admin/pending
 * Admin: Get all pending claims
 */
claimRouter.get("/admin/pending", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const isAdmin = c.get("isAdmin");

  if (!isAdmin) {
    throw new UnauthorizedError("Unauthorized");
  }

  const claims = await ClaimService.getPendingClaims();

  return c.json({
    success: true,
    data: claims,
  });
});

/**
 * GET /claims/admin/all
 * Admin: Get all claims with optional status filter
 */
claimRouter.get(
  "/admin/all",
  authMiddleware,
  validateBody(getClaimsAdminSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const isAdmin = c.get("isAdmin");

    if (!isAdmin) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { status } = c.get("validatedBody") as GetClaimsAdminInput;

    const result = await ClaimService.getAllClaims(status);

    return c.json(result, 200);
  }
);

/**
 * POST /claims/admin/:claimId/approve
 * Admin: Approve a claim
 */
claimRouter.post(
  "/admin/:claimId/approve",
  authMiddleware,
  validateParams(getClaimByIdSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const isAdmin = c.get("isAdmin");

    if (!isAdmin) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { claimId } = c.req.param() as GetClaimByIdInput;

    const result = await ClaimService.approveClaim(claimId, auth.id);

    return c.json(result, 200);
  }
);

/**
 * POST /claims/admin/:claimId/reject
 * Admin: Reject a claim
 */
claimRouter.post(
  "admin/:claimId/reject",
  authMiddleware,
  validateParams(getClaimByIdSchema),
  validateBody(rejectClaimSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const isAdmin = c.get("isAdmin");

    if (!isAdmin) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { claimId } = c.get("validatedParams") as GetClaimByIdInput;

    const { rejectionReason } = c.get("validatedBody") as RejectClaimInput;

    const result = await ClaimService.rejectClaim(
      claimId,
      auth.id,
      rejectionReason
    );

    return c.json(result, 200);
  }
);
