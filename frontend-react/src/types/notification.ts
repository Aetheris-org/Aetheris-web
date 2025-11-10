export type NotificationType = 'comment' | 'reaction' | 'follow' | 'system' | 'bookmark'

export type NotificationCategory = 'today' | 'this-week' | 'earlier'

export interface Notification {
  id: number
  actor: string
  actorAvatar?: string
  message: string
  meta?: string
  actionLabel?: string
  createdAt: string
  isUnread?: boolean
  type: NotificationType
  category: NotificationCategory
}

// TODO: Replace static notification type declarations with generated types from Strapi once the notifications collection is defined.


