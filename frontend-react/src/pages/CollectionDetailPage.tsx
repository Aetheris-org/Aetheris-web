import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Users,
  FileText,
  Pencil,
  Trash2,
  MoreHorizontal,
  Link2,
  UserPlus,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InviteCollaboratorsSheet } from '@/components/collections/InviteCollaboratorsSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import {
  getCollection,
  toggleCollectionLike,
  toggleCollectionSave,
  deleteCollection,
  removeArticleFromCollection,
  getCollectionInviteLink,
} from '@/api/collections'
import { useToast } from '@/components/ui/use-toast'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: c, isLoading, error } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => getCollection(id!, { withArticles: true, withMembers: true }),
    enabled: !!id,
  })

  const likeMu = useMutation({
    mutationFn: () => toggleCollectionLike(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
  const saveMu = useMutation({
    mutationFn: () => toggleCollectionSave(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
  const delMu = useMutation({
    mutationFn: () => deleteCollection(id!),
    onSuccess: () => {
      toast({ title: t('collections.deleted') })
      navigate('/collections')
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message, variant: 'destructive' }),
  })
  const removeArtMu = useMutation({
    mutationFn: ({ articleId }: { articleId: string }) => removeArticleFromCollection(id!, articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
    },
  })

  const handleCopyLink = async () => {
    try {
      const url = await getCollectionInviteLink(id!)
      await navigator.clipboard.writeText(url)
      toast({ title: t('collections.inviteLinkCopied') })
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message, variant: 'destructive' })
    }
  }

  if (error || (!isLoading && !c)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">{t('collections.notFound')}</p>
          <Button variant="link" onClick={() => navigate('/collections')}>{t('common.back')}</Button>
        </main>
      </div>
    )
  }

  if (isLoading || !c) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="h-48 rounded-lg bg-muted/30 animate-pulse" />
        </main>
      </div>
    )
  }

  const displayName = c.owner?.nickname || c.owner?.username || ''
  const canEdit = c.canEdit ?? false

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        {/* Cover + meta */}
        <div className="rounded-xl overflow-hidden border bg-card mb-8">
          <div className="aspect-[21/9] bg-muted/30 relative">
            {c.coverImage ? (
              <img src={c.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <FileText className="h-16 w-16" />
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{c.title}</h1>
                {c.description && <p className="text-muted-foreground mt-1">{c.description}</p>}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <button
                    onClick={() => c.owner && navigate(`/profile/${c.owner.id}`)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={c.owner?.avatar} />
                      <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    {displayName}
                  </button>
                  <span className="text-sm text-muted-foreground">{c.articles?.length ?? 0} {t('collections.articles')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {user && (
                  <>
                    <Button
                      variant={c.isLiked ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => likeMu.mutate()}
                      disabled={likeMu.isPending}
                    >
                      <Heart className={c.isLiked ? 'fill-current h-4 w-4' : 'h-4 w-4'} />
                      {c.likesCount}
                    </Button>
                    <Button
                      variant={c.isSaved ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => saveMu.mutate()}
                      disabled={saveMu.isPending}
                    >
                      <Bookmark className={c.isSaved ? 'fill-current h-4 w-4' : 'h-4 w-4'} />
                      {c.savesCount}
                    </Button>
                  </>
                )}
                {canEdit && (
                  <>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                      {t('collections.invite')}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
                      <Link2 className="h-4 w-4" />
                      {t('collections.copyInviteLink')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/collections/${id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => delMu.mutate()} disabled={delMu.isPending}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        {c.members && c.members.length > 0 && (
          <Card className="p-4 mb-8">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('collections.collaborators')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {c.members.map((m) => (
                <Badge key={m.id} variant="secondary" className="gap-1">
                  {m.user?.username || m.userId}
                  <span className="text-muted-foreground">({m.role})</span>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Articles */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('collections.articlesInCollection')}</h2>
          {!c.articles || c.articles.length === 0 ? (
            <p className="text-muted-foreground">{t('collections.noArticles')}</p>
          ) : (
            <div className="space-y-2">
              {c.articles.map((ca) => (
                <Card key={ca.id} className="p-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left hover:opacity-80"
                    onClick={() => ca.article && navigate(`/article/${ca.article.id}`)}
                  >
                    {ca.article ? (
                      <>
                        <div className="font-medium line-clamp-1">{ca.article.title}</div>
                        {ca.article.excerpt && <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{ca.article.excerpt}</div>}
                      </>
                    ) : (
                      <span className="text-muted-foreground">{t('collections.articleDeleted')}</span>
                    )}
                  </button>
                  {canEdit && ca.article && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArtMu.mutate({ articleId: ca.articleId })}
                      disabled={removeArtMu.isPending}
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <InviteCollaboratorsSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        collectionId={id!}
        onJoined={() => { queryClient.invalidateQueries({ queryKey: ['collection', id] }); setInviteOpen(false); }}
      />
    </div>
  )
}
