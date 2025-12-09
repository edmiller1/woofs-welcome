import { Hono } from "hono";
import { db } from "../../db";
import {
  and,
  arrayContains,
  asc,
  count,
  eq,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { City, Place, PlaceImage, Region } from "../../db/schema";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from "../../lib/errors";
import { validateParams, validateQuery } from "../../middleware/validate";
import {
  CityPlacesAndEventsQuery,
  cityPlacesAndEventsSchema,
  CitySlugParam,
  citySlugParamSchema,
} from "./schemas";
import { CityService } from "../../services/city.service";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { readRateLimiter } from "../../middleware/rate-limit";

export const cityRouter = new Hono();

cityRouter.get(
  "/:slug",
  optionalAuthMiddleware,
  validateParams(citySlugParamSchema),
  async (c) => {
    const { slug } = c.get("validatedParams") as CitySlugParam;
    const auth = c.get("user");
    const result = await CityService.getCity(slug, auth?.id);

    return c.json(result, 200);
  }
);

cityRouter.get("/list/cities", async (c) => {
  try {
    const cities = await db.query.City.findMany({
      orderBy: [asc(City.name)],
    });

    return c.json(cities, 200);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return c.json({ error: "Failed to fetch cities" }, 500);
  }
});

cityRouter.get(
  "/:slug/places",
  readRateLimiter,
  optionalAuthMiddleware,
  validateParams(citySlugParamSchema),
  validateQuery(cityPlacesAndEventsSchema),
  async (c) => {
    const { slug } = c.req.param() as CitySlugParam;
    const query = c.get("validatedQuery") as CityPlacesAndEventsQuery;
    const auth = c.get("user");

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const result = await CityService.getCityPlacesAndEvents(
      slug,
      query,
      auth?.id
    );

    return c.json(result, 200);
  }
);
