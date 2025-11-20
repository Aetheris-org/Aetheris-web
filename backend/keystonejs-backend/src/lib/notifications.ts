/**
 * Утилиты для создания уведомлений
 */
import logger from './logger';

export type NotificationType = 
  | 'comment' 
  | 'comment_reply' 
  | 'follow' 
  | 'article_published' 
  | 'article_like' 
  | 'comment_like';

export interface CreateNotificationData {
  type: NotificationType;
  userId: string | number;
  actorId: string | number;
  articleId?: string | number;
  commentId?: string | number;
  metadata?: Record<string, any>;
}

/**
 * Проверяет, существует ли уже уведомление с такими же параметрами
 * @param context KeystoneJS context
 * @param data Данные для проверки
 * @param timeWindowMs Временное окно для проверки дубликатов (по умолчанию 1 час)
 * @returns true, если дубликат найден
 */
async function hasDuplicateNotification(
  context: any,
  data: CreateNotificationData,
  timeWindowMs: number = 60 * 60 * 1000 // 1 час по умолчанию
): Promise<boolean> {
  try {
    const userId = String(data.userId);
    const actorId = String(data.actorId);
    const cutoffTime = new Date(Date.now() - timeWindowMs);

    // Строим фильтр в зависимости от типа уведомления
    const where: any = {
      user: { id: { equals: userId } },
      actor: { id: { equals: actorId } },
      type: { equals: data.type },
      createdAt: { gte: cutoffTime.toISOString() }, // Проверяем только за последний час
    };

    // Для лайков проверяем также порог в metadata
    if (data.type === 'article_like' || data.type === 'comment_like') {
      if (data.articleId) {
        where.article = { id: { equals: String(data.articleId) } };
      }
      if (data.commentId) {
        where.comment = { id: { equals: String(data.commentId) } };
      }
      // Для лайков проверяем также threshold в metadata
      if (data.metadata?.threshold) {
        // Ищем уведомления с таким же порогом
        const existingNotifications = await context.sudo().query.Notification.findMany({
          where: {
            user: { id: { equals: userId } },
            actor: { id: { equals: actorId } },
            type: { equals: data.type },
            createdAt: { gte: cutoffTime.toISOString() },
            ...(data.articleId ? { article: { id: { equals: String(data.articleId) } } } : {}),
            ...(data.commentId ? { comment: { id: { equals: String(data.commentId) } } } : {}),
          },
          query: 'id metadata',
        });

        // Проверяем, есть ли уведомление с таким же порогом
        return existingNotifications.some(
          (notif: any) => notif.metadata?.threshold === data.metadata?.threshold
        );
      }
      // Если нет threshold в metadata, продолжаем обычную проверку
    } else if (data.type === 'comment' || data.type === 'comment_reply') {
      // Для комментариев проверяем articleId и commentId
      if (data.articleId) {
        where.article = { id: { equals: String(data.articleId) } };
      }
      if (data.commentId) {
        where.comment = { id: { equals: String(data.commentId) } };
      }
    } else if (data.type === 'follow') {
      // Для подписок проверяем только actor и user (без article/comment)
      // Ничего дополнительного не добавляем
    }

    const existing = await context.sudo().query.Notification.findMany({
      where,
      query: 'id',
      take: 1,
    });

    return existing.length > 0;
  } catch (error: any) {
    logger.error(`[hasDuplicateNotification] Error checking for duplicates:`, {
      error: error.message,
      data,
    });
    // В случае ошибки возвращаем false, чтобы не блокировать создание уведомления
    return false;
  }
}

/**
 * Создает уведомление для пользователя с проверкой на дубликаты
 * @param context KeystoneJS context
 * @param data Данные для создания уведомления
 * @param skipDuplicateCheck Пропустить проверку дубликатов (для случаев, когда проверка уже выполнена)
 */
export async function createNotification(
  context: any,
  data: CreateNotificationData,
  skipDuplicateCheck: boolean = false
): Promise<void> {
  try {
    // Нормализуем ID в строки для KeystoneJS
    const userId = String(data.userId);
    const actorId = String(data.actorId);

    // Не создаем уведомление, если пользователь уведомляет сам себя
    if (userId === actorId) {
      logger.debug(`[createNotification] Skipping self-notification: userId=${userId}, type=${data.type}`);
      return;
    }

    // Проверяем на дубликаты (если не пропущена проверка)
    if (!skipDuplicateCheck) {
      const hasDuplicate = await hasDuplicateNotification(context, data);
      if (hasDuplicate) {
        logger.debug(`[createNotification] Duplicate notification found, skipping:`, {
          type: data.type,
          userId,
          actorId,
          articleId: data.articleId,
          commentId: data.commentId,
        });
        return;
      }
    }

    const notificationData: any = {
      user: { connect: { id: userId } },
      actor: { connect: { id: actorId } },
      type: data.type,
      isRead: false,
    };

    if (data.articleId) {
      notificationData.article = { connect: { id: String(data.articleId) } };
    }

    if (data.commentId) {
      notificationData.comment = { connect: { id: String(data.commentId) } };
    }

    if (data.metadata) {
      notificationData.metadata = data.metadata;
    }

    logger.debug(`[createNotification] Creating notification:`, {
      type: data.type,
      userId,
      actorId,
      articleId: data.articleId,
      commentId: data.commentId,
    });

    await context.sudo().query.Notification.createOne({
      data: notificationData,
    });

    logger.info(`[createNotification] Notification created successfully: type=${data.type}, userId=${userId}, actorId=${actorId}`);
  } catch (error: any) {
    logger.error(`[createNotification] Failed to create notification:`, {
      error: error.message,
      stack: error.stack,
      data,
    });
    // Не выбрасываем ошибку, чтобы не прерывать основной процесс
  }
}

/**
 * Проверяет, нужно ли создать уведомление о лайке на основе порогов
 * @param currentCount Текущее количество лайков
 * @param previousCount Предыдущее количество лайков
 * @param thresholds Массив порогов для уведомлений
 * @returns Порог, который был достигнут, или null
 */
export function shouldNotifyAboutLike(
  currentCount: number,
  previousCount: number,
  thresholds: number[]
): number | null {
  // Если это первый лайк (previousCount === 0 и currentCount === 1)
  if (previousCount === 0 && currentCount === 1) {
    return 1;
  }

  // Проверяем, пересек ли счетчик один из порогов
  for (const threshold of thresholds) {
    if (previousCount < threshold && currentCount >= threshold) {
      return threshold;
    }
  }

  return null;
}

