import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Place, User } from "../../db/schema";
import { Resend } from "resend";
import { authMiddleware } from "../../middleware/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export const placeRouter = new Hono();

// Get a place by Slug
placeRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();
    if (!slug) {
      return c.json({ error: "Slug is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
      with: {
        images: true,
        tags: true,
      },
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    return c.json(place);
  } catch (error) {
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});
