import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { BadRequestError, UnauthorizedError } from "../../lib/errors";
import { NotificationService } from "../../services/notification.service";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  BusinessPartialNotificationPreferencesInput,
  businessPartialNotificationPreferencesSchema,
  NotificationParamInput,
  notificationParamSchema,
  UserPartialNotificationPreferencesInput,
  userPartialNotificationPreferencesSchema,
} from "./schemas";

export const notificationRouter = new Hono();

/**
 * GET /notifications
 * Get all notifications for the authenticated user in the specified context
 */
notificationRouter.get("/", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const context = c.get("userContext");

  if (!["personal", "business"].includes(context)) {
    throw new BadRequestError("Invalid context");
  }

  const result = await NotificationService.getUserNotifications(
    auth.id,
    context
  );

  return c.json(result, 200);
});

/**
 * GET /notification/unread
 * Get unread notifications
 */
notificationRouter.get("/unread", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const context = c.get("userContext");

  if (!["personal", "business"].includes(context)) {
    throw new BadRequestError("Invalid context");
  }

  const result = await NotificationService.getUnreadNotifications(
    auth.id,
    context
  );

  return c.json(result, 200);
});

/**
 * GET /notification/unread-count
 * Get unread notification count
 */
notificationRouter.get("/unread-count", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const context = c.get("userContext");

  if (!["personal", "business"].includes(context)) {
    throw new BadRequestError("Invalid context");
  }

  const result = await NotificationService.getUnreadCount(auth.id, context);

  return c.json(result, 200);
});

/**
 * POST /notification/:notificationId/read
 * Mark notification as read
 */
notificationRouter.post(
  "/:notificationId/read",
  authMiddleware,
  validateParams(notificationParamSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const { notificationId } = c.get(
      "validatedParams"
    ) as NotificationParamInput;

    const result = await NotificationService.markAsRead(
      notificationId,
      auth.id
    );

    return c.json(result, 200);
  }
);

/**
 * POST /notification/read-all
 * Mark all notifications as read
 */
notificationRouter.post(
  "/read-all",
  authMiddleware,
  validateParams(notificationParamSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const context = c.get("userContext");

    if (!["personal", "business"].includes(context)) {
      throw new BadRequestError("Invalid context");
    }

    const { notificationId } = c.get(
      "validatedParams"
    ) as NotificationParamInput;

    const result = await NotificationService.markAllAsRead(auth.id, context);

    return c.json(result, 200);
  }
);

/**
 * DELETE /notification/:notificationId
 * Delete notification
 */
notificationRouter.delete(
  "/:notificationId",
  authMiddleware,
  validateParams(notificationParamSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const { notificationId } = c.get(
      "validatedParams"
    ) as NotificationParamInput;

    const result = await NotificationService.deleteNotification(
      notificationId,
      auth.id
    );

    return c.json(result, 200);
  }
);

/**
 * Get current user's notification preferences
 */
notificationRouter.get("/user/preferences", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const result = await NotificationService.getPreferences(auth.id);

  return c.json(result);
});

/**
 * Update current user's notification preferences
 */
notificationRouter.patch(
  "/user/preferences",
  validateBody(userPartialNotificationPreferencesSchema),
  authMiddleware,
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const updates = c.get(
      "validatedBody"
    ) as UserPartialNotificationPreferencesInput;

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
notificationRouter.delete("/user/preferences", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const result = await NotificationService.resetPreferences(auth.id);

  return c.json(result);
});

/**
 * Get business account preferences
 */
notificationRouter.get(
  "/business/preferences/:businessId",
  authMiddleware,
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const businessId = c.req.param("businessId");

    const result = await NotificationService.getBusinessPreferences(businessId);

    return c.json(result);
  }
);

/**
 * Update business account preferences
 */
notificationRouter.patch(
  "/business/preferences/:businessId",
  validateBody(businessPartialNotificationPreferencesSchema),
  authMiddleware,
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const businessId = c.req.param("businessId");
    const updates = c.get(
      "validatedBody"
    ) as BusinessPartialNotificationPreferencesInput;

    const result = await NotificationService.updateBusinessPreferences(
      businessId,
      updates
    );

    return c.json(result);
  }
);

/**
 * Reset business account preferences to defaults
 */
notificationRouter.delete(
  "/business/preferences/:businessId",
  authMiddleware,
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError();

    const businessId = c.req.param("businessId");

    const result =
      await NotificationService.resetBusinessPreferences(businessId);

    return c.json(result);
  }
);
