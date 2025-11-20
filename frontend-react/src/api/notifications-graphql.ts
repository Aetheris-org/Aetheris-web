/**
 * GraphQL API для работы с уведомлениями
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import type { Notification, NotificationType } from '@/types/notification';
import { logger } from '@/lib/logger';

interface GraphQLNotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string | null;
  metadata?: {
    threshold?: number;
    likesCount?: number;
    [key: string]: any;
  } | null;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  article?: {
    id: string;
    title: string;
  } | null;
  comment?: {
    id: string;
    text: string;
  } | null;
}

function transformNotification(raw: GraphQLNotification): Notification {
  return {
    id: String(raw.id),
    type: raw.type,
    actor: {
      id: String(raw.actor.id),
      username: raw.actor.username,
      avatar: raw.actor.avatar ?? undefined,
    },
    article: raw.article
      ? {
          id: String(raw.article.id),
          title: raw.article.title,
        }
      : undefined,
    comment: raw.comment
      ? {
          id: String(raw.comment.id),
          text: raw.comment.text,
        }
      : undefined,
    isRead: raw.isRead,
    readAt: raw.readAt ?? undefined,
    metadata: raw.metadata ?? undefined,
    createdAt: raw.createdAt,
  };
}

/**
 * Получить список уведомлений с пагинацией
 */
export async function getNotifications(skip: number = 0, take: number = 50): Promise<Notification[]> {
  logger.debug(`[getNotifications] Fetching notifications: skip=${skip}, take=${take}`);

  const queryStr = `
    query GetNotifications($skip: Int!, $take: Int!) {
      notifications(
        skip: $skip
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        type
        isRead
        readAt
        metadata
        createdAt
        actor {
          id
          username
          avatar
        }
        article {
          id
          title
        }
        comment {
          id
          text
        }
      }
    }
  `;

  try {
    const response = await query<{ notifications: GraphQLNotification[] }>(queryStr, {
      skip,
      take,
    });

    logger.debug(`[getNotifications] Fetched ${response.notifications.length} notifications`);
    return response.notifications.map(transformNotification);
  } catch (error) {
    logger.error('[getNotifications] Failed to fetch notifications:', error);
    throw error;
  }
}

/**
 * Получить количество непрочитанных уведомлений
 */
export async function getUnreadCount(): Promise<number> {
  logger.debug('[getUnreadCount] Fetching unread count');

  const queryStr = `
    query GetUnreadCount {
      notificationsCount(where: { isRead: { equals: false } })
    }
  `;

  try {
    const response = await query<{ notificationsCount: number }>(queryStr);
    logger.debug(`[getUnreadCount] Unread count: ${response.notificationsCount}`);
    return response.notificationsCount;
  } catch (error) {
    logger.error('[getUnreadCount] Failed to fetch unread count:', error);
    throw error;
  }
}

/**
 * Пометить уведомление как прочитанное
 */
export async function markAsRead(notificationId: string): Promise<{ id: string; isRead: boolean; readAt: string }> {
  logger.debug(`[markAsRead] Marking notification as read: notificationId=${notificationId}`);

  const readAt = new Date().toISOString();
  const mutation = `
    mutation MarkAsRead($id: ID!, $readAt: DateTime!) {
      updateNotification(
        where: { id: $id }
        data: { isRead: true, readAt: $readAt }
      ) {
        id
        isRead
        readAt
      }
    }
  `;

  try {
    const response = await mutate<{ updateNotification: { id: string; isRead: boolean; readAt: string } }>(
      mutation,
      { id: notificationId, readAt }
    );
    logger.info(`[markAsRead] Notification marked as read: notificationId=${notificationId}`, response.updateNotification);
    return response.updateNotification;
  } catch (error) {
    logger.error(`[markAsRead] Failed to mark notification as read:`, error);
    throw error;
  }
}

/**
 * Пометить все уведомления как прочитанные
 */
export async function markAllAsRead(): Promise<void> {
  logger.debug('[markAllAsRead] Marking all notifications as read');

  // KeystoneJS не имеет встроенной мутации для массового обновления
  // Поэтому получаем все непрочитанные уведомления и обновляем их по одному
  const queryStr = `
    query GetUnreadNotifications {
      notifications(where: { isRead: { equals: false } }) {
        id
      }
    }
  `;

  try {
    const response = await query<{ notifications: { id: string }[] }>(queryStr);
    const unreadIds = response.notifications.map((n) => n.id);

    logger.debug(`[markAllAsRead] Found ${unreadIds.length} unread notifications`);

    // Обновляем все уведомления параллельно
    const updatePromises = unreadIds.map((id) => markAsRead(id));
    await Promise.all(updatePromises);

    logger.info(`[markAllAsRead] All ${unreadIds.length} notifications marked as read`);
  } catch (error) {
    logger.error('[markAllAsRead] Failed to mark all notifications as read:', error);
    throw error;
  }
}

