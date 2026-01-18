import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PenSquare } from 'lucide-react'
import { getArticles, type ArticleSortOption } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArticleCard } from '@/components/ArticleCard'
import { SiteHeader } from '@/components/SiteHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/hooks/useTranslation'
import { getRoleByUuid } from '@/config/admins'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function NewsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Проверка, является ли пользователь админом
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || (user?.uuid && (getRoleByUuid(user.uuid) === 'owner' || getRoleByUuid(user.uuid) === 'main_admin'))

  const { data: articlesData, isLoading, error: articlesError } = useQuery({
    queryKey: ['articles', 'news', page, pageSize],
    queryFn: async () => {
      const result = await getArticles({
        page,
        pageSize,
        category: 'news',
        sort: 'newest' as ArticleSortOption,
      })
      // Фильтруем только статьи от админов
      // В реальности это должно делаться на сервере, но пока фильтруем на клиенте
      return result
    },
    enabled: true,
    refetchOnMount: 'always',
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
  })

  const articles = articlesData?.data || []
  const totalRecords = articlesData?.total || 0
  const totalPages = Math.ceil(totalRecords / pageSize)
  const hasMultiplePages = totalPages > 1

  const paginationPages = useCallback(() => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [totalPages, page])

  const handleArticleClick = useCallback((articleId: string) => {
    navigate(`/article/${articleId}`)
  }, [navigate])

  const handleTagClick = (_tag: string) => {
    // В будущем можно добавить фильтрацию по тегам
  }

  const handleCreateArticle = () => {
    navigate('/create?category=news')
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-4 sm:pb-6 pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('header.news')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('news.description') || 'Community news and announcements from administrators'}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleCreateArticle} size="sm" className="gap-2">
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('news.createArticle') || 'Create Article'}</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card key={i} className="border-border/40 bg-card">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : articlesError ? (
          <Card className="border-dashed border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-lg font-medium text-destructive">{t('home.articles.error') || 'Error loading articles'}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('home.articles.errorDescription') || 'Please try again later'}
              </p>
            </CardContent>
          </Card>
        ) : articles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-lg font-medium">{t('news.noArticles') || 'No news articles yet'}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('news.noArticlesDescription') || 'Check back later for community news and announcements'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onTagClick={handleTagClick}
                  onArticleClick={handleArticleClick}
                />
              ))}
            </div>

            {hasMultiplePages && (
              <div className="pt-6" onClick={(e) => e.stopPropagation()}>
                <Pagination>
                  <PaginationContent className="flex-wrap gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setPage(Math.max(1, page - 1))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    {paginationPages().map((item, idx) =>
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
                          setPage(Math.min(totalPages, page + 1))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
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
      </main>
    </div>
  )
}
