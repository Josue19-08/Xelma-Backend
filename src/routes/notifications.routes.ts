import { Router, Response, NextFunction } from "express";
import notificationService from "../services/notification.service";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.middleware";
import { NotFoundError } from "../utils/errors";

const router = Router();

/**
 * GET /api/notifications
 * Get paginated notifications for the authenticated user
 * Query params: limit (default 20, max 100), offset (default 0), unreadOnly (optional boolean)
 */
router.get("/", authenticateUser, (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const unreadOnly = req.query.unreadOnly === "true";

    const result = await notificationService.getUserNotifications(
      userId,
      limit,
      offset,
      unreadOnly,
    );

    res.json({
      success: true,
      notifications: result.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
}) as any);

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user
 */
router.get(
  "/unread-count",
  authenticateUser,
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * GET /api/notifications/:id
 * Get a specific notification
 */
router.get("/:id", authenticateUser, (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await notificationService.getNotification(id, userId);

    if (!notification) {
      return next(new NotFoundError("Notification not found"));
    }

    res.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}) as any);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch(
  "/:id/read",
  authenticateUser,
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        return next(new NotFoundError("Notification not found or access denied"));
      }

      res.json({
        success: true,
        message: "Notification marked as read",
        notification: {
          id: notification.id,
          isRead: notification.isRead,
        },
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications as read for the authenticated user
 */
router.patch(
  "/read-all",
  authenticateUser,
  (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;

      const count = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `Marked ${count} notification(s) as read`,
        markedCount: count,
      });
    } catch (error) {
      next(error);
    }
  }) as any,
);

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
router.delete("/:id", authenticateUser, (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await notificationService.deleteNotification(id, userId);

    if (!deleted) {
      return next(new NotFoundError("Notification not found or access denied"));
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
}) as any);

/**
 * DELETE /api/notifications
 * Delete all read notifications for the authenticated user
 */
router.delete("/", authenticateUser, (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    const count = await notificationService.deleteAllRead(userId);

    res.json({
      success: true,
      message: `Deleted ${count} read notification(s)`,
      deletedCount: count,
    });
  } catch (error) {
    next(error);
  }
}) as any);

export default router;
