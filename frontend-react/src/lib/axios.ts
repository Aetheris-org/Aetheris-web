import axios from 'axios'
import { logger } from './logger'

// В development используем прокси Vite (/api -> http://localhost:1337)
// Это позволяет cookie работать, так как все запросы идут через один домен (localhost:5173)
// В production используем прямой URL из env
const baseURL = import.meta.env.DEV 
  ? '/api' // Используем прокси Vite в development
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337')

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: any) => void
}> = []

let csrfToken: string | null = null
let csrfTokenExpiry: number = 0
const CSRF_TOKEN_TTL = 60 * 60 * 1000 // 1 час

async function fetchCsrfToken(): Promise<string | null> {
  // Проверяем, не истек ли токен
  if (csrfToken && Date.now() < csrfTokenExpiry) {
    return csrfToken
  }

  try {
    // baseURL уже содержит /api (прокси), поэтому не добавляем /api снова
    const response = await axios.get(`${baseURL}/auth/csrf`, {
      withCredentials: true,
    })
    if (response.data?.csrfToken) {
      csrfToken = response.data.csrfToken
      csrfTokenExpiry = Date.now() + CSRF_TOKEN_TTL
      if (import.meta.env.DEV) {
        logger.debug('✅ CSRF token fetched')
      }
      return csrfToken
    }
    return null
  } catch (error: any) {
    // Игнорируем 429 ошибки (Too Many Requests) - просто используем старый токен
    if (error?.response?.status === 429) {
      if (import.meta.env.DEV) {
        logger.warn('⚠️ CSRF token rate limited, using cached token')
      }
      return csrfToken // Возвращаем старый токен, если есть
    }
    if (import.meta.env.DEV) {
      logger.error('❌ Failed to fetch CSRF token:', error)
    }
    return null
  }
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';')
  logger.debug('🍪 All cookies:', document.cookie)

  // Prefer accessToken over jwtToken since it's our internal token format
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    logger.debug('🍪 Checking cookie:', name, value ? 'present' : 'empty')
    if (name === 'accessToken') {
      const token = decodeURIComponent(value)
      logger.debug(`🎫 Found ${name} cookie:`, token.substring(0, 20) + '...')
      return token
    }
  }

  // Fallback to jwtToken if no accessToken
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'jwtToken') {
      const token = decodeURIComponent(value)
      logger.debug(`🎫 Found ${name} cookie:`, token.substring(0, 20) + '...')
      return token
    }
  }

  logger.debug('❌ No jwtToken or accessToken cookie found')
  return null
}

export function deleteTokenCookie() {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
  document.cookie = 'jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
}

async function refreshAccessToken(): Promise<string | null> {
  // Users & Permissions плагин Strapi не поддерживает refresh-токены из коробки.
  // Если понадобится собственная реализация — добавить здесь.
  logger.warn('🔄 Refresh token flow is not implemented for Strapi users-permissions')
    return null
}

const pendingRequests = new Set<AbortController>()

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  config.headers = config.headers || {}
  
  // Токен теперь в httpOnly cookie - JavaScript не может его прочитать
  // Но он автоматически отправится с запросом через withCredentials: true
  // Пытаемся прочитать токен из cookie (может не получиться для httpOnly)
  // Если токен доступен - добавляем в Authorization header для обратной совместимости
  // Если нет - полагаемся на автоматическую отправку cookie
  const token = getTokenFromCookie() // Может вернуть null для httpOnly cookies
  
  const isProtectedMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')
  // baseURL уже содержит /api, поэтому проверяем пути без /api
  const requiresAuth = config.url?.includes('/me') ||
                       config.url?.includes('/users/me') ||
                       config.url?.includes('/react') ||
                       config.url?.includes('/user-reaction') ||
                       config.headers['X-Require-Auth'] ||
                       config.headers['x-require-auth']
  
  // Если токен доступен (не httpOnly) - добавляем в Authorization header
  // Если нет - полагаемся на автоматическую отправку httpOnly cookie
  if (token && (isProtectedMethod || requiresAuth)) {
    config.headers.Authorization = `Bearer ${token}`
    logger.debug('🔐 Adding Authorization header for:', config.url, 'token length:', token.length)
    delete config.headers['X-Require-Auth'] // Удаляем служебный заголовок
  } else if (requiresAuth) {
    // Для httpOnly cookies токен автоматически отправится через cookie
    // Бэкенд прочитает его из cookie в jwt-auth middleware
    logger.debug('🔐 Using httpOnly cookie for auth:', config.url)
    delete config.headers['X-Require-Auth'] // Удаляем служебный заголовок
  }
  
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (unsafeMethods.includes(config.method?.toUpperCase() || '')) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }
  
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.add(controller)
  
  const cleanup = () => pendingRequests.delete(controller)
  controller.signal.addEventListener('abort', cleanup, { once: true })
  
  return config
})

apiClient.interceptors.response.use(
  (resp) => {
    if (resp.config.signal) {
      pendingRequests.forEach(controller => {
        if (controller.signal === resp.config.signal) {
          pendingRequests.delete(controller)
        }
      })
    }
    return resp
  },
  async (err) => {
    const originalRequest = err.config
    
    if (err.config?.signal) {
      pendingRequests.forEach(controller => {
        if (controller.signal === err.config.signal) {
          pendingRequests.delete(controller)
        }
      })
    }
    
    const status = err.response?.status
    
    if (status === 403 && err.response?.data?.message?.includes('CSRF')) {
      if (import.meta.env.DEV) {
        logger.warn('⚠️  CSRF token expired, fetching new one')
      }
      // Сбрасываем кэш токена при ошибке CSRF
      csrfToken = null
      csrfTokenExpiry = 0
      await fetchCsrfToken()
      
      if (csrfToken && originalRequest.headers) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken
        return apiClient(originalRequest)
      }
    }
    
    // Только пытаемся обновить токен если:
    // 1. Это 401 ошибка
    // 2. Запрос еще не повторялся
    // 3. Изначально был токен (не публичный запрос)
    const hadAuthHeader = originalRequest.headers?.Authorization
    
    if (
      status === 401 &&
      !originalRequest._retry &&
      hadAuthHeader && // Только если изначально был токен
      err.name !== 'AbortError' &&
      err.name !== 'CanceledError'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const newToken = await refreshAccessToken()
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
          return apiClient(originalRequest)
        } else {
          processQueue(new Error('Failed to refresh token'), null)
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          return Promise.reject(err)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(err)
  }
)

export function cancelAllRequests() {
  pendingRequests.forEach(controller => {
    try {
      controller.abort('User logged out')
    } catch (e) {
      // Ignore
    }
  })
  pendingRequests.clear()
}

export { getTokenFromCookie }
export default apiClient

