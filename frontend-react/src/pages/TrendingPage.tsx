import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Flame,
  CalendarDays,
  BarChart3,
  CornerDownRight,
  Hash,
  Clock,
  X,
  ArrowLeft,
  MessageCircle,
  Tag,
  Trophy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getTrendingArticles,
  getTrendingPopularTags,
  type TrendingPeriod,
} from '@/api/articles'
import { getTopComment } from '@/api/comments'
import type { Article } from '@/types/article'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'

const PERIODS: { id: TrendingPeriod; labelKey: string }[] = [
  { id: 'day', labelKey: 'trending.timeframes.day' },
  { id: 'week', labelKey: 'trending.timeframes.week' },
  { id: 'month', labelKey: 'trending.timeframes.month' },
  { id: 'year', labelKey: 'trending.timeframes.year' },
]

export default function TrendingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<TrendingPeriod>('week')
  const [category, setCategory] = useState<string>(t('trending.categories.all'))
  const [search, setSearch] = useState('')
  const [isHeroDismissed, setIsHeroDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trending-hero-dismissed')
      return saved === 'true'
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && isHeroDismissed) {
      localStorage.setItem('trending-hero-dismissed', 'true')
    }
  }, [isHeroDismissed])

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['trending-articles', period],
    queryFn: () => getTrendingArticles(undefined, 30, period),
  })

  const { data: popularTags = [], isLoading: loadingTags } = useQuery({
    queryKey: ['trending-tags', period],
    queryFn: () => getTrendingPopularTags(period, 14),
  })

  const { data: topCommentData, isLoading: loadingTopComment } = useQuery({
    queryKey: ['top-comment', period],
    queryFn: () => getTopComment(period),
  })

  const categories = [
    t('trending.categories.all'),
    t('trending.categories.architecture'),
    t('trending.categories.community'),
    t('trending.categories.mentorship'),
    t('trending.categories.ui'),
    t('trending.categories.growth'),
  ]

  const filteredArticles = useMemo(() => {
    const allTopicsLabel = t('trending.categories.all')
    return articles.filter((a) => {
      const matchesCategory =
        category === allTopicsLabel ||
        (a.tags || []).some((tag) => tag.toLowerCase() === category.toLowerCase())
      const authorName = [a.author?.nickname, a.author?.username].filter(Boolean).join(' ')
      const matchesSearch = search
        ? [a.title, a.excerpt, authorName].join(' ').toLowerCase().includes(search.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
  }, [articles, category, search, t])

  const topArticle = filteredArticles[0]
  const restArticles = filteredArticles.slice(1)

  const topAuthors = useMemo(() => {
    const byId: Record<string, { author: Article['author']; score: number }> = {}
    for (const a of articles) {
      const id = String(a.author?.id ?? '')
      if (!id) continue
      const score = (a.views ?? 0) + (a.reactionsCount ?? (a.likes ?? 0) + (a.dislikes ?? 0))
      if (!byId[id]) byId[id] = { author: a.author, score: 0 }
      byId[id].score += score
    }
    return Object.values(byId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [articles])

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-lg font-semibold">{t('trending.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="trending-dev-banner" />
      <main className="container space-y-10 pb-6 pt-6">
        {/* Hero */}
        {!isHeroDismissed && (
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/10 p-6 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              onClick={() => setIsHeroDismissed(true)}
              aria-label={t('trending.dismissHero')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
                  {t('trending.leaderboard')}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('trending.heading')}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {t('trending.description')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {PERIODS.map(({ id, labelKey }) => (
                  <Button
                    key={id}
                    variant={id === period ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn('gap-2 text-xs', id === period && 'shadow-sm')}
                    onClick={() => setPeriod(id)}
                  >
                    <Clock className="h-4 w-4" />
                    {t(labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top article + metrics */}
        {loadingArticles ? (
          <section className="grid gap-6 rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </section>
        ) : (
          topArticle && (
            <section className="grid gap-6 rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <Flame className="h-4 w-4 text-primary" />
                  {t('trending.topArticle')}
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold leading-tight text-foreground">{topArticle.title}</h2>
                  <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
                    {topArticle.excerpt || ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{topArticle.author?.nickname || topArticle.author?.username || '—'}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{formatDate(topArticle.publishedAt || topArticle.createdAt)}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{(topArticle.views ?? 0).toLocaleString()} {t('home.trending.views')}</span>
                    <span>•</span>
                    <span>{(topArticle.reactionsCount ?? (topArticle.likes || 0) + (topArticle.dislikes || 0))} {t('home.trending.reactions')}</span>
                    <span>•</span>
                    <span>{topArticle.commentsCount ?? 0} {t('profile.comments')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(topArticle.tags || []).slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-md text-xs capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate(`/article/${topArticle.id}`)}>
                    {t('trending.readArticle')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(`/article/${topArticle.id}`)}
                  >
                    {t('trending.saveForLater')}
                    <CornerDownRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Card className="border border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{t('trending.leaderboardMetrics')}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {t('trending.metricsDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{t('trending.compositeScore')}</p>
                      <p>{t('trending.compositeScoreDescription')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{t('trending.recencyBias')}</p>
                      <p>{t('trending.recencyBiasDescription')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{t('trending.topicDiversity')}</p>
                      <p>{t('trending.topicDiversityDescription')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )
        )}

        {/* Popular tags + Comment of the period — два блока рядом */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Популярные теги */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Tag className="h-4 w-4 text-primary" />
                {t('trending.popularTags.title')}
              </CardTitle>
              <CardDescription>{t('trending.popularTags.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTags ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-md" />
                  ))}
                </div>
              ) : popularTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('trending.popularTags.empty')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-default rounded-lg px-3 py-1 text-xs font-medium"
                    >
                      {tag}
                      <span className="ml-1.5 text-muted-foreground">×{count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Лучший комментарий периода */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <MessageCircle className="h-4 w-4 text-primary" />
                {t('trending.commentOfThePeriod.title')}
              </CardTitle>
              <CardDescription>{t('trending.commentOfThePeriod.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTopComment ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : !topCommentData ? (
                <p className="text-sm text-muted-foreground">{t('trending.commentOfThePeriod.noComment')}</p>
              ) : (
                <div className="space-y-3">
                  <p className="line-clamp-3 text-sm text-foreground">
                    &ldquo;{topCommentData.comment.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const id = topCommentData.comment.author?.uuid || topCommentData.comment.author?.id
                        if (id) navigate(`/profile/${id}`)
                      }}
                      className="flex items-center gap-2 text-left transition hover:opacity-80"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={topCommentData.comment.author?.avatar} />
                        <AvatarFallback className="text-xs">
                          {(topCommentData.comment.author?.username || '?').slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {topCommentData.comment.author?.username || '—'}
                      </span>
                    </button>
                    <span className="text-xs text-muted-foreground">
                      +{topCommentData.comment.likes ?? 0} {t('home.trending.reactions')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => navigate(`/article/${topCommentData.article.id}`)}
                  >
                    {t('trending.commentOfThePeriod.viewArticle')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Таблица лидеров — статьи */}
        <section className="space-y-6 rounded-3xl border border-border/70 bg-muted/5 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">{t('trending.exploreLeaderboard')}</CardTitle>
              <CardDescription>{t('trending.exploreDescription')}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder={t('trending.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xs"
              />
              <Tabs value={category} onValueChange={setCategory} className="w-full lg:w-auto">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 sm:flex sm:w-auto sm:flex-wrap">
                  {categories.map((item) => (
                    <TabsTrigger key={item} value={item} className="flex-1 whitespace-nowrap text-xs">
                      {item}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-3">
            {loadingArticles ? (
              [1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))
            ) : restArticles.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search || category !== t('trending.categories.all')
                  ? t('trending.noResults')
                  : t('trending.emptyLeaderboard')}
              </p>
            ) : (
              restArticles.map((article, idx) => {
                const rank = idx + 2
                const reactions = (article.reactionsCount ?? (article.likes || 0) + (article.dislikes || 0))
                return (
                  <div
                    key={article.id}
                    className="grid gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/30 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold',
                          rank <= 3 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        #{rank}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        className="text-left text-sm font-semibold text-foreground leading-tight hover:text-primary"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        {article.title}
                      </button>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {article.excerpt || ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{article.author?.nickname || article.author?.username || '—'}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{(article.views ?? 0).toLocaleString()} {t('home.trending.views')}</span>
                        <span>•</span>
                        <span>{reactions} {t('home.trending.reactions')}</span>
                        <span>•</span>
                        <span>{article.commentsCount ?? 0} {t('profile.comments')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(article.tags || []).slice(0, 3).map((tag) => (
                          <Badge
                            key={`${article.id}-${tag}`}
                            variant="outline"
                            className="rounded-md capitalize"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-xs"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        {t('trending.openArticle')}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Топ авторов */}
        {topAuthors.length > 0 && (
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="h-4 w-4 text-primary" />
                {t('trending.topAuthors.title')}
              </CardTitle>
              <CardDescription>{t('trending.topAuthors.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {topAuthors.map(({ author, score }) => (
                  <button
                    key={String(author?.id)}
                    type="button"
                    onClick={() => {
                      const id = author?.uuid || author?.id
                      if (id) navigate(`/profile/${id}`)
                    }}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5 transition hover:border-primary/40 hover:bg-muted/40"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={author?.avatar ?? undefined} />
                      <AvatarFallback className="text-sm">
                        {(author?.nickname || author?.username || '?').slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{author?.nickname || author?.username || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {score.toLocaleString()} {t('trending.topAuthors.points')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <section className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">{t('trending.wantToTrend')}</CardTitle>
              <CardDescription>{t('trending.wantToTrendDescription')}</CardDescription>
            </div>
            <Button size="sm" className="gap-2 shrink-0" onClick={() => navigate('/create')}>
              {t('trending.publishNewArticle')}
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

function formatDate(value: string | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
