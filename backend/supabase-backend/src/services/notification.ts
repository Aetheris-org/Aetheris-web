/**
 * Notification Service
 * Бизнес-логика для работы с уведомлениями
 */
import { GraphQLContext } from '../graphql/context';
import logger from '../lib/logger';

interface CreateNotificationInput {
  type: string;
  userId: string;
  actorId: string;
  articleId?: number;
  commentId?: number;
  metadata?: any;
}

/**
 * Создание уведомления с проверкой на дубликаты
 */
export async function createNotification(
  context: GraphQLContext,
  input: CreateNotificationInput,
  checkDuplicates = true
) {
  try {
    // Проверка на дубликаты (для некоторых типов уведомлений)
    if (checkDuplicates) {
      const where: any = {
        userId: input.userId,
        type: input.type,
        actorId: input.actorId,
        isRead: false,
      };

      if (input.articleId) where.articleId = input.articleId;
      if (input.commentId) where.commentId = input.commentId;

      // Для некоторых типов проверяем уведомления за последний час
      if (input.type === 'article_like' || input.type === 'comment_like') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        where.createdAt = { gte: oneHourAgo };
      }

      const existing = await context.prisma.notification.findFirst({
        where,
      });

      if (existing) {
        logger.debug('Notification already exists, skipping', {
          type: input.type,
          userId: input.userId,
        });
        return existing;
      }
    }

    const notification = await context.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        actorId: input.actorId,
        articleId: input.articleId || null,
        commentId: input.commentId || null,
        metadata: input.metadata || null,
      },
    });

    logger.debug('Notification created', {
      id: notification.id,
      type: input.type,
      userId: input.userId,
    });

    return notification;
  } catch (error: any) {
    logger.error('Failed to create notification', {
      error: error.message,
      input,
    });
    throw error;
  }
}

