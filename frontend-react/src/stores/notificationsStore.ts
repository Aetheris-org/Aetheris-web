import { create } from 'zustand'
import type { Notification } from '@/types/notification'

type NotificationStoreState = {
  notifications: Notification[]
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  resetMockData: () => void
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    actor: 'Elena Martin',
    message: 'left a comment on “Modern React Patterns”',
    meta: '“This was incredibly helpful, thanks for the detailed write-up!”',
    createdAt: '2025-11-10T10:12:00Z',
    isUnread: true,
    type: 'comment',
    category: 'today',
  },
  {
    id: 2,
    actor: 'Product Insights',
    message: 'highlighted your article in the weekly digest',
    createdAt: '2025-11-10T09:30:00Z',
    isUnread: true,
    type: 'system',
    category: 'today',
  },
  {
    id: 3,
    actor: 'Daniel Harper',
    message: 'liked “Scaling Zustand Stores Effectively”',
    createdAt: '2025-11-09T19:22:00Z',
    type: 'reaction',
    category: 'this-week',
  },
  {
    id: 4,
    actor: 'UI Craft',
    message: 'bookmarked “Aetheris Design System Primer”',
    createdAt: '2025-11-08T15:05:00Z',
    type: 'bookmark',
    category: 'this-week',
  },
  {
    id: 5,
    actor: 'Samuel Lee',
    message: 'started following you',
    createdAt: '2025-11-05T11:47:00Z',
    type: 'follow',
    category: 'this-week',
  },
  {
    id: 6,
    actor: 'Editorial Team',
    message: 'Your article “Async Rendering in React 19” is scheduled for review',
    createdAt: '2025-10-31T08:20:00Z',
    type: 'system',
    category: 'earlier',
  },
  {
    id: 7,
    actor: 'Ksenia Novak',
    message: 'left a comment on “State Machines for Frontend”',
    meta: '“Curious how you approached edge cases—any chance for a follow-up?”',
    createdAt: '2025-10-28T17:44:00Z',
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
        notification.id === id ? { ...notification, isUnread: false } : notification
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.isUnread ? { ...notification, isUnread: false } : notification
      ),
    })),
  resetMockData: () => set({ notifications: cloneInitialNotifications() }),
}))

export const selectNotifications = (state: NotificationStoreState) => state.notifications
export const selectUnreadCount = (state: NotificationStoreState) =>
  state.notifications.reduce((total, notification) => total + (notification.isUnread ? 1 : 0), 0)

// TODO: Replace Zustand mock store with TanStack Query data once Strapi notifications API is available.


