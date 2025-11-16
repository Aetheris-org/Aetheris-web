import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { getCurrentUser } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем sessionStorage в самом начале
    const initialRedirect = sessionStorage.getItem('auth_redirect')
    console.log('🔍 AuthCallbackPage mounted, initial auth_redirect:', initialRedirect)
    
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search)
      const hashParams = new URLSearchParams(
        location.hash.startsWith('#') ? location.hash.slice(1) : location.hash,
      )

      const errorParam = searchParams.get('error') || hashParams.get('error')

      if (errorParam) {
        try {
          setErrorMessage(decodeURIComponent(errorParam))
        } catch {
          setErrorMessage(errorParam)
        }
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
        return
      }

      console.log('🔐 OAuth callback - checking authentication...')

      // В development токен передается через URL (для кросс-доменных запросов)
      // В production токен в httpOnly cookie (более безопасно)
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token')
      
      if (accessToken) {
        console.log('✅ Received access_token from OAuth callback')
        // Сохраняем токен в cookie для последующих запросов
        // В development используем обычную cookie (не httpOnly), так как JavaScript должен иметь доступ
        const maxAge = 7 * 24 * 60 * 60 // 7 дней в секундах
        document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax; max-age=${maxAge}`
        document.cookie = `jwtToken=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax; max-age=${maxAge}`
        console.log('💾 Token saved to cookies')
      }

      // Убираем чувствительные query-параметры из URL для безопасности
      navigate('/auth/callback', { replace: true })

      // Получаем данные пользователя - токен теперь в cookie или был передан через URL
      try {
        const user = await getCurrentUser()
        setUser(user)

        const savedRedirect = sessionStorage.getItem('auth_redirect')
        console.log('🔍 Checking auth_redirect from sessionStorage:', savedRedirect)
        
        // Используем сохраненный redirect, если он есть (даже если это '/')
        // Если redirect не был сохранен, используем '/forum' (главная страница со статьями)
        const redirect = savedRedirect !== null ? savedRedirect : '/forum'
        console.log('🚀 Navigating to:', redirect)
        sessionStorage.removeItem('auth_redirect')
        navigate(redirect, { replace: true })
      } catch (error) {
        console.error('Failed to finalize OAuth callback:', error)
        setErrorMessage('Не удалось завершить авторизацию. Повторите попытку.')
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
      }
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
