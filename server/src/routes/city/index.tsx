import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { City } from "../../db/schema";

export const cityRouter = new Hono();

cityRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "No slug provided" }, 400);
    }

    const city = await db.query.City.findFirst({
      where: eq(City.slug, slug),
    });

    if (!city) {
      return c.json({ error: "City not found" }, 404);
    }

    return c.json({
      city,
    });
  } catch (error) {
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});
