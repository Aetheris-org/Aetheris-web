import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Bookmark, Calendar, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { getBookmarks, removeBookmark } from '@/api/bookmarks-graphql'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/logger'

export default function ReadingListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch bookmarks from backend
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => getBookmarks(0, 100),
    enabled: !!user, // Запрашиваем только если пользователь авторизован
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 30 * 60 * 1000, // 30 минут
  })

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      toast({
        title: t('readingList.remove'),
        description: t('readingList.removedFromFavorites'),
      })
    },
    onError: (error) => {
      logger.error('Failed to remove bookmark:', error)
      toast({
        title: t('common.error'),
        description: t('readingList.removeError'),
        variant: 'destructive',
      })
    },
  })

  // Clear all bookmarks mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      // Удаляем все закладки по одной
      const promises = bookmarks.map((bookmark) => removeBookmark(bookmark.article.id))
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      toast({
        title: t('readingList.clearAll'),
        description: t('readingList.allRemoved'),
      })
    },
    onError: (error) => {
      logger.error('Failed to clear all bookmarks:', error)
      toast({
        title: t('common.error'),
        description: t('readingList.clearError'),
        variant: 'destructive',
      })
    },
  })

  const sortedItems = useMemo(
    () =>
      [...bookmarks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookmarks]
  )

  const handleOpenArticle = (articleId: string) => {
    navigate(`/article/${articleId}`)
  }

  const handleRemove = async (articleId: string) => {
    removeBookmarkMutation.mutate(articleId)
  }

  const handleClearAll = () => {
    if (bookmarks.length === 0) return
    clearAllMutation.mutate()
  }

  if (!user) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('readingList.back')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">{t('readingList.title')}</h1>
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
              <Bookmark className="h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-xl">{t('readingList.signInRequired')}</CardTitle>
              <CardDescription>
                {t('readingList.signInDescription')}
              </CardDescription>
              <Button onClick={() => navigate('/auth')}>{t('auth.signIn')}</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('readingList.back')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">{t('readingList.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>

        <main className="container py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">{t('common.loading')}</p>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('readingList.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('readingList.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-8">
        {sortedItems.length === 0 ? (
          <Card className="mx-auto max-w-2xl border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">{t('readingList.noSavedArticles')}</CardTitle>
              <CardDescription className="max-w-md">
                {t('readingList.noSavedArticlesDescription')}
              </CardDescription>
              <Button onClick={() => navigate('/')}>{t('readingList.browseArticles')}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t('readingList.savedForLater')}</CardTitle>
                  <CardDescription>
                    {sortedItems.length === 1
                      ? t('readingList.oneArticleInQueue')
                      : t('readingList.articlesReadyToRead', { count: sortedItems.length })}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleClearAll}
                  disabled={bookmarks.length === 0 || clearAllMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('readingList.clearAll')}
                </Button>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {sortedItems.map((bookmark) => {
                const article = bookmark.article
                const plainText = article.content?.replace(/<[^>]*>/g, '') || ''
                const readTime = Math.ceil(plainText.length / 1000) || 1

                return (
                  <Card key={bookmark.id} className="border-border/60">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div
                        className="flex-1 cursor-pointer space-y-3"
                        onClick={() => handleOpenArticle(article.id)}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="gap-1">
                            <Bookmark className="h-3 w-3" />
                            {t('readingList.savedOn', { date: new Date(bookmark.createdAt).toLocaleDateString() })}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t('readingList.minRead', { minutes: readTime })}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground hover:text-primary">
                          {article.title}
                        </h2>
                        {article.excerpt ? (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {article.excerpt}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {plainText.slice(0, 160)}…
                          </p>
                        )}
                        {article.tags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-md">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleOpenArticle(article.id)}
                        >
                          {t('readingList.continueReading')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(article.id)}
                          disabled={removeBookmarkMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('readingList.remove')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


