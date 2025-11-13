import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'

interface ArticleCardLineProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: string) => void
}

export function ArticleCardLine({
  article,
  onTagClick,
  onArticleClick,
}: ArticleCardLineProps) {
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
      className="group overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer"
      onClick={() => onArticleClick?.(article.id)}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {article.previewImage && (
            <div className="relative w-32 shrink-0 overflow-hidden rounded-lg border border-border/40">
              <div className="aspect-video w-full">
              <img
                src={article.previewImage}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              </div>
            </div>
          )}
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {article.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">{article.author.username}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{estimateReadTime(article.content)} min</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/80 line-clamp-2">
              {article.excerpt || article.content.slice(0, 110) + '…'}
            </p>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer transition-colors"
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
          {article.likes !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{article.likes}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
