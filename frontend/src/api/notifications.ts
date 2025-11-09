import axios from './axios'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  type StrapiResponse,
  type StrapiEntity
} from '@/adapters/strapi'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  is_read: number
  related_article_id?: number
  related_comment_id?: number
  created_at: string
}

export interface UnreadCountResponse {
  unread_count: number
}

/**
 * Transform Strapi notification to frontend format
 */
function transformNotification(strapiNotification: any): Notification {
  return {
    id: strapiNotification.id,
    user_id: strapiNotification.user?.data?.id || strapiNotification.user?.id,
    type: strapiNotification.type,
    title: strapiNotification.title,
    message: strapiNotification.message,
    is_read: strapiNotification.is_read ? 1 : 0,
    related_article_id: strapiNotification.related_article?.data?.id || strapiNotification.related_article?.id,
    related_comment_id: strapiNotification.related_comment?.data?.id || strapiNotification.related_comment?.id,
    created_at: strapiNotification.createdAt || strapiNotification.created_at
  };
}

export const notificationsApi = {
  // Get user's notifications (auth inferred from cookie/token)
  getUserNotifications: async (skip: number = 0, limit: number = 100): Promise<Notification[]> => {
    const response = await axios.get<StrapiResponse<StrapiEntity<any>[]>>('/api/notifications', {
      params: { skip, limit }
    });
    return unwrapStrapiCollectionResponse(response.data).map(transformNotification);
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await axios.post<StrapiResponse<StrapiEntity<any>>>(`/api/notifications/${notificationId}/read`);
    return transformNotification(unwrapStrapiResponse(response.data));
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<StrapiResponse<UnreadCountResponse>>('/api/notifications/unread-count');
    return response.data.data.unread_count;
  },
};
