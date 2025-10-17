import { Hono } from "hono";
import { validateParams } from "../../middleware/validate";
import { IslandSlugParam, islandSlugParamSchema } from "./schemas";
import { IslandService } from "../../services/island.service";
import { BadRequestError } from "../../lib/errors";

export const islandRouter = new Hono();

islandRouter.get("/:slug", validateParams(islandSlugParamSchema), async (c) => {
  const { slug } = c.get("validatedParams") as IslandSlugParam;

  if (!slug) {
    throw new BadRequestError("Slug is required");
  }

  const result = await IslandService.getIsland(slug);

  return c.json(result, 200);
});
