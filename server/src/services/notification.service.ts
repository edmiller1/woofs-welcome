/*
 * Notification Service
 *
 * Handles all notification-related business logic
 */

import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  Business,
  BusinessNotificationPreferences,
  Notification,
  user,
  UserNotificationPreferences,
} from "../db/schema";
import {
  getBusinessNotificationPreferences,
  getUserNotificationPreferences,
} from "../lib/helpers";
import {
  BusinessPartialNotificationPreferencesInput,
  CreateNotificationParams,
  NotificationContext,
  UserPartialNotificationPreferencesInput,
} from "../routes/notification/schemas";
import {
  DEFAULT_USER_NOTIFICATION_PREFERENCES,
  DEFAULT_BUSINESS_NOTIFICATION_PREFERENCES,
} from "../lib/constants/notifications";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";

export class NotificationService {
  /**
   * Get users notification preferences with defaults merged
   */
  static async getPreferences(
    userId: string
  ): Promise<UserNotificationPreferences> {
    try {
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      return getUserNotificationPreferences(userRecord);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch notification preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Update user's notification preferences (partial update)
   */
  static async updatePreferences(
    userId: string,
    updates: UserPartialNotificationPreferencesInput
  ): Promise<UserNotificationPreferences> {
    try {
      // First, get current preferences
      const currentPrefs = await this.getPreferences(userId);

      // Merge updates with current preferences
      const updatedPrefs: UserNotificationPreferences = {
        email: {
          ...currentPrefs.email,
          ...(updates.email || {}),
        },
        push: {
          ...currentPrefs.push,
          ...(updates.push || {}),
        },
      };

      // Update in database
      await db
        .update(user)
        .set({
          notificationPreferences: updatedPrefs,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return updatedPrefs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to update notification preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Reset preferences to defaults
   */
  static async resetPreferences(
    userId: string
  ): Promise<
    { success: boolean; message: string } & UserNotificationPreferences
  > {
    try {
      const defaultPreferences = DEFAULT_USER_NOTIFICATION_PREFERENCES;

      await db
        .update(user)
        .set({
          notificationPreferences: defaultPreferences,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return {
        ...defaultPreferences,
        success: true,
        message: "Notification preferences reset to defaults",
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to reset notification preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Get business account pereferences
   */
  static async getBusinessPreferences(businessId: string) {
    try {
      const business = await db.query.Business.findFirst({
        where: eq(Business.id, businessId),
      });

      if (!business) {
        throw new NotFoundError("Business not found");
      }

      return getBusinessNotificationPreferences(business);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch business preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Update business notification preferences (partial update)
   */
  static async updateBusinessPreferences(
    businessId: string,
    updates: BusinessPartialNotificationPreferencesInput
  ) {
    try {
      const currentPrefs = await this.getBusinessPreferences(businessId);

      const updatedPrefs: BusinessNotificationPreferences = {
        email: {
          ...currentPrefs.email,
          ...(updates.email || {}),
        },
        push: {
          ...currentPrefs.push,
          ...(updates.push || {}),
        },
      };

      // Update in database
      await db
        .update(Business)
        .set({
          notificationPreferences:
            updatedPrefs as BusinessNotificationPreferences,
          updatedAt: new Date(),
        })
        .where(eq(Business.id, businessId));

      return updatedPrefs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to update business preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Reset business notification preferences to defaults
   */
  static async resetBusinessPreferences(businessId: string) {
    try {
      const defaultPreferences = DEFAULT_BUSINESS_NOTIFICATION_PREFERENCES;

      await db
        .update(Business)
        .set({
          notificationPreferences:
            defaultPreferences as BusinessNotificationPreferences,
          updatedAt: new Date(),
        })
        .where(eq(Business.id, businessId));

      return {
        ...defaultPreferences,
        success: true,
        message: "Notification preferences reset to defaults",
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to reset business preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Create in-app notification with context awareness
   */
  static async createNotification(params: CreateNotificationParams) {
    // Validate: business context requires businessId
    if (params.context === "business" && !params.businessId) {
      throw new Error(
        "businessId is required for business context notifications"
      );
    }

    // Send notification
    const [notification] = await db
      .insert(Notification)
      .values({
        userId: params.userId,
        context: params.context,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedClaimId: params.relatedClaimId,
        relatedPlaceId: params.relatedPlaceId,
        relatedReviewId: params.relatedReviewId,
        data: params.data,
      })
      .returning();

    return notification;
  }

  /**
   * Get notifications for a user filtered by context
   */
  static async getUserNotifications(
    userId: string,
    context: NotificationContext,
    limit = 50
  ) {
    const notifications = await db.query.Notification.findMany({
      where: and(
        eq(Notification.userId, userId),
        eq(Notification.context, context)
      ),
      orderBy: [desc(Notification.createdAt)],
      limit,
      with: {
        relatedPlace: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        relatedClaim: {
          columns: {
            id: true,
            status: true,
          },
        },
      },
    });

    return notifications;
  }

  /**
   * Get unread notifications filtered by context
   */
  static async getUnreadNotifications(
    userId: string,
    context: NotificationContext
  ) {
    const notifications = await db.query.Notification.findMany({
      where: and(
        eq(Notification.userId, userId),
        eq(Notification.context, context),
        eq(Notification.isRead, false)
      ),
      orderBy: [desc(Notification.createdAt)],
      with: {
        relatedPlace: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        relatedClaim: {
          columns: {
            id: true,
            status: true,
          },
        },
      },
    });

    return notifications;
  }

  /**
   * Get unread count filtered by context
   */
  static async getUnreadCount(
    userId: string,
    context: NotificationContext
  ): Promise<number> {
    const notifications = await db.query.Notification.findMany({
      where: and(
        eq(Notification.userId, userId),
        eq(Notification.context, context),
        eq(Notification.isRead, false)
      ),
      columns: {
        id: true,
      },
    });

    return notifications.length;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await db.query.Notification.findFirst({
      where: eq(Notification.id, notificationId),
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    const [updated] = await db
      .update(Notification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(Notification.id, notificationId))
      .returning();

    return updated;
  }

  /**
   * Mark all notifications as read for a user in a specific context
   */
  static async markAllAsRead(userId: string, context: NotificationContext) {
    await db
      .update(Notification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(Notification.userId, userId),
          eq(Notification.context, context),
          eq(Notification.isRead, false)
        )
      );

    return { success: true };
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await db.query.Notification.findFirst({
      where: eq(Notification.id, notificationId),
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    await db.delete(Notification).where(eq(Notification.id, notificationId));

    return { success: true };
  }
}
