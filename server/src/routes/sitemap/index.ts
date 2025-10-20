import { Hono } from "hono";
import { db } from "../../db";
import { Place, Region, City, Island } from "../../db/schema";

export const sitemapRouter = new Hono();

sitemapRouter.get("/", async (c) => {
  try {
    const [places, regions, cities, islands] = await Promise.all([
      db
        .select({
          slug: Place.slug,
          updatedAt: Place.updatedAt,
        })
        .from(Place),

      db
        .select({
          slug: Region.slug,
        })
        .from(Region),

      db
        .select({
          slug: City.slug,
        })
        .from(City),

      db
        .select({
          slug: Island.slug,
        })
        .from(Island),
    ]);

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://www.woofswelcome.app";

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/business</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  ${islands
    .map(
      (island) => `
  <url>
    <loc>${baseUrl}/island/${island.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("")}

  ${regions
    .map(
      (region) => `
  <url>
    <loc>${baseUrl}/region/${region.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}

  ${cities
    .map(
      (city) => `
  <url>
    <loc>${baseUrl}/city/${city.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}

  ${places
    .map(
      (place) => `
  <url>
    <loc>${baseUrl}/place/${place.slug}</loc>
    <lastmod>${new Date(place.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    return c.text(sitemap, 200, {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600",
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return c.text("Error generating sitemap", 500);
  }
});
