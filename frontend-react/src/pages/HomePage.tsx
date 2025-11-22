import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
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
import { getArticles, getTrendingArticles, searchArticles, getArticle, type ArticleSortOption, type ArticleDifficulty } from '@/api/articles-graphql'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()

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
  const viewModeOptions: Array<{
    id: 'default' | 'line' | 'square'
    label: string
    icon: LucideIcon
  }> = [
    {
      id: 'default',
      label: t('home.viewModes.standardCards'),
      icon: Rows,
    },
    {
      id: 'line',
      label: t('home.viewModes.compactList'),
      icon: List,
    },
    {
      id: 'square',
      label: t('home.viewModes.gridView'),
      icon: LayoutGrid,
    },
  ]
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isViewModeExpanded, setIsViewModeExpanded] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<ArticleDifficulty | 'all'>('all')
  const [sortOption, setSortOption] = useState<ArticleSortOption>('newest')
  const [page, setPage] = useState(1)
  const pageRef = useRef(page)
  const [isSpotlightDismissed, setIsSpotlightDismissed] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Синхронизируем ref с состоянием
  useEffect(() => {
    pageRef.current = page
  }, [page])
  const pageSize = 10
  const popularTags = ['React', 'TypeScript', 'Next.js', 'Tailwind', 'shadcn/ui']
  const quickDestinations = useMemo(
    () => [
      {
        label: t('home.quickDestinations.networking'),
        description: t('home.quickDestinations.networkingDescription'),
        icon: Compass,
        action: () => navigate('/networking'),
      },
      {
        label: t('home.quickDestinations.courses'),
        description: t('home.quickDestinations.coursesDescription'),
        icon: GraduationCap,
        action: () => navigate('/courses'),
      },
      {
        label: t('home.quickDestinations.developers'),
        description: t('home.quickDestinations.developersDescription'),
        icon: Terminal,
        action: () => navigate('/developers'),
      },
    ],
    [navigate, t]
  )
  const openNetworking = useMemo(
    () => networkingOpportunities.filter((item) => item.status === 'open').length,
    []
  )
  const upcomingCourses = useMemo(() => featuredCourses.length, [])

  // Queries с оптимизированными настройками для высокой нагрузки
  const { data: articlesData, isLoading, error: articlesError } = useQuery({
    queryKey: [
      'articles',
        page,
        pageSize,
      selectedTags.slice().sort().join(','),
      difficultyFilter,
      sortOption,
      debouncedSearchQuery,
    ],
    queryFn: () =>
      getArticles({
        page,
        pageSize,
        tags: selectedTags.length ? selectedTags : undefined,
        difficulty: difficultyFilter,
        sort: sortOption,
        search: debouncedSearchQuery.length >= 2 ? debouncedSearchQuery : undefined,
      }),
    // Кэшируем на 5 минут (данные статей не меняются часто)
    staleTime: 5 * 60 * 1000,
    // Храним в кэше 30 минут
    gcTime: 30 * 60 * 1000,
    // Retry только на сетевые ошибки
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    },
  })

  const { data: trendingArticles = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-articles', user?.id],
    queryFn: () => getTrendingArticles(user?.id ? String(user.id) : undefined, 5),
    // Трендовые статьи кэшируем дольше (10 минут)
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedSearchQuery(searchQuery.trim())
      } else {
        setDebouncedSearchQuery('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['search-articles', debouncedSearchQuery, user?.id],
    queryFn: () => searchArticles(debouncedSearchQuery, user?.id ? String(user.id) : undefined, 0, 10),
    enabled: debouncedSearchQuery.length >= 2,
    // Поиск кэшируем на 2 минуты (результаты могут меняться)
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Retry только на сетевые ошибки
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },
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
  
  // Логирование для отладки (только в development)
  useEffect(() => {
    logger.debug('[HomePage] Articles state:', {
      isLoading,
      hasError: !!articlesError,
      articlesCount: articles.length,
      totalRecords,
      articlesData,
    })
  }, [isLoading, articlesError, articles.length, totalRecords, articlesData])
  const rawTotalPages = Math.ceil(totalRecords / pageSize)
  const totalPages = Math.max(1, rawTotalPages || 1)
  const hasMultiplePages = totalRecords > pageSize

  useEffect(() => {
    // Не сбрасываем страницу во время загрузки или если данные еще не загружены
    if (isLoading) {
      return
    }
    // Сбрасываем только если данных действительно нет (не из-за загрузки)
    if (totalRecords === 0 && page !== 1 && !isLoading) {
      setPage(1)
    } else if (page > totalPages && totalPages > 0) {
      setPage(totalPages)
    }
  }, [page, totalPages, totalRecords, isLoading])

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

  // Show search results panel when focused and has query
  useEffect(() => {
    if (searchInputFocused && searchQuery.trim().length > 0) {
      setShowSearchResults(true)
    } else if (!searchInputFocused) {
      // Delay hiding to allow click on results
      const timer = setTimeout(() => {
        setShowSearchResults(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [searchInputFocused, searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Игнорируем клики на пагинацию и кнопки
      if (
        target.closest('nav[aria-label="pagination"]') ||
        target.closest('button') ||
        target.tagName === 'BUTTON'
      ) {
        return
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchResults(false)
        setSearchInputFocused(false)
      }
    }

    if (showSearchResults) {
      // Используем capture: false чтобы обработчик срабатывал после обработчиков на кнопках
      document.addEventListener('mousedown', handleClickOutside, { capture: false })
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSearchResults])

  // Handlers
  const handleSearch = useCallback(() => {
    // При нажатии Enter применяем поиск к основному списку статей
    // Поиск уже применяется через debouncedSearchQuery в queryKey
    // Просто сбрасываем страницу на первую
    setPage(1)
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchInputFocus = () => {
    setSearchInputFocused(true)
  }

  // Prefetch article при наведении на карточку (для быстрой загрузки)
  const handleArticleMouseEnter = useCallback((articleId: string) => {
    // Prefetch только если статья еще не в кэше
    queryClient.prefetchQuery({
      queryKey: ['article', articleId],
      queryFn: () => getArticle(articleId, { userId: user?.id }),
      staleTime: 10 * 60 * 1000, // 10 минут
    })
  }, [queryClient, user?.id])

  const handleSearchResultClick = (articleId: string) => {
    setShowSearchResults(false)
    setSearchInputFocused(false)
    navigate(`/article/${articleId}`)
  }
  
  const handleArticleClick = useCallback((articleId: string) => {
    navigate(`/article/${articleId}`)
  }, [navigate])

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
      // Игнорируем клики на пагинацию и кнопки
      if (
        target.closest('nav[aria-label="pagination"]') ||
        target.closest('button') ||
        target.tagName === 'BUTTON'
      ) {
        return
      }
      if (isViewModeExpanded && !target.closest('[data-view-mode-expander]')) {
        setIsViewModeExpanded(false)
      }
    }

    if (isViewModeExpanded) {
      // Используем capture: false чтобы обработчик срабатывал после обработчиков на кнопках
      document.addEventListener('mousedown', handleClickOutside, { capture: false })
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

      <main className="container space-y-6 sm:space-y-8 lg:space-y-10 pb-4 sm:pb-6 pt-4 sm:pt-6 px-4 sm:px-6">
        {/* HERO BLOCK DISABLED - Чтобы включить обратно, раскомментируйте код ниже и удалите этот комментарий */}
        {/* 
        {!isSpotlightDismissed && (
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-muted/15 p-6 sm:p-6 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 sm:h-8 sm:w-8 rounded-full text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            onClick={handleDismissSpotlight}
            aria-label={t('home.spotlight.dismiss')}
          >
            <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
          <div className="flex flex-col gap-6 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-6 sm:space-y-6 lg:max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background px-3 sm:px-3 py-1 text-xs sm:text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="h-3 w-3 sm:h-3 sm:w-3" />
                {t('home.spotlight.title')}
              </div>
              <div className="space-y-3 sm:space-y-3">
                <h1 className="text-3xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {t('home.spotlight.heading')}
                </h1>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  {t('home.spotlight.description')}
                </p>
              </div>

              <div className="grid gap-4 sm:gap-4">
                {forumSpotlights.slice(0, 2).map((spotlight) => (
                  <button
                    key={spotlight.id}
                    type="button"
                    className="flex flex-col gap-2 rounded-2xl sm:rounded-2xl border border-transparent bg-background/70 px-4 sm:px-4 py-4 sm:py-4 text-left transition hover:border-border hover:bg-muted/30"
                    onClick={() => navigate(`/article/${spotlight.id}`)}
                        >
                    <span className="text-sm sm:text-sm font-semibold text-foreground leading-tight">{spotlight.title}</span>
                    <span className="text-xs sm:text-xs text-muted-foreground line-clamp-2">{spotlight.summary}</span>
                    <span className="text-xs sm:text-xs text-muted-foreground">{spotlight.author} · {spotlight.reads.toLocaleString()} reads</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full lg:max-w-xs flex-col gap-3 sm:gap-3 rounded-2xl sm:rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-4 shadow-sm">
              <p className="text-xs sm:text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{t('home.quickDestinations.title')}</p>
              {quickDestinations.map((destination) => (
                <button
                  key={destination.label}
                  type="button"
                  className="flex items-center gap-3 sm:gap-3 rounded-xl sm:rounded-xl border border-transparent px-4 sm:px-4 py-3 sm:py-3 text-left transition hover:border-border hover:bg-muted/40"
                  onClick={destination.action}
                >
                  <destination.icon className="h-5 w-5 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="flex flex-col items-start gap-1 sm:gap-1 min-w-0">
                    <span className="text-sm sm:text-sm font-semibold text-foreground truncate w-full">{destination.label}</span>
                    <span className="text-xs sm:text-xs text-muted-foreground line-clamp-1">{destination.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        )}
        */}

        <section className="flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 w-full max-w-full">
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1 min-w-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0" ref={searchContainerRef}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder={t('home.search.placeholder')}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearch()
                        setShowSearchResults(false)
                        setSearchInputFocused(false)
                        // Фокус убирается автоматически при закрытии результатов
                      } else if (e.key === 'Escape') {
                        setShowSearchResults(false)
                        setSearchInputFocused(false)
                        setSearchQuery('')
                      }
                    }}
                    className="pl-10 sm:pl-9 h-10 text-sm"
                  />
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
                      ) : debouncedSearchQuery.length < 2 && searchQuery.trim().length > 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          {t('home.search.typeToSearch')}
                        </div>
                      ) : searchResults.length === 0 && debouncedSearchQuery.length >= 2 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          {t('home.search.noResults', { query: debouncedSearchQuery })}
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                            {t('home.search.results')}
                          </div>
                          {searchResults.map((article) => (
                            <button
                              key={article.id}
                              type="button"
                              onClick={() => handleSearchResultClick(article.id)}
                              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                {article.previewImage && (
                                  <img
                                    src={article.previewImage}
                                    alt={article.title}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-sm sm:text-base font-semibold text-foreground break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {article.title}
                                  </p>
                                  {article.excerpt && (
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                      {article.excerpt}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{article.author.username}</span>
                                    {article.tags.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{article.tags.slice(0, 2).join(', ')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          {searchResults.length >= 10 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSearch()
                                setShowSearchResults(false)
                                setSearchInputFocused(false)
                              }}
                              className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-muted/50 transition-colors border-t border-border"
                            >
                              {t('home.search.viewAll', { query: debouncedSearchQuery })}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="relative shrink-0" data-view-mode-expander>
                    {/* Единый контейнер кнопки и меню */}
                    <div
                      className={cn(
                        'flex flex-col bg-background border border-border rounded-md overflow-hidden transition-all duration-300 ease-in-out z-40',
                        isViewModeExpanded && 'shadow-lg'
                      )}
                      style={{
                        width: '40px',
                        height: isViewModeExpanded 
                          ? `${40 + (viewModeOptions.filter((o) => o.id !== viewMode).length * 40)}px` 
                          : '40px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    >
                      {/* Активная кнопка (всегда видима) */}
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setIsViewModeExpanded(!isViewModeExpanded)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' && isViewModeExpanded) {
                            setIsViewModeExpanded(false)
                            e.currentTarget.focus()
                          } else if (e.key === 'ArrowDown' && !isViewModeExpanded) {
                            e.preventDefault()
                            setIsViewModeExpanded(true)
                            // Фокусируемся на первом элементе меню
                            setTimeout(() => {
                              const firstButton = e.currentTarget.parentElement?.querySelector('div[class*="flex flex-col"] button') as HTMLButtonElement
                              firstButton?.focus()
                            }, 0)
                          } else if (e.key === 'Tab' && isViewModeExpanded) {
                            // При Tab закрываем меню и продолжаем навигацию
                            setIsViewModeExpanded(false)
                          }
                        }}
                        aria-label={t('home.viewModes.selectViewMode')}
                        aria-expanded={isViewModeExpanded}
                        className={cn(
                          'h-10 w-10 shrink-0 border-0 rounded-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          isViewModeExpanded && 'border-b border-border/50'
                        )}
                      >
                        {(() => {
                          const currentOption = viewModeOptions.find((option) => option.id === viewMode)
                          const Icon = currentOption?.icon
                          return Icon ? <Icon className="h-4 w-4" /> : null
                        })()}
                      </Button>
                      
                      {/* Остальные варианты (растягиваются вниз) */}
                      <div
                        className={cn(
                          'flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
                          isViewModeExpanded
                            ? 'opacity-100' 
                            : 'opacity-0 pointer-events-none'
                        )}
                      >
                        {viewModeOptions
                          .filter((option) => option.id !== viewMode)
                          .map((option, index) => {
                            const Icon = option.icon
                            const isLast = index === viewModeOptions.filter((o) => o.id !== viewMode).length - 1
                            return (
                              <Button
                                key={option.id}
                                variant="outline"
                                size="icon"
                                type="button"
                                tabIndex={isViewModeExpanded ? 0 : -1}
                                className={cn(
                                  'h-10 w-10 shrink-0 border-0 rounded-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                  !isLast && 'border-b border-border/50'
                                )}
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
                                    if (nextButton) {
                                      nextButton.focus()
                                    } else {
                                      // Если последний элемент, возвращаемся к главной кнопке
                                      const mainButton = e.currentTarget.parentElement?.parentElement?.querySelector('button[aria-expanded]') as HTMLButtonElement
                                      mainButton?.focus()
                                    }
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    if (index === 0) {
                                      const mainButton = e.currentTarget.parentElement?.parentElement?.querySelector('button[aria-expanded]') as HTMLButtonElement
                                      mainButton?.focus()
                                    } else {
                                      const prevButton = e.currentTarget.parentElement?.children[index - 1] as HTMLButtonElement
                                      prevButton?.focus()
                                    }
                                  } else if (e.key === 'Tab' && !e.shiftKey) {
                                    // При Tab закрываем меню и продолжаем навигацию
                                    setIsViewModeExpanded(false)
                                  }
                                }}
                                aria-label={option.label}
                              >
                                <Icon className="h-4 w-4" />
                              </Button>
                            )
                          })}
                      </div>
                    </div>
                    {/* Невидимый placeholder для сохранения места в layout */}
                    <div className="w-10 h-10" aria-hidden="true" />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="h-10 w-10 shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap items-start gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('home.filters.label')}</span>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-xs sm:text-xs break-words overflow-wrap-anywhere"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs px-2 sm:px-3">
                    {t('home.filters.clearAll')}
                  </Button>
                </div>
              )}
              {difficultyFilter !== 'all' && (
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="text-muted-foreground">{t('home.filters.difficulty')}</span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {difficultyFilter === 'all' 
                      ? t('home.filtersDrawer.all')
                      : t(`home.filtersDrawer.${getDifficultyKey(difficultyFilter)}`)}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setDifficultyFilter('all')} className="h-7 px-2 sm:px-3 text-xs">
                    {t('home.filters.reset')}
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className={viewMode === 'square' ? 'grid gap-4 sm:gap-4 sm:grid-cols-2' : 'space-y-4 sm:space-y-4'}>
                {Array.from({ length: pageSize }).map((_, i) => {
                  if (viewMode === 'line') {
                    return <ArticleCardLineSkeleton key={i} />
                  }
                  if (viewMode === 'square') {
                    return <ArticleCardSquareSkeleton key={i} />
                  }
                  return <ArticleCardSkeleton key={i} />
                })}
              </div>
            ) : articlesError ? (
              <Card className="border-dashed border-destructive/50">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-12 text-center px-4">
                  <p className="text-lg sm:text-lg font-medium text-destructive">{t('home.articles.error')}</p>
                  <p className="mt-2 text-sm sm:text-sm text-muted-foreground">
                    {articlesError?.response?.status === 429 
                      ? t('home.articles.rateLimitError')
                      : t('home.articles.errorDescription')}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['articles'] })
                    }} 
                    className="mt-4 h-10 sm:h-10 text-sm sm:text-sm"
                  >
                    {t('home.articles.retry')}
                  </Button>
                </CardContent>
              </Card>
            ) : articles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-12 text-center px-4">
                  <p className="text-lg sm:text-lg font-medium">{t('home.articles.notFound')}</p>
                  <p className="mt-2 text-sm sm:text-sm text-muted-foreground">{t('home.articles.notFoundDescription')}</p>
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4 h-10 sm:h-10 text-sm sm:text-sm">
                    {t('home.articles.clearFilters')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'square' ? 'grid gap-4 sm:gap-4 sm:grid-cols-2' : 'space-y-4 sm:space-y-4'}>
                  {articles.map((article) => {
                    if (viewMode === 'line') {
                      return (
                        <ArticleCardLine
                          key={article.id}
                          article={article}
                          onTagClick={handleTagClick}
                          onArticleClick={handleArticleClick}
                          onMouseEnter={() => handleArticleMouseEnter(article.id)}
                        />
                      )
                    }
                    if (viewMode === 'square') {
                      return (
                        <ArticleCardSquare
                          key={article.id}
                          article={article}
                          onTagClick={handleTagClick}
                          onArticleClick={handleArticleClick}
                          onMouseEnter={() => handleArticleMouseEnter(article.id)}
                        />
                      )
                    }
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onTagClick={handleTagClick}
                        onArticleClick={handleArticleClick}
                        onMouseEnter={() => handleArticleMouseEnter(article.id)}
                      />
                    )
                  })}
                </div>

                {hasMultiplePages && (
                  <div className="pt-6 sm:pt-6" onClick={(e) => e.stopPropagation()}>
                    <Pagination>
                      <PaginationContent className="flex-wrap gap-2 sm:gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const newPage = Math.max(1, page - 1)
                              setPage(newPage)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                            }}
                            disabled={page === 1}
                          />
                      </PaginationItem>
                      {paginationPages.map((item, idx) =>
                        item === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${idx}`} className="hidden sm:flex">
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              isActive={page === item}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const pageNum = item as number
                                  if (pageNum !== page) {
                                    setPage(pageNum)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                              }}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const newPage = Math.min(totalPages, page + 1)
                              setPage(newPage)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                            }}
                            disabled={page === totalPages}
                          />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-4 sm:space-y-6 order-1 lg:order-2 min-w-0 max-w-full">
            <Card>
              <CardHeader className="space-y-3 pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {t('home.trending.title')}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs h-8 sm:h-8"
                  onClick={() => navigate('/trending')}
                >
                  {t('home.trending.viewLeaderboard')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                {loadingTrending ? (
                  <div className="space-y-3 sm:space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TrendingArticleSkeleton key={i} />
                    ))}
                  </div>
                ) : trendingArticles.length === 0 ? (
                  <div className="rounded-xl sm:rounded-xl border border-dashed bg-muted/20 py-6 sm:py-6 text-center text-xs sm:text-xs text-muted-foreground">
                    {t('home.trending.nothingYet')}
                  </div>
                ) : (
                  trendingArticles.map((article, index) => (
                    <button
                      key={article.id}
                      type="button"
                      className="w-full rounded-lg sm:rounded-xl border border-border/40 bg-background/70 px-2.5 sm:px-3 py-2.5 sm:py-3 text-left transition hover:border-primary/50 hover:bg-muted/40"
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-xs sm:text-sm font-semibold text-primary shrink-0">
                          #{index + 1}
                        </span>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground break-words overflow-wrap-anywhere leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{article.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{article.author.username}</p>
                        </div>
                      </div>
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                        <span>{article.views?.toLocaleString?.() ?? '—'} {t('home.trending.views')}</span>
                        <span>•</span>
                        <span>{(article.likes || 0) + (article.dislikes || 0)} {t('home.trending.reactions')}</span>
                    </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="space-y-1 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('home.tags.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('home.tags.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap items-start gap-1.5 sm:gap-2">
                  {popularTags.map((tag) => {
                    const isActive = selectedTags.includes(tag)

                    return (
                    <Badge
                      key={tag}
                        variant="secondary"
                        className={cn(
                          'cursor-pointer rounded-md text-[10px] sm:text-xs transition-colors bg-primary/10 text-primary break-words overflow-wrap-anywhere px-2 py-0.5',
                          isActive ? 'shadow-sm bg-primary/15' : 'hover:bg-primary/15'
                        )}
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
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
  const { t } = useTranslation()
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
    { label: t('home.filtersDrawer.all'), value: 'all' },
    { label: t('home.filtersDrawer.beginner'), value: 'beginner' },
    { label: t('home.filtersDrawer.intermediate'), value: 'intermediate' },
    { label: t('home.filtersDrawer.advanced'), value: 'advanced' },
  ]

  const sortOptions: Array<{ label: string; value: ArticleSortOption; description: string }> = [
    { label: t('home.filtersDrawer.newestFirst'), value: 'newest', description: t('home.filtersDrawer.newestFirstDescription') },
    { label: t('home.filtersDrawer.oldestFirst'), value: 'oldest', description: t('home.filtersDrawer.oldestFirstDescription') },
    { label: t('home.filtersDrawer.mostPopular'), value: 'popular', description: t('home.filtersDrawer.mostPopularDescription') },
  ]

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full max-w-lg space-y-6 sm:space-y-6 overflow-y-auto">
        <SheetHeader className="items-start text-left">
          <SheetTitle className="text-xl sm:text-xl">{t('home.filtersDrawer.title')}</SheetTitle>
          <SheetDescription className="text-sm sm:text-sm">
            {t('home.filtersDrawer.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 sm:space-y-6">
          <section className="space-y-3 sm:space-y-3">
            <Label className="text-xs sm:text-xs uppercase tracking-wide text-muted-foreground">{t('home.filtersDrawer.difficulty')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={localDifficulty === option.value ? 'default' : 'outline'}
                  className="justify-start text-sm sm:text-sm h-10 sm:h-10"
                  onClick={() => setLocalDifficulty(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3 sm:space-y-3">
            <Label className="text-xs sm:text-xs uppercase tracking-wide text-muted-foreground">{t('home.filtersDrawer.sortBy')}</Label>
            <div className="space-y-2 sm:space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLocalSort(option.value)}
                  className={`w-full rounded-lg border p-3 sm:p-3 text-left transition ${
                    localSort === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className="text-base sm:text-base font-medium">{option.label}</p>
                  <p className="text-xs sm:text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3 sm:space-y-3">
            <Label className="text-xs sm:text-xs uppercase tracking-wide text-muted-foreground">{t('home.filtersDrawer.tags')}</Label>
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
                placeholder={t('home.filtersDrawer.addCustomTag')}
                className="h-10 sm:h-10 text-sm sm:text-sm"
              />
              <Button variant="outline" onClick={handleAddTag} className="h-10 sm:h-10 text-sm sm:text-sm px-4 sm:px-4">
                {t('home.filtersDrawer.add')}
              </Button>
            </div>
            {localTags.length > 0 ? (
              <div className="flex flex-wrap items-start gap-2 sm:gap-2">
                {localTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer text-xs sm:text-xs break-words overflow-wrap-anywhere"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm sm:text-sm text-muted-foreground">{t('home.filtersDrawer.noTagsSelected')}</p>
            )}

            <div className="space-y-2 sm:space-y-2">
              <p className="text-xs sm:text-xs font-medium text-muted-foreground">{t('home.filtersDrawer.quickPick')}</p>
              <div className="flex flex-wrap items-start gap-2 sm:gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={localTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs sm:text-xs break-words overflow-wrap-anywhere"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
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

        <SheetFooter className="space-x-0 sm:space-x-0 sm:space-y-0 pt-4 border-t">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="sm:flex-1 h-10 sm:h-10 text-sm sm:text-sm" onClick={handleClearAll}>
              {t('home.filtersDrawer.resetFilters')}
            </Button>
            <Button className="sm:flex-1 h-10 sm:h-10 text-sm sm:text-sm" onClick={handleApply}>
              {t('home.filtersDrawer.applyFilters')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Skeleton Components
function ArticleCardSkeleton() {
  return (
    <Card className="border-border/40 bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  )
}

function ArticleCardLineSkeleton() {
  return (
    <Card className="border-border/40 bg-card">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      </div>
    </Card>
  )
}

function ArticleCardSquareSkeleton() {
  return (
    <Card className="border-border/40 bg-card h-full flex flex-col">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </Card>
  )
}

function TrendingArticleSkeleton() {
  return (
    <div className="w-full rounded-xl border border-border/40 bg-background/70 px-3 sm:px-3 py-3 sm:py-3">
      <div className="flex items-start gap-3 sm:gap-3">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1 sm:space-y-1 min-w-0">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </div>
      <div className="mt-2 sm:mt-2 flex items-center gap-3 sm:gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-1" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  )
}
