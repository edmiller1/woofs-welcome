import { db } from "../db";
import { Claim, Place, BusinessPlace, Business } from "../db/schema";
import { eq, and } from "drizzle-orm";
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  AppError,
  DatabaseError,
} from "../lib/errors";
import type { SubmitClaimInput } from "../routes/claim/schemas";
import { sendDiscordNewClaimNotification } from "../lib/discord";
import { Resend } from "resend";
import { env } from "../config/env";
import { NotificationService } from "./notification.service";
import { Cloudinary } from "../lib/cloudinary";

const resend = new Resend(env.RESEND_API_KEY);

export class ClaimService {
  /**
   * Check if a place can be claimed
   */
  static async checkClaimEligibility(placeId: string) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
        columns: {
          id: true,
          name: true,
          claimedBy: true,
          claimedAt: true,
        },
      });

      if (!place) {
        throw new NotFoundError("Place not found");
      }

      // Check if already claimed
      if (place.claimedBy) {
        return {
          canClaim: false,
          reason: "Place is already claimed",
          claimedAt: place.claimedAt,
        };
      }

      // Check for pending claims
      const pendingClaim = await db.query.Claim.findFirst({
        where: and(eq(Claim.placeId, placeId), eq(Claim.status, "pending")),
      });

      if (pendingClaim) {
        return {
          canClaim: false,
          reason: "There is already a pending claim for this place",
          pendingClaimId: pendingClaim.id,
        };
      }

      return {
        canClaim: true,
        reason: null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch claim eligibility", {
        originalError: error,
      });
    }
  }

  /**
   * Submit a new claim
   */
  static async submitClaim(userId: string, input: SubmitClaimInput) {
    try {
      // First, verify the place can be claimed
      const eligibility = await this.checkClaimEligibility(input.placeId);

      if (!eligibility.canClaim) {
        throw new ConflictError(
          eligibility.reason || "Place cannot be claimed"
        );
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.id, input.placeId),
        with: {
          images: {
            limit: 1,
          },
        },
      });

      if (!place) {
        throw new NotFoundError("Place not found");
      }

      const business = await db.query.Business.findFirst({
        where: eq(Business.id, input.businessId),
        columns: {
          id: true,
          name: true,
          email: true,
          notificationPreferences: true,
          ownerId: true,
        },
      });

      if (!business) {
        throw new NotFoundError("Business not found");
      }

      // Check if this business already has a claim for this place
      const existingClaim = await db.query.Claim.findFirst({
        where: and(
          eq(Claim.placeId, input.placeId),
          eq(Claim.businessId, input.businessId)
        ),
      });

      if (existingClaim) {
        throw new ConflictError(
          "This business has already submitted a claim for this place"
        );
      }

      // Create the claim
      const [claim] = await db
        .insert(Claim)
        .values({
          placeId: input.placeId,
          userId,
          businessId: input.businessId,
          businessEmail: input.businessEmail,
          businessPhone: input.businessPhone,
          role: input.role,
          additionalNotes: input.additionalNotes,
          status: "pending",
          verificationDocuments: [], // Will be updated when documents are uploaded
        })
        .returning();

      //Create notification and/or email
      if (business.notificationPreferences?.email?.claimStatus) {
        // Send email to user
        await resend.emails.send({
          from: "Woofs Welcome <hello@woofswelcome.app>",
          to: claim.businessEmail,
          subject: "Your place claim has been submitted",
          html: `
                <p>User: <strong>${claim.userId}</strong></p>
                <p>Place: <strong>${claim.placeId}</strong></p>
                <p>Business: <strong>${claim.businessId}</strong></p>
                <p>Role: <strong>${claim.role}</strong></p>
                <p>Additional Notes: <strong>${claim.additionalNotes}</strong></p>
                <p>Verification Documents: <strong>${claim.verificationDocuments?.join("\n") || "None"}</strong></p>
                <p>Submitted At: <strong>${claim.createdAt.toString()}</strong></p>`,
        });
      }

      if (business.notificationPreferences?.push?.claimStatus) {
        // Send push notification to user
        await NotificationService.createNotification({
          userId: business.ownerId,
          context: "business",
          businessId: business.id,
          type: "claim_submitted",
          title: "Claim submitted successfully",
          message: `Your claim for ${place.name} has been submitted and is pending review.`,
          relatedClaimId: claim.id,
          relatedPlaceId: place.id,
          data: {
            placeName: place.name,
            placeImage: place.images[0]?.url,
            claimStatus: "pending",
          },
        });
      }

      // Send Discord notification
      await sendDiscordNewClaimNotification({
        content: "@here **New Place Claim** 📄",
        embeds: [
          {
            title: "🔔 New Place Claim",
            description: `A new claim has been submitted for **${place.name}**`,
            color: 0x00ff00,
            fields: [
              {
                name: "Claim ID",
                value: claim.id,
                inline: true,
              },
              {
                name: "Place",
                value: place.name,
                inline: true,
              },
              {
                name: "Business",
                value: business.name,
                inline: true,
              },
              {
                name: "Business Email",
                value: claim.businessEmail,
                inline: true,
              },
              {
                name: "Business Phone",
                value: claim.businessPhone,
                inline: true,
              },
              {
                name: "Role",
                value: claim.role,
                inline: true,
              },
              {
                name: "Additional Notes",
                value: claim.additionalNotes || "None",
                inline: false,
              },
              {
                name: "Submitted At",
                value: new Date(claim.createdAt).toLocaleString(),
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            thumbnail: {
              url: place.images[0]?.url,
            },
            footer: {
              text: "Woofs Welcome - Admin Dashboard",
            },
          },
        ],
      });

      return {
        success: true,
        claim,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to submit claim", {
        originalError: error,
      });
    }
  }

  /**
   * Update claim with verification documents
   */
  static async addVerificationDocuments(
    claimId: string,
    userId: string,
    files: Array<{ data: string; fileName: string }>
  ) {
    try {
      const claim = await db.query.Claim.findFirst({
        where: eq(Claim.id, claimId),
      });

      if (!claim) {
        throw new NotFoundError("Claim not found");
      }

      if (claim.userId !== userId) {
        throw new UnauthorizedError(
          "You are not authorized to update this claim"
        );
      }

      if (claim.status !== "pending") {
        throw new ConflictError("Can only add documents to pending claims");
      }

      // Upload files to Cloudinary
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const result = await Cloudinary.uploadVerificationDocument(
          file.data,
          claim.businessId,
          claimId,
          file.fileName
        );

        if (result) {
          uploadedUrls.push(result.url);
        }
      }

      // Update claim with document URLs
      const [updatedClaim] = await db
        .update(Claim)
        .set({
          verificationDocuments: uploadedUrls,
          updatedAt: new Date(),
        })
        .where(eq(Claim.id, claimId))
        .returning();

      return {
        success: true,
        claim: updatedClaim,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to add verification documents", {
        originalError: error,
      });
    }
  }

  /**
   * Get claim by ID with place and business details
   */
  static async getClaimById(claimId: string, userId: string) {
    try {
      const claim = await db.query.Claim.findFirst({
        where: eq(Claim.id, claimId),
        with: {
          place: {
            columns: {
              id: true,
              name: true,
              slug: true,
              address: true,
            },
          },
          business: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!claim) {
        throw new NotFoundError("Claim not found");
      }

      // Only the claim owner or admin can view
      if (claim.userId !== userId) {
        throw new UnauthorizedError(
          "You are not authorized to view this claim"
        );
      }

      return claim;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch claim", {
        originalError: error,
      });
    }
  }

  /**
   * Get all claims for a business
   */
  static async getBusinessClaims(businessId: string, userId: string) {
    // Verify user owns the business
    const business = await db.query.Business.findFirst({
      where: eq(Business.id, businessId),
    });

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    if (business.ownerId !== userId) {
      throw new UnauthorizedError(
        "You are not authorized to view claims for this business"
      );
    }

    const claims = await db.query.Claim.findMany({
      where: eq(Claim.businessId, businessId),
      with: {
        place: {
          columns: {
            id: true,
            name: true,
            slug: true,
            address: true,
          },
        },
      },
      orderBy: (claims, { desc }) => [desc(claims.createdAt)],
    });

    return claims;
  }

  /**
   * Admin: Approve a claim
   */
  async approveClaim(claimId: string, adminUserId: string) {
    const claim = await db.query.Claim.findFirst({
      where: eq(Claim.id, claimId),
    });

    if (!claim) {
      throw new NotFoundError("Claim not found");
    }

    if (claim.status !== "pending") {
      throw new ConflictError("Only pending claims can be approved");
    }

    // Start a transaction
    await db.transaction(async (tx) => {
      // Update claim status
      await tx
        .update(Claim)
        .set({
          status: "approved",
          approvedAt: new Date(),
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
        })
        .where(eq(Claim.id, claimId));

      // Create BusinessPlace relationship
      await tx.insert(BusinessPlace).values({
        businessId: claim.businessId,
        placeId: claim.placeId,
        claimId: claim.id,
        canEdit: true,
        canRespond: true,
      });

      // Update Place with claimedBy
      await tx
        .update(Place)
        .set({
          claimedBy: claim.businessId,
          claimedAt: new Date(),
        })
        .where(eq(Place.id, claim.placeId));
    });

    return { success: true };
  }

  /**
   * Admin: Reject a claim
   */
  async rejectClaim(
    claimId: string,
    adminUserId: string,
    rejectionReason: string
  ) {
    const claim = await db.query.Claim.findFirst({
      where: eq(Claim.id, claimId),
    });

    if (!claim) {
      throw new NotFoundError("Claim not found");
    }

    if (claim.status !== "pending") {
      throw new ConflictError("Only pending claims can be rejected");
    }

    await db
      .update(Claim)
      .set({
        status: "rejected",
        rejectionReason,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      })
      .where(eq(Claim.id, claimId));

    return { success: true };
  }

  /**
   * Admin: Get all pending claims
   */
  async getPendingClaims() {
    const claims = await db.query.Claim.findMany({
      where: eq(Claim.status, "pending"),
      with: {
        place: {
          columns: {
            id: true,
            name: true,
            slug: true,
            address: true,
          },
        },
        business: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (claims, { asc }) => [asc(claims.createdAt)],
    });

    return claims;
  }
}
