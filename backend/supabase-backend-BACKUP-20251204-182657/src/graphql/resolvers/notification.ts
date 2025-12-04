/**
 * Notification Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth } from '../../utils/auth';

export const Query = {
  notifications: async (_, { skip = 0, take = 20, unreadOnly = false }, context) => {
    requireAuth(context);

    const where: any = {
      userId: context.user!.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    return await context.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        article: true,
        comment: true,
      },
    });
  },
  notificationCount: async (_, { unreadOnly = false }, context) => {
    requireAuth(context);

    const where: any = {
      userId: context.user!.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    return await context.prisma.notification.count({ where });
  },
};

export const Mutation = {
  markNotificationAsRead: async (_, { id }, context) => {
    requireAuth(context);

    const notification = await context.prisma.notification.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    if (notification.userId !== context.user!.id) {
      throw new Error('You can only mark your own notifications as read');
    }

    return await context.prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        article: true,
        comment: true,
      },
    });
  },
  markAllNotificationsAsRead: async (_, __, context) => {
    requireAuth(context);

    await context.prisma.notification.updateMany({
      where: {
        userId: context.user!.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return true;
  },
  deleteNotification: async (_, { id }, context) => {
    requireAuth(context);

    const notification = await context.prisma.notification.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    if (notification.userId !== context.user!.id) {
      throw new Error('You can only delete your own notifications');
    }

    await context.prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    return true;
  },
};

export const Notification = {
  // Все поля уже загружены через include в queries
};

