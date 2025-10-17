import { Hono } from "hono";
import { BadRequestError } from "../../lib/errors";
import { validateParams } from "../../middleware/validate";
import { RegionSlugParam, regionSlugParamSchema } from "./schemas";
import { RegionService } from "../../services/region.service";

export const regionRouter = new Hono();

regionRouter.get("/:slug", validateParams(regionSlugParamSchema), async (c) => {
  const { slug } = c.get("validatedParams") as RegionSlugParam;

  if (!slug) {
    throw new BadRequestError("Slug is required");
  }

  const result = await RegionService.getRegion(slug);

  return c.json(result, 200);
});
