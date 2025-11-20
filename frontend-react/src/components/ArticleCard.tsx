import { Calendar, Clock, User, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'
import { useTranslation } from '@/hooks/useTranslation'

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <Card
      className="group relative overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer"
      onClick={() => onArticleClick?.(article.id)}
      onMouseEnter={onMouseEnter}
    >
      {!hidePreview && article.previewImage && (
        <div className="relative w-full overflow-hidden border-b border-border/40">
          <div className="aspect-video w-full">
            <img
              src={article.previewImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Скрываем изображение при ошибке загрузки
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
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
              <span className="font-medium">{article.author.username}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{estimateReadTime(article.content)} {t('article.readTime')}</span>
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
            {article.likes !== undefined && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{article.likes}</span>
              </div>
            )}
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
