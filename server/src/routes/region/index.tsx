import { Hono } from "hono";
import { BadRequestError } from "../../lib/errors";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  RegionPlacesAndEventsQuery,
  regionPlacesAndEventsSchema,
  RegionSlugParam,
  regionSlugParamSchema,
} from "./schemas";
import { RegionService } from "../../services/region.service";
import { readRateLimiter } from "../../middleware/rate-limit";
import { optionalAuthMiddleware } from "../../middleware/auth";

export const regionRouter = new Hono();

regionRouter.get("/:slug", validateParams(regionSlugParamSchema), async (c) => {
  const { slug } = c.get("validatedParams") as RegionSlugParam;

  if (!slug) {
    throw new BadRequestError("Slug is required");
  }

  const result = await RegionService.getRegion(slug);

  return c.json(result, 200);
});

regionRouter.get(
  "/:slug/places",
  readRateLimiter,
  optionalAuthMiddleware,
  validateParams(regionSlugParamSchema),
  validateQuery(regionPlacesAndEventsSchema),
  async (c) => {
    const { slug } = c.req.param() as RegionSlugParam;
    const query = c.get("validatedQuery") as RegionPlacesAndEventsQuery;
    const auth = c.get("user");

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const result = await RegionService.getRegionPlacesAndEvents(
      slug,
      query,
      auth?.id
    );

    return c.json(result, 200);
  }
);
