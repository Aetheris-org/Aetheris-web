import axios from 'axios'
import { logger } from './logger'
import { rateLimiter, type RequestType } from './rateLimiter'
import { RateLimitError } from './errors'

// В development используем прокси Vite (/api -> http://localhost:1337)
// Это позволяет cookie работать, так как все запросы идут через один домен (localhost:5173)
// В production используем прямой URL из env
const baseURL = import.meta.env.DEV 
  ? '/api' // Используем прокси Vite в development
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337')


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


const pendingRequests = new Set<AbortController>()

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  config.headers = config.headers || {}
  
  // Rate limiting: проверяем лимиты перед отправкой запроса
  const method = config.method?.toUpperCase() || '';
  const url = config.url || '';
  
  // Определяем тип операции из URL и метода
  let rateLimitType: RequestType = 'mutation';
  if (url.includes('/comments')) {
    rateLimitType = 'comment';
  } else if (url.includes('/upload')) {
    rateLimitType = 'upload';
  } else if (url.includes('/auth') || url.includes('/connect')) {
    rateLimitType = 'login';
  } else if (method === 'GET') {
    rateLimitType = 'query';
  }
  
  // Проверяем rate limit
  const limitCheck = rateLimiter.checkLimit(rateLimitType);
  if (!limitCheck.allowed) {
    const waitTime = limitCheck.waitTime || 0;
    logger.warn(`[Axios] Rate limit exceeded for ${rateLimitType}`, { waitTime, url });
    return Promise.reject(new RateLimitError(waitTime, rateLimitType, 'client'));
  }
  
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
    
    // Записываем успешный запрос в историю rate limiter
    const method = resp.config.method?.toUpperCase() || '';
    const url = resp.config.url || '';
    let rateLimitType: RequestType = 'mutation';
    if (url.includes('/comments')) {
      rateLimitType = 'comment';
    } else if (url.includes('/upload')) {
      rateLimitType = 'upload';
    } else if (url.includes('/auth') || url.includes('/connect')) {
      rateLimitType = 'login';
    } else if (method === 'GET') {
      rateLimitType = 'query';
    }
    rateLimiter.recordRequest(rateLimitType);
    
    return resp
  },
  async (err) => {
    // const _originalRequest = err.config // Unused, but may be needed in future
    
    if (err.config?.signal) {
      pendingRequests.forEach(controller => {
        if (controller.signal === err.config.signal) {
          pendingRequests.delete(controller)
        }
      })
    }
    
    const status = err.response?.status
    
    // Обработка HTTP 429 ошибок (Rate Limit от сервера)
    if (status === 429) {
      const retryAfter = err.response?.headers?.['retry-after'] || err.response?.headers?.['Retry-After'];
      const responseData = err.response?.data || {};
      
      // Пытаемся извлечь время ожидания из заголовка или ответа
      let waitTime = 0;
      if (retryAfter) {
        waitTime = parseInt(retryAfter, 10);
      } else if (responseData.waitTime !== undefined) {
        waitTime = parseInt(responseData.waitTime, 10);
      } else if (responseData.message) {
        // Пытаемся извлечь время из сообщения (например, "wait 5 seconds")
        const match = responseData.message.match(/(\d+)\s*(?:second|секунд)/i);
        if (match) {
          waitTime = parseInt(match[1], 10);
        }
      }
      
      // Определяем тип операции из URL и метода
      const url = err.config?.url || '';
      const method = err.config?.method?.toUpperCase() || '';
      let rateLimitType: RequestType = 'mutation';
      if (url.includes('/comments')) {
        rateLimitType = 'comment';
      } else if (url.includes('/upload')) {
        rateLimitType = 'upload';
      } else if (url.includes('/auth') || url.includes('/connect')) {
        rateLimitType = 'login';
      } else if (method === 'GET') {
        rateLimitType = 'query';
      }
      
      logger.warn('[Axios] Server rate limit exceeded', { waitTime, type: rateLimitType, url });
      return Promise.reject(new RateLimitError(waitTime, rateLimitType, 'server'));
    }
    
    // KeystoneJS использует сессии через cookies, refresh token не требуется
    // При 401 ошибке просто редиректим на страницу авторизации
    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
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

