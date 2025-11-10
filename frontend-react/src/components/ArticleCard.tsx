import { Calendar, Clock, User, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'

interface ArticleCardProps {
  article: Article
  onTagClick?: (tag: string) => void
  onArticleClick?: (articleId: number) => void
}

export function ArticleCard({
  article,
  onTagClick,
  onArticleClick,
}: ArticleCardProps) {
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
    >
      {article.previewImage && (
        <div className="relative h-48 w-full overflow-hidden border-b border-border/40">
          <img
            src={article.previewImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
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
              <span>{estimateReadTime(article.content)} min read</span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {!article.previewImage && article.excerpt === undefined && (
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {article.content.slice(0, 150)}…
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {article.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md font-normal hover:bg-secondary/80 cursor-pointer transition-colors"
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
              {article.difficulty}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
