import { Hono } from "hono";
import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { Google } from "../../lib/google";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";

export const reviewRouter = new Hono();

reviewRouter.get("/breeds", async (c) => {
  try {
    const breeds = await db.query.DogBreed.findMany({
      orderBy: (breed, { asc }) => [asc(breed.name)],
    });

    const sortedBreeds = breeds.sort((a, b) => {
      if (a.name === "Mixed Breed") return -1;
      if (b.name === "Mixed Breed") return 1;
      return a.name.localeCompare(b.name);
    });

    return c.json({ breeds: sortedBreeds }, 200);
  } catch (error) {
    console.error("Error fetching dog breeds:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
