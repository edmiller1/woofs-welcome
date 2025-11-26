/*
 * Notification Service
 *
 * Handles all notification-related business logic
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { NotificationPreferences, user } from "../db/schema";
import { getUserNotificationPreferences } from "../lib/helpers";
import { PartialNotificationPreferencesInput } from "../routes/notification/schemas";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../lib/constants/notifications";
import { AppError, DatabaseError } from "../lib/errors";

export class NotificationService {
  /**
   * Get users notification preferences with defaults merged
   */
  static async getPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord) {
        throw new Error("User not found");
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
    updates: PartialNotificationPreferencesInput
  ): Promise<NotificationPreferences> {
    try {
      // First, get current preferences
      const currentPrefs = await this.getPreferences(userId);

      // Merge updates with current preferences
      const updatedPrefs: NotificationPreferences = {
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
  ): Promise<{ success: boolean; message: string } & NotificationPreferences> {
    try {
      const defaultPreferences = DEFAULT_NOTIFICATION_PREFERENCES;

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
}
