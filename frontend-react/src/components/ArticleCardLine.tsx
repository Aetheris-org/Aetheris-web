import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ArticlePreviewZoom } from '@/components/ArticlePreviewZoom'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'
import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { getUserProfileMinimal } from '@/api/profile'

interface ArticleCardLineProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: string) => void
  onMouseEnter?: () => void
}

export function ArticleCardLine({
  article,
  onTagClick,
  onArticleClick,
  onMouseEnter,
}: ArticleCardLineProps) {
  const { t } = useTranslation()
  const [authorProfile, setAuthorProfile] = useState<any>(null)

  // Получаем актуальный профиль автора по UID
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author?.id) {
        const profile = await getUserProfileMinimal(article.author.id)
        setAuthorProfile(profile)
      }
    }
    fetchAuthorProfile()
  }, [article.author?.id])

  // Приоритет: username из данных статьи > username из профиля > nickname из профиля > nickname из статьи
  const authorName = useMemo(
    () =>
      article.author.username?.trim() ||
      authorProfile?.username?.trim() ||
      authorProfile?.nickname?.trim() ||
      article.author.nickname?.trim() ||
      (article as any).author_username ||
      (article as any).username ||
      '',
    [authorProfile, article.author.username, article.author.nickname]
  )
  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInMinutes < 1) return t('time.justNow')
    if (diffInMinutes < 60) return t('time.minutesAgo', { count: diffInMinutes })
    if (diffInHours < 24) return t('time.hoursAgo', { count: diffInHours })
    if (diffInDays < 30) return t('time.daysAgo', { count: diffInDays })
    if (diffInMonths < 12) return t('time.monthsAgo', { count: diffInMonths })
    return t('time.yearsAgo', { count: diffInYears })
  }


  const getReadMinutes = () => {
    const apiMinutesRaw =
      article.readTimeMinutes ??
      (article as any).read_time_minutes ??
      (article as any).read_time ??
      (article as any).readTime ??
      (article as any).read_minutes ??
      undefined
    const apiMinutesNum = Number(apiMinutesRaw)
    return Number.isFinite(apiMinutesNum) && apiMinutesNum > 0
      ? Math.max(1, Math.round(apiMinutesNum * 2) / 2)
      : 1 // fallback to 1 minute if API doesn't provide value
  }

  const formatReadMinutes = (minutes: number) => (Number.isInteger(minutes) ? minutes : minutes.toFixed(1))

  return (
    <Card
      className="group overflow-hidden border border-border/40 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={() => onArticleClick?.(article.id)}
      onMouseEnter={onMouseEnter}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-32 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/10">
            <div className="aspect-video w-full">
              {article.previewImage ? (
                <img
                  src={article.previewImage}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const placeholder = target.nextElementSibling as HTMLDivElement | null
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className={`${article.previewImage ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-muted text-muted-foreground text-[10px]`}
              >
                No preview
              </div>
            </div>
            {article.previewImage && (
              <ArticlePreviewZoom src={article.previewImage} alt={article.title} />
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors break-words overflow-wrap-anywhere word-break-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {article.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">{authorName}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeTime(article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatReadMinutes(getReadMinutes())} {t('article.readTime')}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/80 line-clamp-2">
              {article.excerpt || article.content.slice(0, 110) + '…'}
            </p>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex items-start gap-1.5 flex-wrap">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer transition-colors break-words overflow-wrap-anywhere"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTagClick?.(tag)
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="rounded-md text-xs font-normal">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {(() => {
            const viewsCount =
              article.views ??
              // fallback in case backend returns alternative field
              (article as any).views_count ??
              (article as any).view_count ??
              (article as any).viewsCount ??
              (article as any).stats?.views ??
              0
            return (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{viewsCount}</span>
              </div>
            )
          })()}
        </div>
      </div>
    </Card>
  )
}
