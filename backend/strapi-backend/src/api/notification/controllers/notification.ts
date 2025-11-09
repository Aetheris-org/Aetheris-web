/**
 * Notification controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notification.notification', ({ strapi }) => ({
  /**
   * Get user's notifications
   * GET /api/notifications
   */
  async find(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view notifications');
    }

    const { skip = 0, limit = 100 } = ctx.query;

    try {
      const notifications = await strapi.entityService.findMany('api::notification.notification', {
        filters: {
          user: userId
        },
        populate: {
          related_article: {
            fields: ['id', 'title']
          },
          related_comment: {
            fields: ['id', 'text']
          }
        },
        start: parseInt(skip as string) || 0,
        limit: Math.min(parseInt(limit as string) || 100, 100),
        sort: { createdAt: 'desc' }
      });

      return ctx.send({ data: notifications });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return ctx.internalServerError('Failed to fetch notifications');
    }
  },

  /**
   * Mark notification as read
   * POST /api/notifications/:id/read
   */
  async markAsRead(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      // Verify ownership
      const notification: any = await strapi.entityService.findOne('api::notification.notification', id, {
        populate: ['user'] as any
      });

      if (!notification) {
        return ctx.notFound('Notification not found');
      }

      if (notification.user?.id !== userId) {
        return ctx.forbidden('You can only mark your own notifications as read');
      }

      // Mark as read
      const updated = await strapi.entityService.update('api::notification.notification', id, {
        data: {
          is_read: true
        },
        populate: {
          related_article: {
            fields: ['id', 'title']
          },
          related_comment: {
            fields: ['id', 'text']
          }
        }
      });

      return ctx.send({ data: updated });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return ctx.internalServerError('Failed to mark notification as read');
    }
  },

  /**
   * Get unread notifications count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.send({ data: { unread_count: 0 } });
    }

    try {
      const count = await strapi.db.query('api::notification.notification').count({
        where: {
          user: userId,
          is_read: false
        }
      });

      return ctx.send({ data: { unread_count: count } });
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return ctx.send({ data: { unread_count: 0 } });
    }
  }
}));

