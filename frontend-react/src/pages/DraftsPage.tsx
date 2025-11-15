import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Clock, PencilLine, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useAuthStore } from '@/stores/authStore'
import { getDraftArticles, deleteArticle } from '@/api/articles'
import type { Article } from '@/types/article'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/hooks/useTranslation'

function DraftSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted/30" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted/30" />
        <div className="h-16 w-full animate-pulse rounded bg-muted/30" />
        <div className="flex gap-3">
          <div className="h-9 w-28 animate-pulse rounded bg-muted/30" />
          <div className="h-9 w-28 animate-pulse rounded bg-muted/30" />
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

  const {
    data: drafts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Article[], Error>({
    queryKey: ['drafts', user?.id],
    queryFn: () => {
      if (!user?.id) {
        return Promise.resolve([])
      }
      if (import.meta.env.DEV) {
        console.info('[DraftsPage] Fetching drafts for user', user.id)
      }
      return getDraftArticles(user.id, { limit: 50 })
    },
    enabled: !!user?.id,
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

  const handleContinueDraft = (draftId: number) => {
    navigate(`/create?draft=${draftId}`)
  }

  const handleDeleteDraft = async (draftId: number) => {
    try {
      await deleteArticle(draftId)
      await refetch()
      toast({
        title: t('drafts.deleted'),
        description: t('drafts.deletedDescription'),
      })
      queryClient.invalidateQueries({ queryKey: ['drafts', user?.id] })
    } catch (error: unknown) {
      console.error('[DraftsPage] Failed to remove draft', error)
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
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                {t('common.back')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">{t('drafts.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>

        <main className="container flex flex-col items-center justify-center py-16 text-center">
          <Card className="max-w-md border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-xl">{t('drafts.signInToManage')}</CardTitle>
              <CardDescription>
                {t('drafts.signInDescription')}
              </CardDescription>
              <Button onClick={() => navigate('/auth')}>{t('auth.signIn')}</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('drafts.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreateDraft} className="gap-2">
              <PencilLine className="h-4 w-4" />
              {t('drafts.newDraft')}
            </Button>
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-8">
        {isLoading ? (
          <div className="mx-auto max-w-4xl space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <DraftSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <Card className="mx-auto max-w-2xl border-dashed bg-muted/30 text-center">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">{t('drafts.error')}</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : t('drafts.errorDescription')}
              </CardDescription>
              <Button onClick={() => refetch()}>{t('common.retry')}</Button>
            </CardContent>
          </Card>
        ) : formattedDrafts.length === 0 ? (
          <Card className="mx-auto max-w-2xl border-dashed bg-muted/30 text-center">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">{t('drafts.noDrafts')}</CardTitle>
              <CardDescription>
                {t('drafts.noDraftsDescription')}
              </CardDescription>
              <Button onClick={handleCreateDraft}>{t('drafts.startWriting')}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t('drafts.yourDrafts')}</CardTitle>
                  <CardDescription>
                    {formattedDrafts.length === 1
                      ? t('drafts.oneDraftWaiting')
                      : t('drafts.draftsReady', { count: formattedDrafts.length })}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {formattedDrafts.map((draft) => (
                <Card key={draft.databaseId} className="border-border/60">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {t('drafts.draft')}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {t('drafts.updated')} {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}
                        </span>
                        {draft.difficulty && (
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {draft.difficulty}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">{draft.title || t('drafts.untitledDraft')}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {draft.excerpt || draft.content.slice(0, 220) || t('drafts.emptyDraft')}
                        {draft.content.length > 220 ? '…' : ''}
                      </p>
                      {draft.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {draft.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-md">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        className="gap-2 sm:w-auto"
                        onClick={() => handleContinueDraft(draft.databaseId)}
                      >
                        <PencilLine className="h-4 w-4" />
                        {t('drafts.continueWriting')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDraft(draft.databaseId)}
                      >
                        <Trash2 className="h-4 w-4" />
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

