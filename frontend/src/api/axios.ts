import axios from 'axios'

// Базовый URL Strapi
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'

// Флаг чтобы избежать повторного refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: any) => void
}> = []

// CSRF token (обновляется автоматически)
let csrfToken: string | null = null

/**
 * Получить CSRF token с сервера
 * SECURITY: Защита от CSRF атак на мутации
 */
async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await axios.get(`${baseURL}/api/auth/csrf`, {
      withCredentials: true,
    })
    if (response.data?.csrfToken) {
      csrfToken = response.data.csrfToken
      console.log('✅ CSRF token fetched')
      return csrfToken
    }
    return null
  } catch (error) {
    console.error('❌ Failed to fetch CSRF token:', error)
    return null
  }
}

// Обработка очереди запросов после refresh
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

/**
 * Получить access token из cookie
 * SECURITY: Теперь токен хранится в cookie, а не localStorage
 */
function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'accessToken') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Удалить access token cookie (logout)
 */
function deleteTokenCookie() {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
}

/**
 * Refresh access token используя refresh token cookie
 * SECURITY: refreshToken в HttpOnly cookie, недоступен для JS
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    console.log('🔄 Refreshing access token...')
    
    const response = await axios.post(
      `${baseURL}/api/auth/refresh`,
      {},
      {
        withCredentials: true, // ВАЖНО: отправляем HttpOnly cookies
      }
    )
    
    if (response.data?.jwt) {
      console.log('✅ Access token refreshed successfully')
      return response.data.jwt
    }
    
    return null
  } catch (error) {
    console.error('❌ Failed to refresh token:', error)
    return null
  }
}

// Список активных AbortControllers для отмены при logout
const pendingRequests = new Set<AbortController>()

const apiClient = axios.create({
  baseURL,
  // НЕ устанавливаем Content-Type по умолчанию
  // Axios сам установит правильный заголовок:
  // - application/json для объектов
  // - multipart/form-data с boundary для FormData
  withCredentials: true, // ВАЖНО: для работы с cookies
})

// Подставляем JWT + CSRF token в каждый запрос
apiClient.interceptors.request.use(async (config) => {
  // Инициализируем headers если их нет
  config.headers = config.headers || {}
  
  // Добавляем JWT из cookie
  const token = getTokenFromCookie()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Устанавливаем Content-Type для JSON запросов (но не для FormData)
  // FormData должен иметь multipart/form-data с boundary (axios установит автоматически)
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  // Добавляем CSRF token для небезопасных методов (POST, PUT, DELETE, PATCH)
  const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (unsafeMethods.includes(config.method?.toUpperCase() || '')) {
    // Если нет CSRF токена, получаем его
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }
  
  // Создаём AbortController для этого запроса
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.add(controller)
  
  // Удаляем из списка после завершения
  const cleanup = () => pendingRequests.delete(controller)
  controller.signal.addEventListener('abort', cleanup, { once: true })
  
  return config
})

// Auto-refresh при 401 + обработка очереди
apiClient.interceptors.response.use(
  (resp) => {
    // Удаляем завершённые запросы из списка
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
    
    // Удаляем неудачные запросы из списка
    if (err.config?.signal) {
      pendingRequests.forEach(controller => {
        if (controller.signal === err.config.signal) {
          pendingRequests.delete(controller)
        }
      })
    }
    
    const status = err.response?.status
    
    // Обработка 403 (может быть CSRF token expired)
    if (status === 403 && err.response?.data?.message?.includes('CSRF')) {
      console.warn('⚠️  CSRF token expired, fetching new one')
      await fetchCsrfToken()
      
      // Повторяем запрос с новым CSRF токеном
      if (csrfToken && originalRequest.headers) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken
        return apiClient(originalRequest)
      }
    }
    
    // Auto-refresh логика при 401
    if (
      status === 401 &&
      !originalRequest._retry && // Избегаем бесконечного цикла
      err.name !== 'AbortError' &&
      err.name !== 'CanceledError'
    ) {
      // Если уже идёт refresh, добавляем запрос в очередь
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
      
      // Начинаем refresh
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const newToken = await refreshAccessToken()
        
        if (newToken) {
          // Обновляем заголовок и повторяем оригинальный запрос
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
          return apiClient(originalRequest)
        } else {
          // Refresh failed - logout
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

// Функция для отмены всех активных запросов (вызывается при logout)
export function cancelAllRequests() {
  pendingRequests.forEach(controller => {
    try {
      controller.abort('User logged out')
    } catch (e) {
      // Ignore cancellation errors
    }
  })
  pendingRequests.clear()
}

// Экспорт helper функций для других модулей
export { getTokenFromCookie, deleteTokenCookie }

export default apiClient
