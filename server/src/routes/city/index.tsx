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
import { validateParams } from "../../middleware/validate";
import { CitySlugParam, citySlugParamSchema } from "./schemas";
import { CityService } from "../../services/city.service";

export const cityRouter = new Hono();

cityRouter.get("/:slug", validateParams(citySlugParamSchema), async (c) => {
  const { slug } = c.get("validatedParams") as CitySlugParam;
  const result = await CityService.getCity(slug);

  return c.json(result, 200);
});

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
