import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { getCurrentUser } from '@/api/auth'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/lib/logger'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logger.debug('🔍 AuthCallbackPage: Processing Supabase OAuth callback')
        
        // Supabase обрабатывает OAuth callback через hash в URL
        // Проверяем наличие hash (Supabase использует hash вместо query params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(location.search)

        // Проверяем ошибки в hash или query
        const errorParam = hashParams.get('error') || searchParams.get('error')
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description')
        
        if (errorParam) {
          logger.error('❌ OAuth error:', errorParam, errorDescription)
          setErrorMessage(errorDescription || errorParam || 'Ошибка авторизации')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
          return
        }

        // Supabase автоматически обрабатывает hash и устанавливает сессию
        // Нужно дождаться, пока Supabase обработает callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          logger.error('❌ Failed to get session:', sessionError)
          setErrorMessage('Не удалось получить сессию. Повторите попытку.')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
          return
        }

        if (!session) {
          logger.warn('⚠️ No session found after OAuth callback')
          setErrorMessage('Сессия не найдена. Повторите попытку.')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
          return
        }

        logger.debug('✅ Supabase session created:', { userId: session.user.id })

        // Получаем данные пользователя
        let user = null
        let retries = 3
        
        while (!user && retries > 0) {
          try {
            user = await getCurrentUser()
            if (user) {
              logger.debug('👤 User loaded:', user)
              break
            }
          } catch (error: any) {
            logger.warn(`⚠️ Failed to get user data (${retries} retries left):`, error.message)
            if (retries > 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
          retries--
        }
        
        if (!user) {
          logger.error('❌ Failed to get user data after OAuth')
          setErrorMessage('Не удалось загрузить данные пользователя. Повторите попытку.')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
          return
        }

        setUser(user)

        // Очищаем hash из URL
        window.history.replaceState({}, document.title, window.location.pathname)

        // Если профиль «сырой» (нет tag или ник пуст) и онбординг не проходили ранее, отправляем на онбординг
        const hasLocalOnboarding = typeof window !== 'undefined' && localStorage.getItem('onboarding_completed') === 'true'
        if ((!user.tag || !user.nickname) && !hasLocalOnboarding) {
          logger.debug('➡️ Redirecting to onboarding due to incomplete profile')
          navigate('/onboarding', { replace: true })
          return
        }

        // Перенаправляем на сохраненный URL или на главную
        const savedRedirect = sessionStorage.getItem('auth_redirect')
        logger.debug('🔍 Checking auth_redirect from sessionStorage:', savedRedirect)
        
        const redirect = savedRedirect || '/forum'
        logger.debug('🚀 Navigating to:', redirect)
        sessionStorage.removeItem('auth_redirect')
        navigate(redirect, { replace: true })
      } catch (error: any) {
        logger.error('❌ Failed to process OAuth callback:', error)
        setErrorMessage('Не удалось завершить авторизацию. Повторите попытку.')
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
      }
    }

    handleCallback()
  }, [location.search, location.hash, navigate, setUser])

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
