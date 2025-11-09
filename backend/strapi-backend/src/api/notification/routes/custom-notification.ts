/**
 * Notification custom routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/notifications/:id/read',
      handler: 'notification.markAsRead',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/notifications/unread-count',
      handler: 'notification.getUnreadCount',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};

