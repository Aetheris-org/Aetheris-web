import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookOpen, Loader2, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { logger } from '@/lib/logger'
import { signInWithOAuth } from '@/api/auth'

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTarget = useMemo(() => searchParams.get('redirect') || '/', [searchParams])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      try {
        setErrorMessage(decodeURIComponent(errorParam))
      } catch {
        setErrorMessage(errorParam)
      }
    } else {
      setErrorMessage(null)
    }
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, user, navigate, redirectTarget])

  const handleGoogleLogin = async () => {
    if (isLoading) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Сохраняем redirect в sessionStorage для OAuth callback
      logger.debug('💾 Saving auth_redirect to sessionStorage:', redirectTarget)
      sessionStorage.setItem('auth_redirect', redirectTarget)

      // Используем Supabase OAuth
      const result = await signInWithOAuth('google')
      
      if (!result.success) {
        setErrorMessage(result.message || 'Не удалось начать авторизацию')
        setIsLoading(false)
      }
      // Supabase перенаправит пользователя на страницу провайдера
      // После успешной авторизации провайдер перенаправит обратно на /auth/callback
    } catch (error: any) {
      logger.error('Failed to start OAuth:', error)
      setErrorMessage(error.message || 'Не удалось начать авторизацию')
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: BookOpen,
      title: t('auth.syncedReadingList'),
      description: t('auth.syncedReadingListDescription'),
    },
    {
      icon: TrendingUp,
      title: t('auth.authorDashboard'),
      description: t('auth.authorDashboardDescription'),
    },
    {
      icon: Sparkles,
      title: t('auth.instantEditorAccess'),
      description: t('auth.instantEditorAccessDescription'),
    },
  ]

  return (
    <div className="min-h-screen app-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('auth.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg space-y-6">
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.accountTitle')}</CardTitle>
            <CardDescription className="text-base">
              {t('auth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full gap-3 h-11 text-base bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-50 dark:border-gray-300"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('auth.signingIn')}</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958l3.007 2.332z" fill="#EA4335" />
                  </svg>
                  <span>{t('auth.continueWithGoogle')}</span>
                </>
              )}
            </Button>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{t('auth.privacyFirst')}</p>
              </div>
              <div className="space-y-2.5 pl-10">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('auth.neverStorePassword')}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('auth.emailHashInfo')}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              <p>
                {t('auth.termsAndPrivacyPrefix')}{' '}
                <Link to="/legal/terms" className="text-primary hover:underline">
                  {t('auth.termsOfService')}
                </Link>
                {' '}{t('common.and')}{' '}
                <Link to="/legal/privacy" className="text-primary hover:underline">
                  {t('auth.privacyPolicy')}
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('auth.benefitsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index}>
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                  {index < benefits.length - 1 && <Separator className="mt-4" />}
                </div>
              )
            })}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

