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
  "/eligibility/:placeId",
  authMiddleware,
  validateParams(checkClaimEligibilitySchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId } = c.get("validatedParams") as CheckClaimEligibilityInput;

    const result = await ClaimService.checkClaimEligibility(placeId);

    return c.json(result, 200);
  }
);

/**
 * POST /claims/submit
 * Submit a new claim for a place
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

    const result = ClaimService.submitClaim(auth.id, body);

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
