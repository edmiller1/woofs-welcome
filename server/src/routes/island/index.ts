import { Hono } from "hono";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  IslandPlacesAndEventsQuery,
  islandPlacesAndEventsSchema,
  IslandSlugParam,
  islandSlugParamSchema,
} from "./schemas";
import { IslandService } from "../../services/island.service";
import { BadRequestError } from "../../lib/errors";
import { readRateLimiter } from "../../middleware/rate-limit";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { auth } from "../../lib/auth";

export const islandRouter = new Hono();

islandRouter.get(
  "/:slug",
  optionalAuthMiddleware,
  validateParams(islandSlugParamSchema),
  async (c) => {
    const { slug } = c.get("validatedParams") as IslandSlugParam;
    const auth = c.get("user");

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const result = await IslandService.getIsland(slug, auth?.id);

    return c.json(result, 200);
  }
);

islandRouter.get(
  "/:slug/places",
  readRateLimiter,
  optionalAuthMiddleware,
  validateParams(islandSlugParamSchema),
  validateQuery(islandPlacesAndEventsSchema),
  async (c) => {
    const { slug } = c.get("validatedParams") as IslandSlugParam;
    const query = c.get("validatedQuery") as IslandPlacesAndEventsQuery;
    const auth = c.get("user");

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const result = await IslandService.getIslandPlacesAndEvents(
      slug,
      query,
      auth?.id
    );

    return c.json(result, 200);
  }
);
