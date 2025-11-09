import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Flame, LayoutGrid, List, Rows, PenSquare } from 'lucide-react'
import { getAllArticles, getTrendingArticles } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { ArticleCard } from '@/components/ArticleCard'
import { ArticleCardLine } from '@/components/ArticleCardLine'
import { ArticleCardSquare } from '@/components/ArticleCardSquare'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()
  const { toast } = useToast()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Queries
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', page, pageSize],
    queryFn: () => getAllArticles(user?.id, (page - 1) * pageSize, pageSize),
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
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
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

            {!user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

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
                  {['React', 'TypeScript', 'Next.js', 'Tailwind', 'shadcn/ui'].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
