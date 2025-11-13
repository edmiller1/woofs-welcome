import { Hono } from "hono";
import { validateQuery } from "../../middleware/validate";
import { SearchLocationsQuery, searchLocationsSchema } from "./schemas";
import { LocationService } from "../../services/location.service";

export const locationRouter = new Hono();

locationRouter.get(
  "/search",
  validateQuery(searchLocationsSchema),
  async (c) => {
    const { query } = c.get("validatedQuery") as SearchLocationsQuery;

    const result = await LocationService.searchLocations(query);

    return c.json(result, 200);
  }
);
