import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Flame, LayoutGrid, List, Rows, PenSquare, Bell, Hash } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getAllArticles, getTrendingArticles, type ArticleSortOption, type ArticleDifficulty } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { useNotificationsStore, selectUnreadCount } from '@/stores/notificationsStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/ArticleCard'
import { ArticleCardLine } from '@/components/ArticleCardLine'
import { ArticleCardSquare } from '@/components/ArticleCardSquare'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()
  const unreadNotifications = useNotificationsStore(selectUnreadCount)
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
  const currentViewOption = viewModeOptions.find((option) => option.id === viewMode) ?? viewModeOptions[0]
  const CurrentViewIcon = currentViewOption.icon
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<ArticleDifficulty | 'all'>('all')
  const [sortOption, setSortOption] = useState<ArticleSortOption>('newest')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const popularTags = ['React', 'TypeScript', 'Next.js', 'Tailwind', 'shadcn/ui']

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Aetheris</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notifications')}
              aria-label={
                unreadNotifications > 0
                  ? `Open notifications, ${unreadNotifications} unread`
                  : 'Open notifications'
              }
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute right-1 top-1 inline-flex h-2 w-2">
                  <span className="h-full w-full rounded-full bg-destructive" />
                </span>
              )}
            </Button>
            {user && (
              <Button
                size="sm"
                onClick={() => navigate('/create')}
                className="gap-2"
              >
                <PenSquare className="h-4 w-4" />
                Write
              </Button>
            )}

            {/* View Mode Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Toggle article view"
                >
                  <CurrentViewIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-9 min-w-0 overflow-hidden rounded-lg border border-border/80 bg-background p-0"
              >
                <div className="flex flex-col">
                  {viewModeOptions
                    .filter((option) => option.id !== viewMode)
                    .map((option) => {
                      const Icon = option.icon

                      return (
                        <DropdownMenuItem
                          key={option.id}
                          onSelect={() => setViewMode(option.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-none p-0 px-0 data-[highlighted]:bg-muted/50"
                          aria-label={option.label}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">{option.label}</span>
                        </DropdownMenuItem>
                      )
                    })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

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

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-7 text-xs"
                  >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDifficultyFilter('all')}
                    className="h-7 px-2 text-xs"
                  >
                    reset
                  </Button>
                </div>
              )}
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : articles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium">No articles found</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'square'
                      ? 'grid gap-4 sm:grid-cols-2'
                      : 'space-y-4'
                  }
                >
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

                {/* Pagination */}
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

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingTrending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : trendingArticles.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No trending articles
                  </p>
                ) : (
                  trendingArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="group cursor-pointer space-y-1 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/50"
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl font-bold text-muted-foreground/30">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {article.author.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Popular Tags */}
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
                        variant={isActive ? 'default' : 'secondary'}
                        className={cn(
                          'cursor-pointer rounded-md font-normal transition-colors',
                          isActive ? 'shadow-sm' : 'hover:bg-secondary/80'
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
        </div>
      </div>
    </div>
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
