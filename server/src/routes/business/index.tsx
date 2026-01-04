import { Resend } from "resend";
import { env } from "../../config/env";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { readRateLimiter } from "../../middleware/rate-limit";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  BusinessOwnerParam,
  CreateBusinessBody,
  createBusinessSchema,
  getBusinessByOwnerIdSchema,
} from "./schemas";
import { BusinessService } from "../../services/business.service";
import { UnauthorizedError } from "../../lib/errors";

const resend = new Resend(env.RESEND_API_KEY);

export const businessRouter = new Hono();

businessRouter.get(
  ":ownerId",
  authMiddleware,
  readRateLimiter,
  validateParams(getBusinessByOwnerIdSchema),
  async (c) => {
    const { ownerId } = c.req.param() as BusinessOwnerParam;
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = await BusinessService.getBusinessByOwnerId(ownerId);

    return c.json(result, 200);
  }
);

businessRouter.post(
  "/create",
  authMiddleware,
  validateBody(createBusinessSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const validatedData = c.get("validatedBody") as CreateBusinessBody;

    const result = await BusinessService.createBusiness(auth.id, validatedData);

    return c.json(result, 201);
  }
);
