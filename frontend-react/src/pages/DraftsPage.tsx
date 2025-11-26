import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Clock, PencilLine, Trash2, ArrowLeft } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useAuthStore } from '@/stores/authStore'
import { getDrafts, deleteDraft } from '@/api/drafts-graphql'
import type { Article } from '@/types/article'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/hooks/useTranslation'
import { RateLimitError } from '@/lib/errors'

function DraftSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5">
        <div className="h-3 sm:h-4 w-1/4 animate-pulse rounded bg-muted/30" />
        <div className="h-5 sm:h-6 w-2/3 animate-pulse rounded bg-muted/30" />
        <div className="h-12 sm:h-16 w-full animate-pulse rounded bg-muted/30" />
        <div className="flex gap-2 sm:gap-3">
          <div className="h-8 sm:h-9 w-full sm:w-28 animate-pulse rounded bg-muted/30" />
          <div className="h-8 sm:h-9 w-full sm:w-28 animate-pulse rounded bg-muted/30" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DraftsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  // Helper функция для обработки RateLimitError
  const handleRateLimitError = (error: any) => {
    if (error instanceof RateLimitError) {
      const waitTime = error.waitTime
      if (waitTime > 0) {
        toast({
          title: t('common.rateLimitExceeded') || 'Слишком много запросов',
          description: waitTime === 1
            ? t('common.waitOneSecond') || 'Подождите 1 секунду перед следующим действием'
            : t('common.waitSeconds', { seconds: waitTime }) || `Подождите ${waitTime} секунд перед следующим действием`,
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      } else {
        toast({
          title: t('common.rateLimitExceeded') || 'Слишком много запросов',
          description: t('common.waitAMoment') || 'Вы слишком часто отправляете запросы. Подождите немного.',
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      }
      return true
    }
    return false
  }

  // Map old difficulty values to new ones for backward compatibility
  const getDifficultyKey = (difficulty: string | undefined): string => {
    if (!difficulty) return ''
    const difficultyMap: Record<string, string> = {
      'easy': 'beginner',
      'medium': 'intermediate',
      'hard': 'advanced',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
    }
    return difficultyMap[difficulty.toLowerCase()] || difficulty
  }

  const {
    data: drafts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Article[], Error>({
    queryKey: ['drafts'],
    queryFn: () => {
      logger.debug('[DraftsPage] Fetching drafts')
      return getDrafts(0, 100)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 30 * 60 * 1000, // 30 минут
  })

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
      toast({
        title: t('drafts.deleted'),
        description: t('drafts.deletedDescription'),
      })
    },
    onError: (error: unknown) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('[DraftsPage] Failed to delete draft', error)
      toast({
        title: t('drafts.deleteError'),
        description:
          typeof error === 'object' && error && 'response' in error
            ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
            : error instanceof Error
              ? error.message
              : t('drafts.deleteErrorDescription'),
        variant: 'destructive',
      })
    },
  })

  const formattedDrafts = useMemo(
    () =>
      drafts.map((draft) => ({
        ...draft,
        updatedAt: draft.updatedAt || draft.createdAt,
      })),
    [drafts]
  )

  const handleCreateDraft = () => {
    navigate('/create')
  }

  const handleContinueDraft = (draftId: string | number) => {
    navigate(`/create?draft=${draftId}`)
  }

  const handleDeleteDraft = async (draftId: string | number) => {
    deleteDraftMutation.mutate(String(draftId))
  }

  if (!user) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
              <h1 className="text-sm sm:text-lg font-semibold truncate">{t('drafts.title')}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>

        <main className="container flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4 sm:px-6">
          <Card className="max-w-md w-full border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center gap-3 sm:gap-4 py-8 sm:py-10 px-4 sm:px-6">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <CardTitle className="text-base sm:text-xl">{t('drafts.signInToManage')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('drafts.signInDescription')}
              </CardDescription>
              <Button onClick={() => navigate('/auth')} className="h-9 sm:h-10 text-xs sm:text-sm">{t('auth.signIn')}</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold truncate">{t('drafts.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button size="sm" onClick={handleCreateDraft} className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
              <PencilLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('drafts.newDraft')}</span>
            </Button>
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        {isLoading ? (
          <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <DraftSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <Card className="mx-auto max-w-2xl w-full border-dashed bg-muted/30 text-center">
            <CardContent className="flex flex-col items-center gap-3 sm:gap-4 py-10 sm:py-12 px-4 sm:px-6">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              <CardTitle className="text-base sm:text-xl">{t('drafts.error')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {error instanceof Error ? error.message : t('drafts.errorDescription')}
              </CardDescription>
              <Button onClick={() => refetch()} className="h-9 sm:h-10 text-xs sm:text-sm">{t('common.retry')}</Button>
            </CardContent>
          </Card>
        ) : formattedDrafts.length === 0 ? (
          <Card className="mx-auto max-w-2xl w-full border-dashed bg-muted/30 text-center">
            <CardContent className="flex flex-col items-center gap-3 sm:gap-4 py-10 sm:py-12 px-4 sm:px-6">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              <CardTitle className="text-base sm:text-xl">{t('drafts.noDrafts')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('drafts.noDraftsDescription')}
              </CardDescription>
              <Button onClick={handleCreateDraft} className="h-9 sm:h-10 text-xs sm:text-sm">{t('drafts.startWriting')}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
                <div>
                  <CardTitle className="text-base sm:text-lg">{t('drafts.yourDrafts')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {formattedDrafts.length === 1
                      ? t('drafts.oneDraftWaiting')
                      : t('drafts.draftsReady', { count: formattedDrafts.length })}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-3 sm:space-y-4">
              {formattedDrafts.map((draft) => (
                <Card key={draft.id} className="border-border/60">
                  <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                        <Badge variant="outline" className="gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                          <FileText className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                          {t('drafts.draft')}
                        </Badge>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {t('drafts.updated')} {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}
                        </span>
                        {draft.difficulty && (
                          <Badge variant="secondary" className="uppercase tracking-wide text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                            {t(`createArticle.difficultyOptions.${getDifficultyKey(draft.difficulty)}`)}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground break-words">{draft.title || t('drafts.untitledDraft')}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                        {draft.excerpt || draft.content.slice(0, 220) || t('drafts.emptyDraft')}
                        {draft.content.length > 220 ? '…' : ''}
                      </p>
                      {draft.tags?.length ? (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {draft.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-md text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
                        onClick={() => handleContinueDraft(draft.id)}
                      >
                        <PencilLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {t('drafts.continueWriting')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm text-destructive hover:text-destructive w-full sm:w-auto"
                        onClick={() => handleDeleteDraft(draft.id)}
                        disabled={deleteDraftMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {t('drafts.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

