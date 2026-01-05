import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { getBusiness, getUserBusiness } from "../../lib/helpers";
import { NotFoundError, UnauthorizedError } from "../../lib/errors";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  GetViewsByPlaceParam,
  getViewsByPlaceParamSchema,
  TrackViewInput,
  trackViewSchema,
} from "./schemas";
import { AnalyticsRepository } from "../../repositories/analytics.repository";
import { AnalyticsService } from "../../services/analytics.service";

export const analyticsRouter = new Hono();

analyticsRouter.post(
  "/view",
  authMiddleware,
  validateBody(trackViewSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId, sessionId, source, referrer, city, region, deviceType } =
      c.get("validatedBody") as TrackViewInput;

    const business = await getBusiness(auth.id);

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    const result = await AnalyticsRepository.recordView({
      placeId,
      sessionId,
      source,
      referrer,
      city,
      region,
      deviceType,
    });

    return c.json(
      {
        success: true,
        counted: result.counted,
        reason: result.reason,
      },
      201
    );
  }
);

analyticsRouter.get(
  "/view/:placeId",
  authMiddleware,
  validateParams(getViewsByPlaceParamSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }
    const { placeId } = c.get("validatedParams") as GetViewsByPlaceParam;

    const business = await getBusiness(auth.id);

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    const result = await AnalyticsService.getPlaceAnalytics(
      placeId,
      business.id,
      auth.id
    );

    return c.json(result, 200);
  }
);

// Get analytics for all places in a business
analyticsRouter.get("/view/places", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const business = await getBusiness(auth.id);

  if (!business) {
    throw new NotFoundError("Business not found");
  }

  const isOwner = await getUserBusiness(auth.id);

  if (!isOwner) {
    throw new UnauthorizedError("You do not own this business");
  }
});

analyticsRouter.get("/view/:placeId/realtime", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const { placeId } = c.req.param() as GetViewsByPlaceParam;

  const result = await AnalyticsRepository.getRealtimeStats(placeId);

  return c.json(result, 200);
});

analyticsRouter.get("/view/:placeId/sources", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }
  const { placeId } = c.req.param() as GetViewsByPlaceParam;
});
