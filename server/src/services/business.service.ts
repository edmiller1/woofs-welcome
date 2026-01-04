/**
 * Business Service
 *
 * Handles all auth-related business logic
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { Business, BusinessSelect, NewBusiness } from "../db/schema";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/errors";
import { CreateBusinessBody } from "../routes/business/schemas";
import { randomUUID } from "crypto";
import { Cloudinary } from "../lib/cloudinary";

export class BusinessService {
  /**
   * Get business by ID
   */
  static async getBusiness(businessId: string, userId: string) {
    try {
      const business = await db.query.Business.findFirst({
        where: eq(Business.id, businessId),
      });

      if (!business) {
        throw new NotFoundError("Business not found");
      }

      if (business.ownerId !== userId) {
        throw new UnauthorizedError("You do not have access to this business");
      }

      return business;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch business", {
        originalError: error,
      });
    }
  }

  static async createBusiness(userId: string, data: CreateBusinessBody) {
    try {
      const businessId: string = randomUUID();
      let logoData: {
        publicId: string;
        url: string;
      } | null = { publicId: "", url: "" };

      if (data.logo) {
        logoData = await Cloudinary.uploadBusinessLogo(
          data.logo,
          data.name,
          businessId
        );
      }

      const businessData = {
        id: businessId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        description: data.description,
        ownerId: userId,
        logoUrl: logoData?.url || null,
        logoPublicId: logoData?.publicId || null,
        verified: false,
        verifiedAt: null,
        subscriptionTier: "free",
        subscriptionExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const business = await db
        .insert(Business)
        .values(businessData)
        .returning();

      return business[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to create business", {
        originalError: error,
      });
    }
  }

  static async getBusinessByOwnerId(ownerId: string) {
    try {
      const business = await db.query.Business.findFirst({
        where: eq(Business.ownerId, ownerId),
      });

      if (!business) {
        return {
          exists: false,
        };
      }

      return {
        exists: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch business", {
        originalError: error,
      });
    }
  }
}
