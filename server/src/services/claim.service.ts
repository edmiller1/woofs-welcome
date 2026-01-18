import { db } from "../db";
import {
  Claim,
  Place,
  BusinessPlace,
  Business,
  PlaceImage,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  AppError,
  DatabaseError,
  BadRequestError,
} from "../lib/errors";
import type {
  ClaimStatus,
  SubmitClaimInput,
  UpdatePendingClaimInput,
} from "../routes/claim/schemas";
import { sendDiscordNewClaimNotification } from "../lib/discord";
import { Resend } from "resend";
import { env } from "../config/env";
import { NotificationService } from "./notification.service";
import { Cloudinary } from "../lib/cloudinary";
import { EmailService } from "./email.service";
import { getResponsiveImageUrls } from "../lib/helpers";

const resend = new Resend(env.RESEND_API_KEY);

export class ClaimService {
  /**
   * Check if a place can be claimed
   */
  static async checkClaimEligibility(placeSlug: string) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, placeSlug),
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
        where: and(eq(Claim.placeId, place.id), eq(Claim.status, "pending")),
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
   * Submit a new claim with verification documents (transactional)
   */
  static async submitClaim(
    userId: string,
    input: SubmitClaimInput,
    files?: Array<{ data: string; fileName: string }>
  ) {
    try {
      // Validate files are provided
      if (!files || files.length === 0) {
        throw new BadRequestError(
          "At least one verification document is required"
        );
      }

      // First, verify the place can be claimed
      const eligibility = await this.checkClaimEligibility(input.placeSlug);

      if (!eligibility.canClaim) {
        throw new ConflictError(
          eligibility.reason || "Place cannot be claimed"
        );
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, input.placeSlug),
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
          eq(Claim.placeId, place.id),
          eq(Claim.businessId, input.businessId)
        ),
      });

      if (existingClaim) {
        throw new ConflictError(
          "This business has already submitted a claim for this place"
        );
      }

      // Generate claim ID upfront so we can use it for file uploads
      const { randomUUID } = await import("crypto");
      const claimId = randomUUID();

      // Upload verification documents with proper claim ID
      let uploadedUrls: string[] = [];
      const uploadErrors: string[] = [];

      for (const file of files) {
        try {
          const result = await Cloudinary.uploadVerificationDocument(
            file.data,
            input.businessId,
            claimId, // Use the actual claim ID
            file.fileName
          );

          if (result) {
            uploadedUrls.push(result.url);
          } else {
            uploadErrors.push(file.fileName);
          }
        } catch (error) {
          console.error(`Failed to upload file ${file.fileName}:`, error);
          uploadErrors.push(file.fileName);
        }
      }

      // Ensure at least one file was successfully uploaded
      if (uploadedUrls.length === 0) {
        throw new AppError(
          "Failed to upload verification documents. Please try again.",
          500
        );
      }

      // Log if some files failed
      if (uploadErrors.length > 0) {
        console.warn(`Some files failed to upload: ${uploadErrors.join(", ")}`);
      }

      // Create the claim with documents - use explicit ID
      const [claim] = await db
        .insert(Claim)
        .values({
          id: claimId, // Use the pre-generated ID
          placeId: place.id,
          userId,
          businessId: input.businessId,
          businessEmail: input.businessEmail,
          businessPhone: input.businessPhone,
          role: input.role,
          additionalNotes: input.additionalNotes,
          status: "pending",
          verificationDocuments: uploadedUrls,
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
          with: {
            images: {
              limit: 1,
              orderBy: (images, { desc }) => [desc(images.isPrimary)],
              columns: {
                url: true,
                altText: true,
              },
            },
          },
        },
      },
      orderBy: (claims, { desc }) => [desc(claims.createdAt)],
    });

    // Optimize images with responsive URLs
    const claimsWithOptimizedImages = claims.map((claim) => ({
      ...claim,
      place: {
        ...claim.place,
        images: claim.place.images.map((image) => ({
          ...image,
          ...getResponsiveImageUrls(image.url),
        })),
      },
    }));

    return claimsWithOptimizedImages;
  }

  /**
   * Update a pending claim (role, notes, documents)
   */
  static async updatePendingClaim(
    claimId: string,
    userId: string,
    input: UpdatePendingClaimInput
  ) {
    try {
      // 1. Fetch and validate claim
      const claim = await db.query.Claim.findFirst({
        where: eq(Claim.id, claimId),
        with: {
          business: {
            columns: {
              id: true,
              ownerId: true,
            },
          },
        },
      });

      if (!claim) {
        throw new NotFoundError("Claim not found");
      }

      // 2. Authorization check - user must own the business
      if (claim.business.ownerId !== userId) {
        throw new UnauthorizedError(
          "You are not authorized to update this claim"
        );
      }

      // 3. Status check - only pending claims can be updated
      if (claim.status !== "pending") {
        throw new ConflictError("Only pending claims can be updated");
      }

      // 4. Handle document operations
      let updatedDocuments = claim.verificationDocuments || [];

      // Remove documents if specified
      if (input.documentsToRemove && input.documentsToRemove.length > 0) {
        updatedDocuments = updatedDocuments.filter(
          (doc) => !input.documentsToRemove?.includes(doc)
        );

        // Delete from Cloudinary
        for (const docUrl of input.documentsToRemove) {
          try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            const urlParts = docUrl.split("/");
            const uploadIndex = urlParts.indexOf("upload");
            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
              // Get everything after /upload/v{version}/
              const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
              // Remove file extension
              const publicId = publicIdWithExt.substring(
                0,
                publicIdWithExt.lastIndexOf(".")
              );
              await Cloudinary.deleteImage(publicId);
            }
          } catch (error) {
            console.error(`Failed to delete document ${docUrl}:`, error);
            // Continue even if deletion fails
          }
        }
      }

      // Add new documents if specified
      if (input.documentsToAdd && input.documentsToAdd.length > 0) {
        const uploadedUrls: string[] = [];
        const uploadErrors: string[] = [];

        for (const file of input.documentsToAdd) {
          try {
            const result = await Cloudinary.uploadVerificationDocument(
              file.data,
              claim.businessId,
              claimId,
              file.fileName
            );

            if (result) {
              uploadedUrls.push(result.url);
            } else {
              uploadErrors.push(file.fileName);
            }
          } catch (error) {
            console.error(`Failed to upload file ${file.fileName}:`, error);
            uploadErrors.push(file.fileName);
          }
        }

        // Add successfully uploaded documents
        updatedDocuments = [...updatedDocuments, ...uploadedUrls];

        // Log if some files failed
        if (uploadErrors.length > 0) {
          console.warn(
            `Some files failed to upload: ${uploadErrors.join(", ")}`
          );
        }
      }

      // 5. Ensure at least one document remains
      if (updatedDocuments.length === 0) {
        throw new BadRequestError(
          "At least one verification document is required"
        );
      }

      // 6. Build update object
      const updateData: Partial<typeof Claim.$inferInsert> = {
        updatedAt: new Date(),
        verificationDocuments: updatedDocuments,
      };

      if (input.role !== undefined) {
        updateData.role = input.role;
      }

      if (input.additionalNotes !== undefined) {
        updateData.additionalNotes = input.additionalNotes;
      }

      // 7. Update the claim
      const [updatedClaim] = await db
        .update(Claim)
        .set(updateData)
        .where(eq(Claim.id, claimId))
        .returning();

      return {
        success: true,
        claim: updatedClaim,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to update claim", {
        originalError: error,
      });
    }
  }

  /**
   * Admin: Get all pending claims
   */
  static async getPendingClaims() {
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

  /**
   * Admin: Get all claims (with optional status filter)
   */

  static async getAllClaims(status?: ClaimStatus) {
    try {
      const claims = await db.query.Claim.findMany({
        where: status ? eq(Claim.status, status) : undefined,
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
        orderBy: (claims, { desc }) => [desc(claims.createdAt)],
      });

      return claims;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch claims", {
        originalError: error,
      });
    }
  }

  /**
   * Admin: Approve a claim
   */
  static async approveClaim(claimId: string, adminUserId: string) {
    try {
      const claim = await db.query.Claim.findFirst({
        where: eq(Claim.id, claimId),
        with: {
          place: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          business: {
            columns: {
              id: true,
              name: true,
              ownerId: true,
              notificationPreferences: true,
            },
          },
        },
      });

      if (!claim) {
        throw new NotFoundError("Claim not found");
      }

      if (claim.status !== "pending") {
        throw new ConflictError("Only pending claims can be approved");
      }

      // Start a transaction
      await db.transaction(async (tx) => {
        // 1. Update claim status
        await tx
          .update(Claim)
          .set({
            status: "approved",
            approvedAt: new Date(),
            reviewedBy: adminUserId,
            reviewedAt: new Date(),
          })
          .where(eq(Claim.id, claimId));

        // 2. Create BusinessPlace relationship
        await tx.insert(BusinessPlace).values({
          businessId: claim.businessId,
          placeId: claim.placeId,
          claimId: claim.id,
          canEdit: true,
          canRespond: true,
        });

        // 3. Update Place with claimedBy
        await tx
          .update(Place)
          .set({
            claimedBy: claim.businessId,
            claimedAt: new Date(),
          })
          .where(eq(Place.id, claim.placeId));
      });

      // ========================================
      // NOTIFICATIONS
      // ========================================

      // Send in app notification
      if (claim.business.notificationPreferences?.push.claimStatus) {
        await NotificationService.createNotification({
          userId: claim.business.ownerId,
          context: "business",
          businessId: claim.businessId,
          type: "claim_approved",
          title: "Claim approved! 🎉",
          message: `Your claim for ${claim.place.name} has been approved. You can now manage this place.`,
          relatedClaimId: claim.id,
          relatedPlaceId: claim.placeId,
          data: {
            placeName: claim.place.name,
            placeSlug: claim.place.slug,
          },
        });
      }

      // Send email notification
      if (claim.business.notificationPreferences?.email.claimStatus) {
        await EmailService.sendEmailIfEnabled(
          claim.business.ownerId,
          "business",
          claim.businessId,
          "claimStatus",
          {
            to: claim.businessEmail,
            subject: "Your place claim has been approved! 🎉",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Claim Approved! 🎉</h2>
              <p>Great news!</p>
              <p>Your claim for <strong>${claim.place.name}</strong> has been approved.</p>
              
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin-top: 0; color: #15803d;">What's Next?</h3>
                <ul style="margin: 10px 0;">
                  <li>Update your place information</li>
                  <li>Upload new photos</li>
                  <li>Respond to reviews</li>
                  <li>View analytics for your place</li>
                </ul>
              </div>

              <p><a href="${env.CLIENT_BASE_URL || "https://woofswelcome.app"}/business/dashboard" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Go to Business Dashboard</a></p>
              
              <p>If you have any questions, feel free to reply to this email.</p>
              
              <p>Best regards,<br>The Woofs Welcome Team</p>
            </div>
          `,
          }
        );
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to approve claim", {
        originalError: error,
      });
    }
  }

  /**
   * Admin: Reject a claim
   */
  static async rejectClaim(
    claimId: string,
    adminUserId: string,
    rejectionReason: string
  ) {
    try {
      const claim = await db.query.Claim.findFirst({
        where: eq(Claim.id, claimId),
        with: {
          place: {
            columns: {
              id: true,
              name: true,
            },
          },
          business: {
            columns: {
              id: true,
              ownerId: true,
              notificationPreferences: true,
            },
          },
        },
      });

      if (!claim) {
        throw new NotFoundError("Claim not found");
      }

      if (claim.status !== "pending") {
        throw new ConflictError("Only pending claims can be rejected");
      }

      // Update claim status
      await db
        .update(Claim)
        .set({
          status: "rejected",
          rejectionReason,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
        })
        .where(eq(Claim.id, claimId));

      // ========================================
      // NOTIFICATIONS
      // ========================================

      // Create in-app notification
      if (claim.business.notificationPreferences?.push.claimStatus) {
        await NotificationService.createNotification({
          userId: claim.business.ownerId,
          context: "business",
          businessId: claim.businessId,
          type: "claim_rejected",
          title: "Claim update",
          message: `Your claim for ${claim.place.name} requires additional information.`,
          relatedClaimId: claim.id,
          relatedPlaceId: claim.placeId,
          data: {
            placeName: claim.place.name,
            rejectionReason,
          },
        });
      }

      // Send email notification
      if (claim.business.notificationPreferences?.email.claimStatus) {
        await EmailService.sendEmailIfEnabled(
          claim.business.ownerId,
          "business",
          claim.businessId,
          "claimStatus",
          {
            to: claim.businessEmail,
            subject: "Update on your place claim",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Update on Your Claim</h2>
              <p>Hi there,</p>
              <p>Thank you for submitting a claim for <strong>${claim.place.name}</strong>.</p>
              
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">Additional Information Needed</h3>
                <p style="margin: 10px 0;">${rejectionReason}</p>
              </div>

              <p>Please review the feedback above and feel free to submit a new claim with the requested information.</p>
              
              <p>If you have any questions or believe this was made in error, please reply to this email and we'll be happy to help.</p>
              
              <p>Best regards,<br>The Woofs Welcome Team</p>
            </div>
          `,
          }
        );

        return { success: true };
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to reject claim", {
        originalError: error,
      });
    }
  }
}
