// src/lib/utils/notifications.ts (or wherever you keep utility functions)

import { NotificationPreferences, UserSelect } from "../../db/schema";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../constants/notifications";

/**
 * Safely get user notification preferences, merging with defaults
 * This ensures new preference keys work for existing users
 */
export function getUserNotificationPreferences(
  user: UserSelect
): NotificationPreferences {
  const userPrefs = user.notificationPreferences;

  // If user has no preferences, return defaults
  if (!userPrefs) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  // Merge with defaults to handle new keys
  return {
    email: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.email,
      ...(userPrefs.email || {}),
    },
    push: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.push,
      ...(userPrefs.push || {}),
    },
  };
}

/**
 * Check if a user should receive a specific notification
 * @param user - The user to check
 * @param channel - 'email' or 'push'
 * @param notificationType - The specific notification key
 * @returns boolean indicating if notification should be sent
 */
export function shouldSendNotification(
  user: UserSelect,
  channel: "email" | "push",
  notificationType: string
): boolean {
  const prefs = getUserNotificationPreferences(user);

  // Type-safe access
  const channelPrefs = prefs[channel];
  if (!channelPrefs) return false;

  return channelPrefs[notificationType as keyof typeof channelPrefs] ?? false;
}

/**
 * Validate notification preferences object
 * Useful for API validation
 */
export function validateNotificationPreferences(
  prefs: unknown
): prefs is NotificationPreferences {
  if (!prefs || typeof prefs !== "object") return false;

  const p = prefs as Record<string, unknown>;

  // Check structure
  if (!p.email || typeof p.email !== "object") return false;
  if (!p.push || typeof p.push !== "object") return false;

  // All values should be booleans
  const email = p.email as Record<string, unknown>;
  const push = p.push as Record<string, unknown>;

  const allEmailBooleans = Object.values(email).every(
    (v) => typeof v === "boolean"
  );
  const allPushBooleans = Object.values(push).every(
    (v) => typeof v === "boolean"
  );

  return allEmailBooleans && allPushBooleans;
}
