import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'
import { useTranslation } from '@/hooks/useTranslation'

interface ArticleCardSquareProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: string) => void
  onMouseEnter?: () => void
}

export function ArticleCardSquare({
  article,
  onTagClick,
  onArticleClick,
  onMouseEnter,
}: ArticleCardSquareProps) {
  const { t } = useTranslation()

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInMinutes < 1) return 'только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    if (diffInHours < 24) return `${diffInHours} ч назад`
    if (diffInDays < 30) return `${diffInDays} д назад`
    if (diffInMonths < 12) return `${diffInMonths} мес назад`
    return `${diffInYears} г назад`
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
      className="group overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => onArticleClick?.(article.id)}
      onMouseEnter={onMouseEnter}
    >
      <div className="relative w-full overflow-hidden border-b border-border/40 bg-muted/10">
          <div className="aspect-video w-full">
          {article.previewImage ? (
          <img
            src={article.previewImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
            className={`${article.previewImage ? 'hidden' : 'flex'} h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs`}
          >
            No preview
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors break-words overflow-wrap-anywhere word-break-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {article.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.excerpt || article.content.slice(0, 100) + '...'}
          </p>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-start gap-1.5 flex-wrap">
            {article.tags.slice(0, 2).map((tag) => (
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
            {article.tags.length > 2 && (
              <Badge variant="outline" className="rounded-md text-xs font-normal">
                +{article.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-medium">{viewsCount}</span>
            </div>
            )
          })()}
        </div>
      </div>
    </Card>
  )
}
