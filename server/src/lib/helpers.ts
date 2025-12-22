import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  City,
  Favourite,
  Island,
  NotificationPreferences,
  Place,
  PlaceImage,
  PlaceImageSelect,
  PlaceWithImagesSelect,
  Region,
  ReviewImage,
  ReviewImageSelect,
  UserReviewSelect,
  UserSelect,
} from "../db/schema";
import { Cloudinary } from "./cloudinary";

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

export const optimizeImagesForPlace = async (images: PlaceImageSelect[]) => {
  return images.map((image: PlaceImageSelect) => ({
    ...image,
    ...getResponsiveImageUrls(image.url),
  }));
};

// Multiple images multiple places
export const optimizePlaceImages = async (places: PlaceWithImagesSelect[]) => {
  return places.map((place) => ({
    ...place,
    images: place.images.map((image: PlaceImageSelect) => ({
      ...image,
      ...getResponsiveImageUrls(image.url),
    })),
  }));
};

export const optimizeReviewImages = async (reviews: UserReviewSelect[]) => {
  return reviews.map((review) => ({
    ...review,
    images: review.images.map((image: ReviewImageSelect) => ({
      ...image,
      ...getResponsiveImageUrls(image.publicId),
    })),
  }));
};

export const processReviewImagesInBackground = async (
  images: string[],
  placeSlug: string,
  reviewId: string
) => {
  const startTime = Date.now();
  console.log(`[BACKGROUND] Starting image processing for review ${reviewId}`);

  try {
    const imageUploadPromises = images.map((image, index) => {
      return Cloudinary.uploadReviewImage(image, placeSlug).then((result) => {
        if (result) {
          console.log(`[BACKGROUND] Image ${index + 1} uploaded successfully`);
        }
        return result;
      });
    });

    const uploadedImages = (await Promise.all(imageUploadPromises)).filter(
      Boolean
    ) as { publicId: string; url: string }[];

    if (uploadedImages.length > 0) {
      const insertImages = uploadedImages.map((img) => ({
        publicId: img.publicId,
        url: img.url,
        reviewId: reviewId,
        altText: "Review image",
      }));

      await db.insert(ReviewImage).values(insertImages);
      console.log(
        `[BACKGROUND] ${uploadedImages.length} images saved to database`
      );
    }

    console.log(
      `[BACKGROUND] Complete processing took: ${Date.now() - startTime}ms`
    );

    // Optionally: Send a websocket message or push notification when complete
    // notifyImageProcessingComplete(reviewId);
  } catch (error) {
    console.error(
      `[BACKGROUND] Error processing images for review ${reviewId}:`,
      error
    );
  }
};

export const getBoundingBox = (
  lat: number,
  lng: number,
  radiusInKm: number
) => {
  const latDelta = radiusInKm / 111;
  const lngDelta = radiusInKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    reviewReplies: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,
    placeUpdates: true,
    claimStatus: true,
    reportStatus: true,
    weeklyDigest: true,
    marketing: false,
    newsletter: false,
  },
  push: {
    reviewReplies: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,
    nearbyPlaces: false,
    favourites: true,
    claimStatus: true,
  },
};

export function getUserNotificationPreferences(
  user: UserSelect
): NotificationPreferences {
  return {
    email: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.email,
      ...(user.notificationPreferences?.email || {}),
    },
    push: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.push,
      ...(user.notificationPreferences?.push || {}),
    },
  };
}

export const validatePlaceFilter = (
  filter?: string
): "popular" | "new" | "verified" | "surprise" => {
  const validFilters = ["popular", "new", "verified", "surprise"] as const;
  if (filter && validFilters.includes(filter as any)) {
    return filter as "popular" | "new" | "verified" | "surprise";
  }
  return "popular"; // default
};

export const validateEventFilter = (filter?: string): "new" | "upcoming" => {
  const validFilters = ["new", "upcoming"] as const;
  if (filter && validFilters.includes(filter as any)) {
    return filter as "new" | "upcoming";
  }
  return "new"; // default
};
