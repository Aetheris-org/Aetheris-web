import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, CalendarDays, BarChart3, CornerDownRight, Hash, Clock, X } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { trendingArticlesMock } from '@/data/mockSections'
import { cn } from '@/lib/utils'

const timeframes = [
  { id: '24h', label: 'Last 24h' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
] as const

type TimeframeValue = (typeof timeframes)[number]['id']

const categories = ['All topics', 'Architecture', 'Community', 'Mentorship', 'UI', 'Growth']

export default function TrendingPage() {
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = useState<TimeframeValue>('24h')
  const [category, setCategory] = useState<string>('All topics')
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

  const handleDismissHero = () => {
    setIsHeroDismissed(true)
  }

  const filteredArticles = useMemo(() => {
    return trendingArticlesMock.filter((article) => {
      const matchesCategory =
        category === 'All topics' || article.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
      const matchesSearch = search
        ? [article.title, article.summary, article.author]
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  const topArticle = filteredArticles[0]
  const restArticles = filteredArticles.slice(1)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-6 pt-6">
        {!isHeroDismissed && (
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/10 p-6 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              onClick={handleDismissHero}
              aria-label="Dismiss hero section"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
                  Leaderboard
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Hot reads across the Aetheris guild.
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Discover what the community canʼt stop discussing. Rankings refresh every few hours based on views,
                  reactions, and meaningful replies.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {timeframes.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === timeframe ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn('gap-2 text-xs', item.id === timeframe && 'shadow-sm')}
                    onClick={() => setTimeframe(item.id)}
                  >
                    <Clock className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {topArticle && (
          <section className="grid gap-6 rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Flame className="h-4 w-4 text-primary" />
                Top article right now
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold leading-tight text-foreground">{topArticle.title}</h2>
                <p className="text-sm text-muted-foreground max-w-2xl">{topArticle.summary}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{topArticle.author}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{formatDate(topArticle.publishedAt)}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{topArticle.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{topArticle.reactions} reactions</span>
                  <span>•</span>
                  <span>{topArticle.comments} comments</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-md text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate(`/article/${topArticle.id}`)}>
                  Read article
                </Button>
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/article/${topArticle.id}`)}>
                  Save for later
                  <CornerDownRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Leaderboard metrics</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Signals tracked to determine article rank.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-1 h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Composite score</p>
                    <p>Weighted across views (50%), reactions (35%), meaningful comments (15%).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Recency bias</p>
                    <p>Articles older than 30 days gradually drop off unless activity spikes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="mt-1 h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Topic diversity</p>
                    <p>At least one slot reserved for each major guild topic.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="space-y-6 rounded-3xl border border-border/60 bg-muted/10 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Explore the leaderboard</CardTitle>
              <CardDescription>Filter by topic or search keywords to find whatʼs resonating.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search titles or authors"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
            {restArticles.map((article) => (
              <div
                key={article.id}
                className="grid gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/30 md:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    #{article.rank}
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
                  <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{article.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{article.reactions} reactions</span>
                    <span>•</span>
                    <span>{article.comments} comments</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap justify-end gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={`${article.id}-${tag}`} variant="outline" className="rounded-md capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="px-2 text-xs" onClick={() => navigate(`/article/${article.id}`)}>
                    Open article
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Want your article to trend?</CardTitle>
              <CardDescription>Ship something impactful and the guild will surface it on the leaderboard.</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => navigate('/create')}>
              Publish new article
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
