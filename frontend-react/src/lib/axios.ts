import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: any) => void
}> = []

let csrfToken: string | null = null

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
  console.log('🍪 All cookies:', document.cookie)

  // Prefer accessToken over jwtToken since it's our internal token format
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    console.log('🍪 Checking cookie:', name, value ? 'present' : 'empty')
    if (name === 'accessToken') {
      const token = decodeURIComponent(value)
      console.log(`🎫 Found ${name} cookie:`, token.substring(0, 20) + '...')
      return token
    }
  }

  // Fallback to jwtToken if no accessToken
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'jwtToken') {
      const token = decodeURIComponent(value)
      console.log(`🎫 Found ${name} cookie:`, token.substring(0, 20) + '...')
      return token
    }
  }

  console.log('❌ No jwtToken or accessToken cookie found')
  return null
}

export function deleteTokenCookie() {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
  document.cookie = 'jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    console.log('🔄 Refreshing access token...')
    
    const response = await axios.post(
      `${baseURL}/api/auth/refresh`,
      {},
      {
        withCredentials: true,
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

const pendingRequests = new Set<AbortController>()

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  config.headers = config.headers || {}
  
  // Добавляем токен если он есть И:
  // - Это защищенный метод (POST, PUT, DELETE, PATCH), ИЛИ
  // - URL требует авторизации (/api/users/me, /api/articles/*/react, и т.д.), ИЛИ
  // - Явно указано X-Require-Auth
  const token = getTokenFromCookie()
  const isProtectedMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')
  const requiresAuth = config.url?.includes('/api/me') ||
                       config.url?.includes('/users/me') ||
                       config.url?.includes('/react') ||
                       config.url?.includes('/user-reaction') ||
                       config.headers['X-Require-Auth'] ||
                       config.headers['x-require-auth']
  
  if (token && (isProtectedMethod || requiresAuth)) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Adding Authorization header for:', config.url, 'token length:', token.length)
    delete config.headers['X-Require-Auth'] // Удаляем служебный заголовок
  } else if (!token && requiresAuth) {
    console.warn('⚠️ No token found but request requires auth:', config.url)
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
      console.warn('⚠️  CSRF token expired, fetching new one')
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

