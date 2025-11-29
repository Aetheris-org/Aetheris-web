import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { getCurrentUser, getCurrentUserGraphQL } from '@/api/auth-graphql'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/lib/logger'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем sessionStorage в самом начале
    const initialRedirect = sessionStorage.getItem('auth_redirect')
    logger.debug('🔍 AuthCallbackPage mounted, initial auth_redirect:', initialRedirect)
    
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search)

      // Проверяем ошибки OAuth
      const errorParam = searchParams.get('error')
      if (errorParam) {
        try {
          setErrorMessage(decodeURIComponent(errorParam))
        } catch {
          setErrorMessage(errorParam)
        }
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
        return
      }

      // Проверяем успешный OAuth callback от KeystoneJS backend
      const oauthSuccess = searchParams.get('oauth')
      const userId = searchParams.get('userId')

      if (oauthSuccess === 'success' && userId) {
        logger.debug('✅ OAuth callback successful, userId:', userId)
        
        // KeystoneJS backend создал пользователя и сохранил userId в Express session
        // Теперь нужно создать KeystoneJS session через специальный endpoint
        try {
          const API_BASE = import.meta.env.DEV 
            ? '' // Используем прокси Vite
            : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337')

          // Создаем KeystoneJS session для OAuth пользователя
          // Передаем userId в body как fallback, если cookie сессии не передается между доменами
          const sessionResponse = await fetch(`${API_BASE}/api/auth/oauth/session`, {
            method: 'POST',
            credentials: 'include', // Важно: отправляем cookies
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Передаем userId в body как fallback
          })

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to create session')
          }

          const sessionData = await sessionResponse.json()
          logger.debug('✅ KeystoneJS session created:', sessionData)
          
          // Проверяем, что cookie был установлен в ответе
          const setCookieHeader = sessionResponse.headers.get('Set-Cookie')
          logger.debug('🔍 Cookie in response:', {
            hasSetCookie: !!setCookieHeader,
            setCookiePreview: setCookieHeader ? setCookieHeader.substring(0, 100) : null,
          })

          // Небольшая задержка, чтобы cookie успел установиться
          // Это особенно важно для кросс-доменных запросов
          await new Promise(resolve => setTimeout(resolve, 200))


          
          let graphqlUser: any = null
          let retries = 3
          

          while (!graphqlUser && retries > 0) {
            try {
              graphqlUser = await getCurrentUserGraphQL()
              if (graphqlUser) {
                logger.debug('👤 GraphQL user:', graphqlUser)
                break
              }
            } catch (error: any) {
              logger.warn(`⚠️ Failed to get user data (${retries} retries left):`, error.message)
              if (retries > 1) {
                // Ждем немного перед повторной попыткой
                await new Promise(resolve => setTimeout(resolve, 200))
              }
            }
            retries--
          }
          
          if (!graphqlUser) {
            logger.error('❌ Failed to get user data after OAuth (all retries exhausted)')
            throw new Error('Failed to get user data after OAuth')
          }

          // Преобразуем GraphQL user в формат, ожидаемый authStore
          const user = await getCurrentUser()
          setUser(user)

          const savedRedirect = sessionStorage.getItem('auth_redirect')
          logger.debug('🔍 Checking auth_redirect from sessionStorage:', savedRedirect)
          
          // Используем сохраненный redirect, если он есть
          const redirect = savedRedirect !== null ? savedRedirect : '/forum'
          logger.debug('🚀 Navigating to:', redirect)
          sessionStorage.removeItem('auth_redirect')
          navigate(redirect, { replace: true })
        } catch (error) {
          logger.error('Failed to finalize OAuth callback:', error)
          setErrorMessage('Не удалось завершить авторизацию. Повторите попытку.')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
        }
        return
      }

      // Если нет параметров OAuth, возможно это старый формат или ошибка
      logger.warn('⚠️ Unexpected OAuth callback format:', location.search)
      setErrorMessage('Неверный формат callback. Повторите попытку.')
      setTimeout(() => navigate('/auth', { replace: true }), 3000)
    }

    handleCallback()
  }, [location.search, navigate, setUser])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {errorMessage ? (
          <>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-10 w-10" />
              <h2 className="text-xl font-semibold">Ошибка авторизации</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">{errorMessage}</p>
            <p className="text-xs text-muted-foreground">Перенаправляем на страницу входа…</p>
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Завершаем вход…</h2>
            <p className="text-sm text-muted-foreground">Получаем данные вашего профиля</p>
          </>
        )}
      </div>
    </div>
  )
}
