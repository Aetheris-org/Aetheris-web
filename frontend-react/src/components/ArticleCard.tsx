import { Calendar, Clock, User, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'
import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'
import { getUserProfileMinimal } from '@/api/profile'

interface ArticleCardProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: string) => void
  onMouseEnter?: () => void
  hidePreview?: boolean
}

export function ArticleCard({
  article,
  onTagClick,
  onArticleClick,
  onMouseEnter,
  hidePreview = false,
}: ArticleCardProps) {
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

  // Приоритет: nickname из данных статьи > nickname из профиля > username из профиля > username из статьи
  const authorName =
    article.author.nickname?.trim() ||
    authorProfile?.nickname?.trim() ||
    authorProfile?.username?.trim() ||
    article.author.username?.trim() ||
    (article as any).author_username ||
    (article as any).username ||
    ''

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

  const viewsCount =
    article.views ??
    (article as any).views_count ??
    (article as any).view_count ??
    (article as any).viewsCount ??
    (article as any).stats?.views ??
    0

  return (
    <Card
      className="group relative overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer"
      onClick={() => onArticleClick?.(article.id)}
      onMouseEnter={onMouseEnter}
    >
      {!hidePreview && (
        <div className="relative w-full overflow-hidden border-b border-border/40 bg-muted/10">
          <div className="aspect-video w-full">
            {article.previewImage ? (
              <img
                src={article.previewImage}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  // Скрываем изображение при ошибке загрузки, показываем заглушку
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const placeholder = target.nextElementSibling as HTMLDivElement | null
                  if (placeholder) {
                    placeholder.style.display = 'flex'
                  }
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
      )}

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors break-words overflow-wrap-anywhere word-break-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {article.title}
            </h2>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium">{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formatReadMinutes(getReadMinutes())} {t('article.readTime')}
              </span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {(hidePreview || !article.previewImage) && article.excerpt === undefined && (
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {article.content.slice(0, 150)}…
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-start gap-2 flex-wrap">
            {article.tags.slice(0, 4).map((tag) => (
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
            {article.tags.length > 4 && (
              <Badge variant="outline" className="rounded-md font-normal">
                +{article.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{viewsCount}</span>
              </div>
          </div>

          {article.difficulty && (
            <Badge
              variant="outline"
              className="rounded-md font-normal capitalize"
            >
              {t(`createArticle.difficultyOptions.${getDifficultyKey(article.difficulty)}`)}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
