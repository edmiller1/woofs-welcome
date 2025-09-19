import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  Favourite,
  PlaceImageSelect,
  PlaceWithImagesSelect,
} from "../db/schema";

export const getResponsiveImageUrls = (publicIdOrUrl: string) => {
  const baseUrl = "https://res.cloudinary.com/dmkxl9apk/image/upload";
  const publicId = extractPublicId(publicIdOrUrl);

  return {
    // Default optimized image
    src: `${baseUrl}/q_auto,f_auto,w_800/${publicId}`,

    // Srcset for different device pixel ratios and sizes
    srcset: [
      `${baseUrl}/q_auto,f_auto,w_400/${publicId} 400w`,
      `${baseUrl}/q_auto,f_auto,w_600/${publicId} 600w`,
      `${baseUrl}/q_auto,f_auto,w_800/${publicId} 800w`,
      `${baseUrl}/q_auto,f_auto,w_1200/${publicId} 1200w`,
      `${baseUrl}/q_auto,f_auto,w_1600/${publicId} 1600w`,
      `${baseUrl}/q_auto,f_auto,w_2000/${publicId} 2000w`,
    ].join(", "),

    // Sizes attribute for different breakpoints
    sizes: [
      "(max-width: 640px) 400px",
      "(max-width: 768px) 600px",
      "(max-width: 1024px) 800px",
      "(max-width: 1280px) 1200px",
      "1600px",
    ].join(", "),

    // Alternative: provide individual URLs for manual selection
    responsive: {
      xs: `${baseUrl}/q_auto,f_auto,w_400/${publicId}`,
      sm: `${baseUrl}/q_auto,f_auto,w_600/${publicId}`,
      md: `${baseUrl}/q_auto,f_auto,w_800/${publicId}`,
      lg: `${baseUrl}/q_auto,f_auto,w_1200/${publicId}`,
      xl: `${baseUrl}/q_auto,f_auto,w_1600/${publicId}`,
      "2xl": `${baseUrl}/q_auto,f_auto,w_2000/${publicId}`,
    },

    // WebP variants for better compression
    webp: {
      src: `${baseUrl}/q_auto,f_webp,w_800/${publicId}`,
      srcset: [
        `${baseUrl}/q_auto,f_webp,w_400/${publicId} 400w`,
        `${baseUrl}/q_auto,f_webp,w_600/${publicId} 600w`,
        `${baseUrl}/q_auto,f_webp,w_800/${publicId} 800w`,
        `${baseUrl}/q_auto,f_webp,w_1200/${publicId} 1200w`,
        `${baseUrl}/q_auto,f_webp,w_1600/${publicId} 1600w`,
        `${baseUrl}/q_auto,f_webp,w_2000/${publicId} 2000w`,
      ].join(", "),
    },
  };
};

export const extractPublicId = (urlOrPublicId: string): string => {
  // If it's already a public ID (no http), return as-is
  if (!urlOrPublicId.startsWith("http")) {
    return urlOrPublicId;
  }

  // Extract from URL: get everything between /upload/ and the file extension
  const parts = urlOrPublicId.split("/upload/");
  if (parts.length < 2) {
    throw new Error("Invalid Cloudinary URL format");
  }

  // Get the part after /upload/
  let publicIdPart = parts[1];

  // Remove version number if present (v1753414740/)
  publicIdPart = publicIdPart.replace(/^v\d+\//, "");

  // Remove file extension (.jpg, .png, etc.)
  const publicId = publicIdPart.replace(/\.[^.]+$/, "");

  return publicId;
};

export const checkIsFavourited = async (userId: string, placeId: string) => {
  const [favourite] = await db
    .select()
    .from(Favourite)
    .where(and(eq(Favourite.userId, userId), eq(Favourite.placeId, placeId)))
    .limit(1);

  return !!favourite;
};

export const optimizePlaceImages = async (places: PlaceWithImagesSelect[]) => {
  return places.map((place) => ({
    ...place,
    images: place.images.map((image: PlaceImageSelect) => ({
      ...image,
      ...getResponsiveImageUrls(image.url),
    })),
  }));
};
