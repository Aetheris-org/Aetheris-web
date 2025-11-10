import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'

interface ArticleCardSquareProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: number) => void
}

export function ArticleCardSquare({
  article,
  onTagClick,
  onArticleClick,
}: ArticleCardSquareProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <Card
      className="group overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => onArticleClick?.(article.id)}
    >
      {article.previewImage && (
        <div className="relative h-40 w-full overflow-hidden border-b border-border/40">
          <img
            src={article.previewImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.excerpt || article.content.slice(0, 100) + '...'}
          </p>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {article.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md text-xs font-normal hover:bg-secondary/80 cursor-pointer transition-colors"
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
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{estimateReadTime(article.content)}m</span>
            </div>
          </div>

          {article.likes !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-medium">{article.likes}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
