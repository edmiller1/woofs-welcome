import { Hono } from "hono";
import { db } from "../../db";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
  readRateLimiter,
  favouriteRateLimiter,
} from "../../middleware/rate-limit";
import { UnauthorizedError } from "../../lib/errors";
import { validateParams } from "../../middleware/validate";
import {
  PlaceIdParam,
  placeIdParamSchema,
  PlaceSlugParam,
  placeSlugParamSchema,
} from "./schemas";
import { PlaceService } from "../../services/place.service";

export const placeRouter = new Hono();

/**
 * GET /place/:slug
 * Get a place by slug
 */
placeRouter.get(
  "/:slug",
  readRateLimiter,
  optionalAuthMiddleware,
  validateParams(placeSlugParamSchema),
  async (c) => {
    const { slug } = c.req.param() as PlaceSlugParam;
    const auth = c.get("user");

    const result = await PlaceService.getPlace(slug, auth?.id);

    return c.json(result, 200);
  }
);

placeRouter.get("/", readRateLimiter, async (c) => {
  const places = await db.query.Place.findMany({
    with: {
      images: true,
      city: {
        with: {
          region: true,
        },
      },
    },
  });

  return c.json(places, 200);
});

/**
 * POST /place/:placeId/favourite
 * Toggle a place's favourite status
 */
placeRouter.post(
  "/:placeId/favourite",
  authMiddleware,
  favouriteRateLimiter,
  validateParams(placeIdParamSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError();
    }
    const { placeId } = c.req.param() as PlaceIdParam;

    const result = await PlaceService.togglePlaceLike(auth?.id, placeId);

    return c.json(result, 200);
  }
);

/**
 * GET /place/list/types
 * Get all place types
 */
placeRouter.get("/list/types", async (c) => {
  return c.json(await PlaceService.getPlaceTypes(), 200);
});

placeRouter.get("/list/random", async (c) => {
  const places = await PlaceService.getRandomPlaces();

  return c.json({ places }, 200);
});

placeRouter.get(
  "/nearby/:slug",
  optionalAuthMiddleware,
  validateParams(placeSlugParamSchema),
  async (c) => {
    const { slug } = c.req.param() as PlaceSlugParam;
    const auth = c.get("user");
    const { lat, lng, radius } = c.req.query();
    const limit = parseInt("10"); // Default 10 places

    const result = await PlaceService.getNearbyPlaces(
      slug,
      parseFloat(lat || "0"),
      parseFloat(lng || "0"),
      parseFloat(radius || "5"),
      limit,
      auth?.id
    );
    return c.json(result, 200);
  }
);
