import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
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
      thumbnailUrl: res.eager[0].secure_url as string,
      mediumUrl: res.eager[1].secure_url as string,
      largeUrl: res.eager[2].secure_url as string,
    };
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
};
