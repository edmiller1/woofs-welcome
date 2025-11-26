import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { UnauthorizedError } from "../../lib/errors";
import { NotificationService } from "../../services/notification.service";
import { validateBody } from "../../middleware/validate";
import {
  PartialNotificationPreferencesInput,
  partialNotificationPreferencesSchema,
} from "./schemas";

export const notificationRouter = new Hono();

/**
 * Get current user's notification preferences
 */
notificationRouter.get("/", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const result = await NotificationService.getPreferences(auth.id);

  return c.json(result);
});

/**
 * Update current user's notification preferences
 */
notificationRouter.patch(
  "/",
  validateBody(partialNotificationPreferencesSchema),
  authMiddleware,
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const updates = c.get(
      "validatedBody"
    ) as PartialNotificationPreferencesInput;

    const result = await NotificationService.updatePreferences(
      auth.id,
      updates
    );

    return c.json(result);
  }
);

/**
 * Reset current user's notification preferences to defaults
 */
notificationRouter.delete("/", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const result = await NotificationService.resetPreferences(auth.id);

  return c.json(result);
});
