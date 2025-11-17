import { create } from 'zustand'
import apiClient, { cancelAllRequests, deleteTokenCookie, getTokenFromCookie } from '@/lib/axios'
import { getCurrentUser } from '@/api/profile'
import type { User } from '@/types/user'
import { useGamificationStore } from '@/stores/gamificationStore'
import { logger } from '@/lib/logger'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  initializing: boolean
  setUser: (user: User | null) => void
  loadFromStorage: () => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

function persistUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem('auth.user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth.user')
    }
  } catch (error) {
    console.warn('Failed to persist auth user:', error)
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  initializing: false,
  setUser: (user) => {
    persistUser(user)
    set({ user, isAuthenticated: !!user })
    try {
      useGamificationStore.getState().hydrateFromUser(user)
    } catch (error) {
      console.warn('Failed to hydrate gamification store from user:', error)
    }
  },
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem('auth.user')
      if (raw) {
        const parsed = JSON.parse(raw) as User
        set({ user: parsed, isAuthenticated: true })
        try {
          useGamificationStore.getState().hydrateFromUser(parsed)
        } catch (error) {
          console.warn('Failed to hydrate gamification store from storage:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to load auth user from storage:', error)
      set({ user: null, isAuthenticated: false })
    }
  },
  initialize: async () => {
    if (get().initializing) return

    logger.debug('🔐 AuthStore initialize called')
    set({ initializing: true })

    try {
      logger.debug('🔐 Loading user from storage...')
      get().loadFromStorage()

      const token = getTokenFromCookie()
      logger.debug('🔐 Token from cookie:', !!token)

      if (!token) {
        logger.debug('🔐 No token found, skipping user fetch')
        set({ initializing: false })
        return
      }

      logger.debug('🔐 Fetching current user...')
      const user = await getCurrentUser()
      logger.debug('🔐 Setting user:', user.nickname)
      get().setUser(user)
    } catch (error) {
      logger.warn('Failed to initialize auth state:', error)
      get().setUser(null)
    } finally {
      logger.debug('🔐 AuthStore initialize completed')
      set({ initializing: false })
    }
  },
  logout: async () => {
    try {
      cancelAllRequests()
    } catch (error) {
      console.warn('Failed to cancel pending requests:', error)
    }

    try {
      await apiClient.post('/api/auth/logout', {}, {
        headers: { 'X-Require-Auth': 'true' },
      })
    } catch (error) {
      console.warn('Backend logout failed, continuing with local cleanup:', error)
    }

    try {
      deleteTokenCookie()
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    } catch (error) {
      console.warn('Failed to clear auth cookies:', error)
    }

    persistUser(null)
    set({ user: null, isAuthenticated: false })
    useGamificationStore.getState().hydrateFromUser(null)
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      void useAuthStore.getState().logout()
    }
  })
}

