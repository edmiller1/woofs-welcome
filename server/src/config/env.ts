import { z } from "zod";

const envSchema = z.object({
  //Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  //Server
  PORT: z.string().default("9000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  //Client
  CLIENT_BASE_URL: z.string().url("CLIENT_BASE_URL must be a valid URL"),

  //Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z
    .string()
    .url("GOOGLE_REDIRECT_URI must be a valid URL"),

  // Google Places API
  GOOGLE_PLACES_API_KEY: z.string().min(1, "GOOGLE_PLACES_API_KEY is required"),

  // Cloudinary
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),

  // Resend (Email)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // Sentry
  SENTRY_DSN: z.string().min(1, "SENTRY_DSN is required"),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      console.error("");

      error.errors.forEach((err) => {
        console.log(`- ${err.path.join(".")}: ${err.message}`);
      });

      console.error("");
      console.error(
        "💡 Check your .env file and make sure all required variables are set."
      );
      console.error("");

      process.exit(1);
    }
    throw error;
  }
}

// Export validated and typed environment variables
export const env = validateEnv();

// Export types for use in other files
export type Env = z.infer<typeof envSchema>;
