import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Apple,
  Github,
  Linkedin,
  Loader2,
  MessagesSquare,
  Shield,
  Smartphone,
  Sparkles,
  Twitter,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'

function DiscordIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.317 4.37A17.643 17.643 0 0 0 16.61 3c-.18.32-.386.75-.53 1.09a16.14 16.14 0 0 0-4.16 0c-.144-.34-.35-.77-.53-1.09a17.64 17.64 0 0 0-3.71 1.37C4.275 8.14 3.76 11.81 4.07 15.43a17.94 17.94 0 0 0 4.43 2.18c.36-.52.68-1.07.96-1.65-.52-.19-1.01-.42-1.47-.68l.34-.27c2.82 1.31 5.89 1.31 8.69 0l.34.27c-.46.26-.95.5-1.47.68.28.58.6 1.13.96 1.65a17.94 17.94 0 0 0 4.43-2.18c.31-3.23-.27-6.86-1.96-11.06ZM9.35 13.48c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Zm5.29 0c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Z" />
    </svg>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTarget = useMemo(() => searchParams.get('redirect') || '/', [searchParams])
  const hasExplicitRedirect = useMemo(() => searchParams.has('redirect'), [searchParams])

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

  const handleGoogleLogin = () => {
    if (isLoading) return
    setIsLoading(true)

    // Сохраняем redirect в sessionStorage, если он был явно передан в URL
    // Это нужно для OAuth callback, чтобы вернуть пользователя на ту же страницу
    // Важно: сохраняем даже если redirectTarget это '/', так как это может быть лендинг
    if (hasExplicitRedirect) {
      console.log('💾 Saving auth_redirect to sessionStorage:', redirectTarget)
      sessionStorage.setItem('auth_redirect', redirectTarget)
      // Проверяем, что значение действительно сохранилось
      const saved = sessionStorage.getItem('auth_redirect')
      console.log('✅ Verified saved redirect:', saved)
    } else {
      // Если redirect не был передан, значит пользователь зашел напрямую на /auth
      // В этом случае после авторизации перенаправим на /forum (главная страница со статьями)
      console.log('⚠️ No explicit redirect found, will use /forum after auth')
    }

    window.location.href = `${API_BASE}/api/connect/google`
  }

  return (
    <div className="relative min-h-screen app-surface flex items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-lg border-border/60">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between text-2xl font-bold">
              <span>{t('auth.accountTitle')}</span>
              <Badge variant="secondary" className="gap-1 text-[11px] uppercase tracking-wide">
                <Shield className="h-3 w-3" />
                {t('auth.secureOAuth')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

            <Tabs defaultValue="oauth" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="oauth">{t('auth.oneClickSignIn')}</TabsTrigger>
                <TabsTrigger value="coming-soon">{t('auth.comingSoon')}</TabsTrigger>
              </TabsList>
              <TabsContent value="oauth" className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
                  className="w-full gap-3 border border-border/80 bg-white text-gray-900 transition-colors hover:border-primary/40 hover:bg-white hover:text-gray-900 dark:border-border dark:bg-white dark:text-gray-900 dark:hover:border-primary/40"
                  variant="ghost"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('auth.signingIn')}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                        <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042л3.007-2.332z" fill="#FBBC05" />
                        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958л3.007 2.332z" fill="#EA4335" />
                </svg>
                      <span>{t('auth.continueWithGoogle')}</span>
              </>
            )}
          </Button>

                <div className="space-y-2 rounded-lg border border-muted-foreground/10 bg-muted/20 p-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {t('auth.neverStorePassword')}
                  </p>
                  <p>
                    {t('auth.twoFactorInfo')}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="coming-soon" className="space-y-4">
                {[
                  { label: t('auth.continueWithGitHub'), icon: Github },
                  { label: t('auth.continueWithApple'), icon: Apple },
                  { label: t('auth.continueWithTwitter'), icon: Twitter },
                  { label: t('auth.continueWithLinkedIn'), icon: Linkedin },
                  { label: t('auth.continueWithSlack'), icon: MessagesSquare },
                  { label: t('auth.continueWithFigma'), icon: Sparkles },
                  { label: t('auth.continueWithDiscord'), icon: DiscordIcon },
                ].map((provider) => (
                  <Button
                    key={provider.label}
                    variant="outline"
                    className="w-full justify-between gap-3"
                    disabled
                  >
                    <span className="flex items-center gap-2">
                      <provider.icon className="h-4 w-4" />
                      {provider.label}
                    </span>
                    <Badge variant="secondary" className="gap-1 text-[10px] uppercase tracking-wide">
                      {t('auth.soon')}
                    </Badge>
                  </Button>
                ))}
                <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {t('auth.additionalProviders')}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                <Smartphone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t('auth.whereYouLeftOff')}</p>
                  <p>{t('auth.whereYouLeftOffDescription')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t('auth.inviteOnlyBeta')}</p>
                  <p>
                    {t('auth.inviteOnlyBetaDescription')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background shadow-xl">
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-primary" />
              {t('auth.whySignIn')}
            </CardTitle>
            <CardDescription>
              {t('auth.whySignInDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                {
                  title: t('auth.syncedReadingList'),
                  description: t('auth.syncedReadingListDescription'),
                },
                {
                  title: t('auth.authorDashboard'),
                  description: t('auth.authorDashboardDescription'),
                },
                {
                  title: t('auth.instantEditorAccess'),
                  description: t('auth.instantEditorAccessDescription'),
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm">
                  <p className="font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

          <Separator />

            <div className="space-y-3 text-xs text-muted-foreground">
              <p>
                {t('auth.termsAndPrivacy')}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground/80">
                <Shield className="h-3.5 w-3.5" />
                {t('auth.needHelp')} <span className="font-medium text-primary">hello@aetheris.dev</span>
              </p>
            </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

