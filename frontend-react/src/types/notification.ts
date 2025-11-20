export type NotificationType = 
  | 'comment' 
  | 'comment_reply' 
  | 'follow' 
  | 'article_published' 
  | 'article_like' 
  | 'comment_like'

export type NotificationCategory = 'today' | 'this-week' | 'earlier'

export interface Notification {
  id: string
  type: NotificationType
  actor: {
    id: string
    username: string
    avatar?: string | null
  }
  article?: {
    id: string
    title: string
  } | null
  comment?: {
    id: string
    text: string
  } | null
  isRead: boolean
  readAt?: string | null
  metadata?: {
    threshold?: number
    likesCount?: number
    [key: string]: any
  } | null
  createdAt: string
  // Computed fields for UI
  message?: string
  meta?: string
  actionLabel?: string
  category?: NotificationCategory
}


