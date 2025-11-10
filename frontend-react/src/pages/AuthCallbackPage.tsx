import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { getTokenFromCookie } from '@/lib/axios'
import { getCurrentUser } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
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

      console.log('🔐 OAuth callback - checking tokens...')
      console.log('   search:', location.search)
      console.log('   hash:', location.hash)

      const shouldExchange =
        searchParams.has('code') ||
        searchParams.has('access_token') ||
        searchParams.has('id_token') ||
        hashParams.has('code') ||
        hashParams.has('access_token') ||
        hashParams.has('id_token')

      let userFromExchange: any = null

      if (shouldExchange) {
        // Объединяем параметры поиска и хеша в один query string для Strapi
        const mergedParams = new URLSearchParams(location.search)
        hashParams.forEach((value, key) => {
          if (!mergedParams.has(key)) {
            mergedParams.append(key, value)
          }
        })

        console.log('🔄 Exchanging OAuth data with Strapi callback:', mergedParams.toString())

        try {
          const exchangeResponse = await fetch(
            `${API_BASE}/api/auth/google/callback?${mergedParams.toString()}`,
            {
              credentials: 'include',
            },
          )

          if (!exchangeResponse.ok) {
            const errorBody = await exchangeResponse.text()
            console.error(
              '❌ Failed to exchange data for JWT:',
              exchangeResponse.status,
              errorBody,
            )
            setErrorMessage('Не удалось получить токен от сервера. Попробуйте ещё раз.')
            setTimeout(() => navigate('/auth', { replace: true }), 3000)
            return
          }

          const exchangeData = await exchangeResponse.json()
          console.log('✅ Received exchange payload:', exchangeData)

          if (exchangeData?.jwt) {
            document.cookie = `accessToken=${encodeURIComponent(exchangeData.jwt)}; path=/; SameSite=Lax`
          } else {
            console.warn('⚠️ Strapi callback response does not contain jwt field.')
          }

          if (exchangeData?.user) {
            userFromExchange = exchangeData.user

            setUser({
              id: exchangeData.user.id,
              nickname: exchangeData.user.username ?? exchangeData.user.email ?? 'user',
              email: exchangeData.user.email ?? '',
              avatar: exchangeData.user.avatar ?? undefined,
              bio: exchangeData.user.bio ?? undefined,
              articlesCount: 0,
              commentsCount: 0,
              likesReceived: 0,
              viewsReceived: 0,
              createdAt: exchangeData.user.createdAt ?? new Date().toISOString(),
              status: 'active',
              role: exchangeData.user.role ?? 'user',
              isVerified: exchangeData.user.confirmed ?? true,
              isProfilePublic: true,
              showEmail: false,
              showLastSeen: false,
              reputation: 0,
              level: 1,
              experience: 0,
            })
          }
        } catch (exchangeError) {
          console.error('❌ Unexpected error during OAuth exchange:', exchangeError)
          setErrorMessage('Произошла ошибка при завершении авторизации.')
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
          return
        }
      }

      // Убираем чувствительные query-параметры из URL
      navigate('/auth/callback', { replace: true })

      const token = getTokenFromCookie()
      console.log('🔐 Final token check:', !!token, 'cookie value length:', token?.length ?? 0)

      if (!token) {
        setErrorMessage('Токен авторизации не найден. Попробуйте войти снова.')
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
        return
      }

      if (!userFromExchange) {
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
      } else {
        const redirect = sessionStorage.getItem('auth_redirect') || '/'
        sessionStorage.removeItem('auth_redirect')
        navigate(redirect, { replace: true })
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
