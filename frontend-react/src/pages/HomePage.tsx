import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  List,
  Rows,
  Hash,
  Compass,
  GraduationCap,
  Terminal,
  Sparkles,
  Bookmark,
  MessageCircle,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getAllArticles, getTrendingArticles, type ArticleSortOption, type ArticleDifficulty } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/ArticleCard'
import { ArticleCardLine } from '@/components/ArticleCardLine'
import { ArticleCardSquare } from '@/components/ArticleCardSquare'
import { SiteHeader } from '@/components/SiteHeader'
import { networkingOpportunities, featuredCourses, developerResources, forumSpotlights } from '@/data/mockSections'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { useLocalStorage } from 'usehooks-ts'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()
  const viewModeOptions: Array<{
    id: 'default' | 'line' | 'square'
    label: string
    icon: LucideIcon
  }> = [
    {
      id: 'default',
      label: 'Standard cards',
      icon: Rows,
    },
    {
      id: 'line',
      label: 'Compact list',
      icon: List,
    },
    {
      id: 'square',
      label: 'Grid view',
      icon: LayoutGrid,
    },
  ]
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isViewModeExpanded, setIsViewModeExpanded] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<ArticleDifficulty | 'all'>('all')
  const [sortOption, setSortOption] = useState<ArticleSortOption>('newest')
  const [page, setPage] = useState(1)
  const [isSpotlightDismissed, setIsSpotlightDismissed] = useState(false)
  const pageSize = 10
  const popularTags = ['React', 'TypeScript', 'Next.js', 'Tailwind', 'shadcn/ui']
  const quickDestinations = useMemo(
    () => [
      {
        label: 'Networking',
        description: 'Find collaborators & clients',
        icon: Compass,
        action: () => navigate('/networking'),
      },
      {
        label: 'Courses',
        description: 'Grow your craft with guided paths',
        icon: GraduationCap,
        action: () => navigate('/courses'),
      },
      {
        label: 'Developers',
        description: 'Tooling, changelog, and resources',
        icon: Terminal,
        action: () => navigate('/developers'),
      },
    ],
    [navigate]
  )
  const openNetworking = useMemo(
    () => networkingOpportunities.filter((item) => item.status === 'open').length,
    []
  )
  const upcomingCourses = useMemo(() => featuredCourses.length, [])

  // Queries
  const { data: articlesData, isLoading } = useQuery({
    queryKey: [
      'articles',
      {
        page,
        pageSize,
        tags: selectedTags.slice().sort(),
        difficulty: difficultyFilter,
        sort: sortOption,
      },
    ],
    queryFn: () =>
      getAllArticles({
        start: (page - 1) * pageSize,
        limit: pageSize,
        tags: selectedTags.length ? selectedTags : undefined,
        difficulty: difficultyFilter,
        sort: sortOption,
      }),
  })

  const { data: trendingArticles = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-articles', user?.id],
    queryFn: () => getTrendingArticles(user?.id, 5),
  })

  const trendingSummary = useMemo(() => {
    if (!trendingArticles.length) return 'No data yet'
    return trendingArticles
      .slice(0, 3)
      .map((article) => article.title)
      .join(' • ')
  }, [trendingArticles])

  const articles = articlesData?.data || []
  const totalRecords = articlesData?.total || 0
  const rawTotalPages = Math.ceil(totalRecords / pageSize)
  const totalPages = Math.max(1, rawTotalPages || 1)
  const hasMultiplePages = totalRecords > pageSize

  useEffect(() => {
    if (totalRecords === 0 && page !== 1) {
      setPage(1)
    } else if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages, totalRecords])

  useEffect(() => {
    const storedValue = typeof window !== 'undefined' ? localStorage.getItem('home-spotlight-dismissed') : null
    if (storedValue === 'true') {
      setIsSpotlightDismissed(true)
    }
  }, [])

  const paginationPages = useMemo(() => {
    const pages: Array<number | 'ellipsis'> = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      if (start > 2) {
        pages.push('ellipsis')
      }
      for (let i = start; i <= end; i += 1) {
        pages.push(i)
      }
      if (end < totalPages - 1) {
        pages.push('ellipsis')
      }
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  // Handlers
  const handleSearch = useCallback(() => {
    console.log('Search:', searchQuery)
  }, [searchQuery])

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setDifficultyFilter('all')
    setSortOption('newest')
    setPage(1)
  }

  // Close view mode expander when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isViewModeExpanded && !target.closest('[data-view-mode-expander]')) {
        setIsViewModeExpanded(false)
      }
    }

    if (isViewModeExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isViewModeExpanded])

  const handleDismissSpotlight = () => {
    setIsSpotlightDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('home-spotlight-dismissed', 'true')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-6 pt-6">
        {!isSpotlightDismissed && (
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/15 p-6 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            onClick={handleDismissSpotlight}
            aria-label="Dismiss spotlight"
          >
            <X className="h-3.5 w-3.5" />
            </Button>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-6 lg:max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Forum spotlight
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Join the conversation shaping modern publishing.
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Two threads worth your time today—jump in, trade notes, or save for later.
                </p>
              </div>

              <div className="grid gap-4">
                {forumSpotlights.slice(0, 2).map((spotlight) => (
                  <button
                    key={spotlight.id}
                    type="button"
                    className="flex flex-col gap-2 rounded-2xl border border-transparent bg-background/70 px-4 py-4 text-left transition hover:border-border hover:bg-muted/30"
                    onClick={() => navigate(`/article/${spotlight.id}`)}
                        >
                    <span className="text-sm font-semibold text-foreground leading-tight">{spotlight.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{spotlight.summary}</span>
                    <span className="text-xs text-muted-foreground">{spotlight.author} · {spotlight.reads.toLocaleString()} reads</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Quick destinations</p>
              {quickDestinations.map((destination) => (
                <button
                  key={destination.label}
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left transition hover:border-border hover:bg-muted/40"
                  onClick={destination.action}
                >
                  <destination.icon className="h-5 w-5 text-primary" />
                  <span className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold text-foreground">{destination.label}</span>
                    <span className="text-xs text-muted-foreground">{destination.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        )}

        <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative" data-view-mode-expander style={{ height: '40px', width: '40px' }}>
                    <div
                      className={cn(
                        'absolute top-0 left-0 flex flex-col rounded-lg border border-border bg-background transition-all duration-200',
                        isViewModeExpanded && 'z-50 shadow-lg'
                      )}
                      style={{
                        height: isViewModeExpanded ? `${40 + (viewModeOptions.filter((o) => o.id !== viewMode).length * 40)}px` : '40px',
                        width: '40px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsViewModeExpanded(!isViewModeExpanded)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' && isViewModeExpanded) {
                            setIsViewModeExpanded(false)
                            e.currentTarget.focus()
                          } else if (e.key === 'ArrowDown' && !isViewModeExpanded) {
                            e.preventDefault()
                            setIsViewModeExpanded(true)
                          }
                        }}
                        aria-label="Select view mode"
                        aria-expanded={isViewModeExpanded}
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:z-10',
                          isViewModeExpanded ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
                        )}
                      >
                        {(() => {
                          const currentOption = viewModeOptions.find((option) => option.id === viewMode)
                          const Icon = currentOption?.icon
                          return Icon ? <Icon className="h-4 w-4" /> : null
                        })()}
                      </button>
                      <div
                        className={cn(
                          'flex flex-col transition-all duration-200',
                          isViewModeExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}
                      >
                        {viewModeOptions
                          .filter((option) => option.id !== viewMode)
                          .map((option, index) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.id}
                                type="button"
                                tabIndex={isViewModeExpanded ? 0 : -1}
                                className="flex h-10 w-10 shrink-0 items-center justify-center transition-colors hover:bg-muted last:rounded-b-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:z-10"
                                onClick={() => {
                                  setViewMode(option.id)
                                  setIsViewModeExpanded(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setIsViewModeExpanded(false)
                                    const mainButton = e.currentTarget.parentElement?.parentElement?.querySelector('button[aria-expanded]') as HTMLButtonElement
                                    mainButton?.focus()
                                  } else if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    const nextButton = e.currentTarget.parentElement?.children[index + 1] as HTMLButtonElement
                                    nextButton?.focus()
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    if (index === 0) {
                                      const mainButton = e.currentTarget.parentElement?.parentElement?.querySelector('button[aria-expanded]') as HTMLButtonElement
                                      mainButton?.focus()
                                    } else {
                                      const prevButton = e.currentTarget.parentElement?.children[index - 1] as HTMLButtonElement
                                      prevButton?.focus()
                                    }
                                  }
                                }}
                                aria-label={option.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-xs"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs">
                    Clear all
                  </Button>
                </div>
              )}
              {difficultyFilter !== 'all' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="outline" className="capitalize">
                    {difficultyFilter}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setDifficultyFilter('all')} className="h-7 px-2 text-xs">
                    reset
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : articles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium">No articles found</p>
                  <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'square' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
                  {articles.map((article) => {
                    if (viewMode === 'line') {
                      return (
                        <ArticleCardLine
                          key={article.id}
                          article={article}
                          onTagClick={handleTagClick}
                          onArticleClick={(id) => navigate(`/article/${id}`)}
                        />
                      )
                    }
                    if (viewMode === 'square') {
                      return (
                        <ArticleCardSquare
                          key={article.id}
                          article={article}
                          onTagClick={handleTagClick}
                          onArticleClick={(id) => navigate(`/article/${id}`)}
                        />
                      )
                    }
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onTagClick={handleTagClick}
                        onArticleClick={(id) => navigate(`/article/${id}`)}
                      />
                    )
                  })}
                </div>

                {hasMultiplePages && (
                  <Pagination className="pt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          aria-disabled={page === 1}
                          className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                          onClick={(event) => {
                            event.preventDefault()
                            if (page > 1) {
                              setPage((prev) => Math.max(1, prev - 1))
                            }
                          }}
                        >
                          Prev
                        </PaginationPrevious>
                      </PaginationItem>
                      {paginationPages.map((item, idx) =>
                        item === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${idx}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href="#"
                              isActive={page === item}
                              onClick={(event) => {
                                event.preventDefault()
                                setPage(item)
                              }}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          aria-disabled={page === totalPages}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
                          onClick={(event) => {
                            event.preventDefault()
                            if (page < totalPages) {
                              setPage((prev) => Math.min(totalPages, prev + 1))
                            }
                          }}
                        >
                          Next
                        </PaginationNext>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader className="flex items-start justify-between">
                <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Flame className="h-5 w-5 text-primary" />
                    Trending now
                </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Quick hits from the guild—updated every few hours.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => navigate('/trending')}
                >
                  View leaderboard
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingTrending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : trendingArticles.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-muted/20 py-6 text-center text-xs text-muted-foreground">
                    Nothing trending yet.
                  </div>
                ) : (
                  trendingArticles.map((article, index) => (
                    <button
                      key={article.id}
                      type="button"
                      className="w-full rounded-xl border border-border/40 bg-background/70 px-3 py-3 text-left transition hover:border-primary/50 hover:bg-muted/40"
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          #{index + 1}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-foreground line-clamp-2">{article.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{article.author.username}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{article.views?.toLocaleString?.() ?? '—'} views</span>
                        <span>•</span>
                        <span>{article.reactions ?? '—'} reactions</span>
                    </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Hash className="h-4 w-4" />
                  Popular Tags
                </CardTitle>
                <CardDescription className="text-xs">Select a tag to filter your feed.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => {
                    const isActive = selectedTags.includes(tag)

                    return (
                    <Badge
                      key={tag}
                        variant="secondary"
                        className={cn(
                          'cursor-pointer rounded-md text-xs transition-colors bg-primary/10 text-primary',
                          isActive ? 'shadow-sm bg-primary/15' : 'hover:bg-primary/15'
                        )}
                      onClick={() => handleTagClick(tag)}
                        aria-pressed={isActive}
                    >
                      {tag}
                    </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <FiltersDrawer
        open={showFilters}
        onOpenChange={setShowFilters}
        selectedTags={selectedTags}
        difficulty={difficultyFilter}
        sortOption={sortOption}
        allTags={popularTags}
        onApply={({ tags, difficulty, sort }) => {
          setSelectedTags(tags)
          setDifficultyFilter(difficulty)
          setSortOption(sort)
          setPage(1)
        }}
        onClear={handleClearFilters}
      />
    </div>
  )
}

function StatTile({
  label,
  value,
  description,
  compact,
}: {
  label: string
  value: string | number
  description?: string
  compact?: boolean
}) {
  const displayValue =
    typeof value === 'number' && !Number.isNaN(value) ? value.toLocaleString() : value || '—'

  return (
    <Card className="h-full border-border/60 bg-background shadow-sm">
      <CardHeader className="space-y-1">
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle className={cn('truncate text-2xl font-semibold', compact && 'text-base font-medium')}>
          {displayValue}
        </CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="pt-0 text-xs text-muted-foreground">{description}</CardContent>
      )}
    </Card>
  )
}

interface FiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTags: string[]
  difficulty: ArticleDifficulty | 'all'
  sortOption: ArticleSortOption
  allTags: string[]
  onApply: (filters: { tags: string[]; difficulty: ArticleDifficulty | 'all'; sort: ArticleSortOption }) => void
  onClear: () => void
}

function FiltersDrawer({
  open,
  onOpenChange,
  selectedTags,
  difficulty,
  sortOption,
  allTags,
  onApply,
  onClear,
}: FiltersDrawerProps) {
  const [localTags, setLocalTags] = useState<string[]>(selectedTags)
  const [localDifficulty, setLocalDifficulty] = useState<ArticleDifficulty | 'all'>(difficulty)
  const [localSort, setLocalSort] = useState<ArticleSortOption>(sortOption)
  const [tagInput, setTagInput] = useState('')

  const resetLocalState = useCallback(() => {
    setLocalTags(selectedTags)
    setLocalDifficulty(difficulty)
    setLocalSort(sortOption)
    setTagInput('')
  }, [selectedTags, difficulty, sortOption])

  useEffect(() => {
    if (open) {
      resetLocalState()
    }
  }, [open, resetLocalState])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetLocalState()
    }
    onOpenChange(nextOpen)
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (!localTags.includes(value)) {
      setLocalTags([...localTags, value])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setLocalTags(localTags.filter((item) => item !== tag))
  }

  const handleApply = () => {
    onApply({
      tags: localTags,
      difficulty: localDifficulty,
      sort: localSort,
    })
    onOpenChange(false)
  }

  const handleClearAll = () => {
    setLocalTags([])
    setLocalDifficulty('all')
    setLocalSort('newest')
    onClear()
    onOpenChange(false)
  }

  const difficultyOptions: Array<{ label: string; value: ArticleDifficulty | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Beginner', value: 'easy' },
    { label: 'Intermediate', value: 'medium' },
    { label: 'Advanced', value: 'hard' },
  ]

  const sortOptions: Array<{ label: string; value: ArticleSortOption; description: string }> = [
    { label: 'Newest first', value: 'newest', description: 'Latest publications appear first' },
    { label: 'Oldest first', value: 'oldest', description: 'Chronological order from oldest to newest' },
    { label: 'Most popular', value: 'popular', description: 'Articles with most reactions first' },
  ]

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full max-w-lg space-y-6">
        <SheetHeader className="items-start text-left">
          <SheetTitle>Refine results</SheetTitle>
          <SheetDescription>
            Narrow down the article feed by difficulty, popularity, or topic tags. Updated results will load
            instantly.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Difficulty</Label>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={localDifficulty === option.value ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setLocalDifficulty(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sort by</Label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLocalSort(option.value)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    localSort === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add custom tag"
              />
              <Button variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {localTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {localTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags selected yet.</p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick pick</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={localTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setLocalTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        </div>

        <SheetFooter className="space-x-0 sm:space-x-0 sm:space-y-0">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="sm:flex-1" onClick={handleClearAll}>
              Reset filters
            </Button>
            <Button className="sm:flex-1" onClick={handleApply}>
              Apply filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
