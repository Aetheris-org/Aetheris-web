import { create } from 'zustand'
import type { Notification } from '@/types/notification'

type NotificationStoreState = {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  resetMockData: () => void
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    actor: {
      id: '1',
      username: 'Elena Martin',
    },
    message: 'left a comment on "Modern React Patterns"',
    meta: '"This was incredibly helpful, thanks for the detailed write-up!"',
    createdAt: '2025-11-10T10:12:00Z',
    isRead: false,
    type: 'comment',
    category: 'today',
  },
  {
    id: '2',
    actor: {
      id: '2',
      username: 'Product Insights',
    },
    message: 'highlighted your article in the weekly digest',
    createdAt: '2025-11-10T09:30:00Z',
    isRead: false,
    type: 'article_published',
    category: 'today',
  },
  {
    id: '3',
    actor: {
      id: '3',
      username: 'Daniel Harper',
    },
    message: 'liked "Scaling Zustand Stores Effectively"',
    createdAt: '2025-11-09T19:22:00Z',
    isRead: true,
    type: 'article_like',
    category: 'this-week',
  },
  {
    id: '4',
    actor: {
      id: '4',
      username: 'UI Craft',
    },
    message: 'bookmarked "Aetheris Design System Primer"',
    createdAt: '2025-11-08T15:05:00Z',
    isRead: true,
    type: 'article_published',
    category: 'this-week',
  },
  {
    id: '5',
    actor: {
      id: '5',
      username: 'Samuel Lee',
    },
    message: 'started following you',
    createdAt: '2025-11-05T11:47:00Z',
    isRead: true,
    type: 'follow',
    category: 'this-week',
  },
  {
    id: '6',
    actor: {
      id: '6',
      username: 'Editorial Team',
    },
    message: 'Your article "Async Rendering in React 19" is scheduled for review',
    createdAt: '2025-10-31T08:20:00Z',
    isRead: true,
    type: 'article_published',
    category: 'earlier',
  },
  {
    id: '7',
    actor: {
      id: '7',
      username: 'Ksenia Novak',
    },
    message: 'left a comment on "State Machines for Frontend"',
    meta: '"Curious how you approached edge cases—any chance for a follow-up?"',
    createdAt: '2025-10-28T17:44:00Z',
    isRead: true,
    type: 'comment',
    category: 'earlier',
  },
]

const cloneInitialNotifications = () => initialNotifications.map((notification) => ({ ...notification }))

export const useNotificationsStore = create<NotificationStoreState>((set) => ({
  notifications: cloneInitialNotifications(),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        !notification.isRead ? { ...notification, isRead: true } : notification
      ),
    })),
  resetMockData: () => set({ notifications: cloneInitialNotifications() }),
}))

export const selectNotifications = (state: NotificationStoreState) => state.notifications
export const selectUnreadCount = (state: NotificationStoreState) =>
  state.notifications.reduce((total, notification) => total + (!notification.isRead ? 1 : 0), 0)

// TODO: Replace Zustand mock store with TanStack Query data once Strapi notifications API is available.


