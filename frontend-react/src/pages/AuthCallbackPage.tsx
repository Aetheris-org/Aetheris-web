import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { getTokenFromCookie } from '@/lib/axios'
import { getCurrentUser } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search)
      const errorParam = params.get('error')
      const fallbackToken = params.get('access_token')

      if (errorParam) {
        try {
          setErrorMessage(decodeURIComponent(errorParam))
        } catch {
          setErrorMessage(errorParam)
        }
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
        return
      }

      if (!getTokenFromCookie() && fallbackToken) {
        document.cookie = `accessToken=${fallbackToken}; path=/; SameSite=Lax`
      }

      if (!getTokenFromCookie()) {
        setErrorMessage('Токен авторизации не найден. Попробуйте войти снова.')
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
        return
      }

      try {
        const user = await getCurrentUser()
        setUser(user)

        const redirect = sessionStorage.getItem('auth_redirect') || '/'
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
