import { defineStore } from 'pinia'
import { cancelAllRequests, getTokenFromCookie, deleteTokenCookie } from '@/api/axios'

export interface AuthUser {
  id: number
  username?: string | null
  email?: string | null
}

interface AuthState {
  user: AuthUser | null
}

/**
 * Auth Store - Cookie-based authentication
 * SECURITY CHANGES:
 * - JWT теперь хранится ТОЛЬКО в cookie (не в localStorage)
 * - Refresh token в HttpOnly cookie (недоступен для JS)
 * - State содержит только user данные, token читается из cookie
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
  }),
  getters: {
    /**
     * Проверяем наличие access token в cookie
     * SECURITY: Token теперь в cookie, не в state
     */
    isAuthenticated: () => {
      return Boolean(getTokenFromCookie())
    },
  },
  actions: {
    /**
     * DEPRECATED: Больше не используется с cookie-based auth
     * Оставлено для обратной совместимости
     */
    loadFromStorage() {
      // Пытаемся восстановить user из localStorage
      // Token теперь в cookie и читается автоматически
      try {
        const userRaw = localStorage.getItem('auth.user')
        this.user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null
      } catch (error) {
        console.warn('Failed to load user from localStorage:', error)
        this.user = null
      }
    },

    /**
     * Восстанавливаем user данные при инициализации приложения
     */
    tryRestoreFromStorage() {
      this.loadFromStorage()
    },

    /**
     * DEPRECATED: Token теперь устанавливается сервером в cookie
     * Метод оставлен для обратной совместимости, но не используется
     */
    setToken(_token: string | null) {
      // No-op: Token устанавливается сервером в cookie
      console.warn('setToken is deprecated with cookie-based auth')
    },

    /**
     * Устанавливаем user данные
     * Сохраняем в localStorage для восстановления после перезагрузки
     */
    setUser(user: AuthUser | null) {
      this.user = user
      if (user) {
        try {
          localStorage.setItem('auth.user', JSON.stringify(user))
        } catch (error) {
          console.warn('Failed to save user to localStorage:', error)
        }
      } else {
        try {
          localStorage.removeItem('auth.user')
        } catch (error) {
          console.warn('Failed to remove user from localStorage:', error)
        }
      }
    },

    /**
     * Выход из системы
     * SECURITY: Вызываем backend logout + очищаем cookies + state + localStorage
     */
    async logout() {
      // 1. Отменяем все активные HTTP запросы
      try {
        cancelAllRequests()
      } catch (error) {
        console.warn('Failed to cancel pending requests:', error)
      }
      
      // 2. Вызываем backend logout endpoint (очистит refresh token в Redis + cookies)
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include', // ВАЖНО: отправляем cookies
        })
        console.log('✅ Backend logout successful')
      } catch (error) {
        console.warn('Failed to call backend logout (will clean up locally):', error)
      }
      
      // 3. Удаляем access token cookie (fallback если backend не сработал)
      try {
        deleteTokenCookie()
      } catch (error) {
        console.warn('Failed to delete token cookie:', error)
      }
      
      // 4. Удаляем refresh token cookie (fallback)
      try {
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
      } catch (error) {
        console.warn('Failed to delete refresh token cookie:', error)
      }
      
      // 5. Очищаем legacy ключи авторизации из localStorage (на переходный период)
      try {
        localStorage.removeItem('jwt')
        localStorage.removeItem('auth.token')
        localStorage.removeItem('auth.user')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
      
      // 6. Очищаем sessionStorage если используется
      try {
        sessionStorage.removeItem('jwt')
        sessionStorage.removeItem('auth.token')
        sessionStorage.removeItem('auth.user')
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error)
      }
      
      // 7. Сбрасываем состояние
      this.user = null
      
      // 8. Уведомляем другие вкладки о logout через storage event
      try {
        localStorage.setItem('auth:logout', Date.now().toString())
        localStorage.removeItem('auth:logout')
      } catch (error) {
        console.warn('Failed to broadcast logout:', error)
      }
    },
  },
})

// Слушаем события 401 от axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    const store = useAuthStore()
    if (store.isAuthenticated) {
      console.warn('Unauthorized request detected, logging out')
      store.logout()
      // Перенаправляем на /auth если не там
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }
  })
  
  // Слушаем storage events для синхронизации logout между вкладками
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth:logout') {
      const store = useAuthStore()
      if (store.isAuthenticated) {
        console.log('Logout detected in another tab, logging out')
        store.logout()
        // Перенаправляем на /auth
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth'
        }
      }
    }
  })
}
