import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Flame, LayoutGrid, List, Rows, PenSquare } from 'lucide-react'
import { getAllArticles, getTrendingArticles, type ArticleSortOption, type ArticleDifficulty } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()
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
  const totalPages = Math.ceil(totalRecords / pageSize)

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

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Button
                variant={viewMode === 'default' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('default')}
                className="h-8 w-8 p-0"
              >
                <Rows className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('line')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'square' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('square')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

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
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="h-9 w-9 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
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
