import { Heart, Bookmark, Users, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Collection } from '@/types/collection'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface CollectionCardProps {
  collection: Collection
  onClick?: () => void
  onLike?: (e: React.MouseEvent) => void
  onSave?: (e: React.MouseEvent) => void
  className?: string
}

export function CollectionCard({ collection, onClick, onLike, onSave, className }: CollectionCardProps) {
  const { t } = useTranslation()
  const displayName = collection.owner?.nickname || collection.owner?.username || ''
  const n = (collection.articlesCount ?? 0)

  return (
    <Card
      className={cn(
        'overflow-hidden border border-border/40 bg-card hover:border-primary/50 transition-all cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-[16/9] w-full bg-muted/30 relative">
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {onLike && (
            <button
              onClick={(e) => { e.stopPropagation(); onLike(e); }}
              className={cn(
                'p-1.5 rounded-md bg-background/80 backdrop-blur',
                collection.isLiked && 'text-red-500'
              )}
              title={t('collections.like')}
            >
              <Heart className={cn('h-4 w-4', collection.isLiked && 'fill-current')} />
            </button>
          )}
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(e); }}
              className={cn(
                'p-1.5 rounded-md bg-background/80 backdrop-blur',
                collection.isSaved && 'text-primary'
              )}
              title={t('collections.save')}
            >
              <Bookmark className={cn('h-4 w-4', collection.isSaved && 'fill-current')} />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2">{collection.title}</h3>
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6">
              <AvatarImage src={collection.owner?.avatar} />
              <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{displayName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <FileText className="h-3 w-3" /> {n}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Heart className="h-3 w-3" /> {collection.likesCount}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Bookmark className="h-3 w-3" /> {collection.savesCount}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
