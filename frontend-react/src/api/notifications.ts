/**
 * Notifications API using Supabase REST API
 * Замена для notifications-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Notification, NotificationType } from '@/types/notification';

function transformNotification(raw: any): Notification {
  const actor = typeof raw.actor === 'object' && raw.actor !== null
    ? raw.actor
    : { id: raw.actor_id, username: '', avatar: null };

  return {
    id: String(raw.id),
    type: raw.type as NotificationType,
    actor: {
      id: String(actor.id || raw.actor_id),
      username: actor.username || '',
      avatar: actor.avatar || undefined,
    },
    article: raw.article
      ? {
          id: String(raw.article.id || raw.article_id),
          title: raw.article.title || '',
        }
      : undefined,
    comment: raw.comment
      ? {
          id: String(raw.comment.id || raw.comment_id),
          text: raw.comment.text || '',
        }
      : undefined,
    isRead: raw.is_read || false,
    readAt: raw.read_at || undefined,
    metadata: raw.metadata || undefined,
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

/**
 * Получить список уведомлений с пагинацией
 */
export async function getNotifications(skip: number = 0, take: number = 50): Promise<Notification[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey (
          id,
          username,
          avatar
        ),
        article:articles!notifications_article_id_fkey (
          id,
          title
        ),
        comment:comments!notifications_comment_id_fkey (
          id,
          text
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching notifications', error);
      throw error;
    }

    return (data || []).map(transformNotification);
  } catch (error: any) {
    logger.error('Error in getNotifications', error);
    throw error;
  }
}

/**
 * Получить количество непрочитанных уведомлений
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Error fetching unread count', error);
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    logger.error('Error in getUnreadCount', error);
    return 0;
  }
}

/**
 * Пометить уведомление как прочитанное
 */
export async function markAsRead(notificationId: string): Promise<{ id: string; isRead: boolean; readAt: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const readAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: readAt,
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }

    return {
      id: data.id,
      isRead: data.is_read,
      readAt: data.read_at || readAt,
    };
  } catch (error: any) {
    logger.error('Error in markAsRead', error);
    throw error;
  }
}

/**
 * Пометить все уведомления как прочитанные
 */
export async function markAllAsRead(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const readAt = new Date().toISOString();

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: readAt,
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  } catch (error: any) {
    logger.error('Error in markAllAsRead', error);
    throw error;
  }
}

/**
 * Удалить уведомление
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Error deleting notification', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    logger.error('Error in deleteNotification', error);
    throw error;
  }
}

