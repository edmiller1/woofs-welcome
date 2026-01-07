import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

cloudinary.config({
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
});

export const Cloudinary = {
  upload: async (image: string, folder: string) => {
    const res = await cloudinary.uploader.upload(image, {
      folder: folder,
      eager: [
        { width: 200, crop: "fill" }, // thumbnail
        { width: 600, crop: "fill" }, // medium
        { width: 1200, crop: "fill" }, // large
      ],
    });

    return {
      id: res.public_id,
      url: res.secure_url,
    };
  },
  uploadBusinessLogo: async (
    image: string,
    businessName: string,
    businessId: string
  ) => {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: `ww-business-assets/${businessName}-${businessId}`,
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.error(
        `❌ Failed to upload image logo for business: ${businessName}:`,
        error
      );
      return null;
    }
  },
  uploadGoogleImage: async (
    googleImage: string,
    placeSlug: string,
    index: number
  ) => {
    try {
      const result = await cloudinary.uploader.upload(googleImage, {
        folder: `ww-places-assets/${placeSlug}`,
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        displayOrder: index,
      };
    } catch (error) {
      console.error(
        `❌ Failed to upload image ${index} for place ${placeSlug}:`,
        error
      );
      return null;
    }
  },
  uploadReviewImage: async (image: string, placeSlug: string) => {
    const uploadStart = Date.now();
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: `ww-review-assets/${placeSlug}`,
      });

      console.log(
        `[CLOUDINARY] Upload completed in: ${Date.now() - uploadStart}ms`
      );

      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.error(
        `❌ Failed to upload review image for place ${placeSlug}:`,
        error
      );
      return null;
    }
  },
  uploadVerificationDocument: async (
    file: string, // base64 string
    businessId: string,
    claimId: string,
    fileName: string
  ) => {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: `claim-verification-docs/${businessId}/${claimId}`,
        resource_type: "auto", // Automatically detect file type (image, pdf, etc.)
        public_id: fileName, // Use original filename
        tags: ["claim-verification", businessId, claimId],
      });

      console.log(`✅ Uploaded verification document: ${fileName}`);

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error(`❌ Failed to upload verification document:`, error);
      return null;
    }
  },
  deleteImage: async (publicId: string) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "ok") {
        console.log(`✅ Deleted image: ${publicId}`);
        return { success: true };
      } else {
        console.warn(`⚠️ Failed to delete image: ${publicId}`, result);
        return { success: false, result };
      }
    } catch (error) {
      console.error(`❌ Failed to delete avatar:`, error);
    }
  },
};
