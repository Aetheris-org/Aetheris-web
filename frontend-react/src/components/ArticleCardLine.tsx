import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/article'

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
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Функция для извлечения текста из Slate document
  const extractTextFromSlate = (content: any): string => {
    if (typeof content === 'string') {
      return content
    }
    
    // Если это объект Slate document
    if (content && typeof content === 'object') {
      // Проверяем формат Slate: { document: [...] }
      const document = content.document || content
      
      if (Array.isArray(document)) {
        const extractText = (node: any): string => {
          if (typeof node === 'string') {
            return node
          }
          if (node?.text) {
            return node.text
          }
          if (node?.children && Array.isArray(node.children)) {
            return node.children.map(extractText).join(' ')
          }
          if (node?.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(' ')
          }
          return ''
        }
        return document.map(extractText).join(' ')
      }
    }
    
    return ''
  }

  const estimateReadTime = (content: any) => {
    const wordsPerMinute = 200
    const text = extractTextFromSlate(content)
    if (!text) return 1 // Минимум 1 минута
    const words = text.split(/\s+/).filter(word => word.length > 0).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  return (
    <Card
      className="group overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300 cursor-pointer"
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
                className={`${article.previewImage ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-muted text-muted-foreground text-[10px]`}
              >
                No preview
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors break-words overflow-wrap-anywhere word-break-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
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
