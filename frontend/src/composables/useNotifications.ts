import { ref, computed, watch } from 'vue'
import { notificationsApi, type Notification } from '@/api/notifications'
import { useAuthStore } from '@/stores/auth'

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

let isWatcherSetup = false

export function useNotifications() {
  const auth = useAuthStore()

  const fetchUnreadCount = async () => {
    if (!auth.isAuthenticated) {
      unreadCount.value = 0
      return
    }

    try {
      unreadCount.value = await notificationsApi.getUnreadCount()
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const fetchNotifications = async () => {
    if (!auth.isAuthenticated) {
      notifications.value = []
      unreadCount.value = 0
      return
    }

    loading.value = true
    error.value = null

    try {
      const items = await notificationsApi.getUserNotifications()
      notifications.value = items
      await fetchUnreadCount()
    } catch (err) {
      error.value = 'Ошибка при загрузке уведомлений'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId: number) => {
    if (!auth.isAuthenticated) return

    try {
      const updatedNotification = await notificationsApi.markAsRead(notificationId)

      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index] = updatedNotification
      }

      if (updatedNotification.is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAsReadOnNavigate = async (notificationId: number) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && notification.is_read === 0) {
      await markAsRead(notificationId)
    }
  }

  const markAllAsRead = async () => {
    if (!auth.isAuthenticated) return

    const unreadItems = notifications.value.filter(n => n.is_read === 0)
    if (!unreadItems.length) return

    try {
      const updatedItems = await Promise.all(unreadItems.map(n => notificationsApi.markAsRead(n.id)))
      const updatedMap = new Map(updatedItems.map(item => [item.id, item]))

      notifications.value = notifications.value.map(notification => {
        const updated = updatedMap.get(notification.id)
        return updated ? updated : { ...notification, is_read: 1 }
      })

      unreadCount.value = 0
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  if (!isWatcherSetup) {
    isWatcherSetup = true

    watch(
      () => auth.user?.id,
      (userId) => {
        if (auth.isAuthenticated && userId) {
          fetchNotifications()
        } else if (!userId) {
          notifications.value = []
          unreadCount.value = 0
        }
      },
      { immediate: true }
    )

    // Fallback: если пользователь ещё не загружен, но токен есть, пробуем загрузить счётчик
    if (auth.isAuthenticated && !auth.user?.id) {
      fetchUnreadCount()
    }
  }

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => n.is_read === 0)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.is_read === 1)
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  return {
    notifications,
    unreadCount,
    loading,
    error,
    unreadNotifications,
    readNotifications,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsReadOnNavigate,
    markAllAsRead,
  }
}
