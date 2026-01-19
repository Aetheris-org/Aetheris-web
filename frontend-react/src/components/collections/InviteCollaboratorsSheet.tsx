import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link2, UserPlus, Search, Copy, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from '@/hooks/useTranslation'
import { getCollectionInviteLink, addMemberToCollection, joinCollectionByInviteToken } from '@/api/collections'
import { searchProfilesByTag } from '@/api/profile'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'

interface InviteCollaboratorsSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  collectionId: string
  onJoined?: () => void
}

export function InviteCollaboratorsSheet({ open, onOpenChange, collectionId, onJoined }: InviteCollaboratorsSheetProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [tagQuery, setTagQuery] = useState('')
  const [inviteTokenInput, setInviteTokenInput] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: inviteUrl } = useQuery({
    queryKey: ['collection-invite-link', collectionId],
    queryFn: () => getCollectionInviteLink(collectionId),
    enabled: open && !!collectionId,
  })

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['profiles-by-tag', tagQuery],
    queryFn: () => searchProfilesByTag(tagQuery, 15),
    enabled: open && tagQuery.trim().length >= 2,
    staleTime: 30_000,
  })

  const addMu = useMutation({
    mutationFn: (userId: string) => addMemberToCollection(collectionId, userId, 'editor'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] })
      toast({ title: t('collections.memberAdded') })
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message, variant: 'destructive' }),
  })

  const joinByTokenMu = useMutation({
    mutationFn: (token: string) => joinCollectionByInviteToken(token),
    onSuccess: (r) => {
      if (r.joined && r.collectionId) {
        queryClient.invalidateQueries({ queryKey: ['collection', r.collectionId] })
        toast({ title: t('collections.joinedByLink') })
        onJoined?.()
        onOpenChange(false)
      } else {
        toast({ title: t('collections.invalidInviteToken'), variant: 'destructive' })
      }
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message, variant: 'destructive' }),
  })

  const handleCopy = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast({ title: t('collections.inviteLinkCopied') })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('collections.inviteCollaborators')}</SheetTitle>
          <SheetDescription>{t('collections.inviteCollaboratorsDescription')}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="link" className="flex-1 flex flex-col min-h-0 mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-4 w-4" />
              {t('collections.byLink')}
            </TabsTrigger>
            <TabsTrigger value="tag" className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('collections.byTag')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="flex-1 mt-4 space-y-4">
            <div>
              <Label>{t('collections.inviteLink')}</Label>
              <div className="flex gap-2 mt-2">
                <Input readOnly value={inviteUrl || ''} className="font-mono text-sm" />
                <Button size="icon" variant="outline" onClick={handleCopy} disabled={!inviteUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('collections.inviteLinkHint')}</p>
            </div>
            <div>
              <Label>{t('collections.joinByToken')}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder={t('collections.inviteTokenPlaceholder')}
                  value={inviteTokenInput}
                  onChange={(e) => setInviteTokenInput(e.target.value)}
                />
                <Button
                  onClick={() => inviteTokenInput.trim() && joinByTokenMu.mutate(inviteTokenInput.trim())}
                  disabled={joinByTokenMu.isPending || !inviteTokenInput.trim()}
                >
                  {joinByTokenMu.isPending ? t('common.loading') : t('collections.join')}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tag" className="flex-1 mt-4 space-y-4">
            <div>
              <Label>{t('collections.searchByTag')}</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('collections.tagSearchPlaceholder')}
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
              {!searchLoading && tagQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('collections.noUsersByTag')}</p>
              )}
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback>{(p.nickname || p.username).slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.nickname || p.username}</div>
                      {p.tag && <div className="text-xs text-muted-foreground">@{p.tag}</div>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMu.mutate(p.id)}
                    disabled={addMu.isPending || (user?.id != null && p.id === String(user.id))}
                  >
                    {user?.id != null && p.id === String(user.id) ? t('collections.you') : t('collections.add')}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
