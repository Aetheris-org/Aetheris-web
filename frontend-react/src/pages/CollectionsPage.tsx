import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Bookmark, FolderOpen, LayoutGrid } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollectionCard } from '@/components/collections/CollectionCard'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import {
  getCollections,
  getSavedCollections,
  toggleCollectionLike,
  toggleCollectionSave,
} from '@/api/collections'

export default function CollectionsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'all' | 'my' | 'saved'>('all')
  const [search, setSearch] = useState('')

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['collections', 'all', { search, page: 1 }],
    queryFn: () => getCollections({ page: 1, pageSize: 24, search: search || undefined, sort: 'newest' }),
    enabled: tab === 'all',
  })

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['collections', 'my', user?.id],
    queryFn: () => getCollections({ page: 1, pageSize: 24, ownerId: user?.id != null ? String(user.id) : undefined, sort: 'newest' }),
    enabled: tab === 'my' && !!user,
  })

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ['collections', 'saved'],
    queryFn: () => getSavedCollections(1, 24),
    enabled: tab === 'saved' && !!user,
  })

  const likeMu = useMutation({
    mutationFn: (id: string) => toggleCollectionLike(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
    },
  })
  const saveMu = useMutation({
    mutationFn: (id: string) => toggleCollectionSave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
    },
  })

  const data = tab === 'all' ? allData : tab === 'my' ? myData : savedData
  const isLoading = tab === 'all' ? allLoading : tab === 'my' ? myLoading : savedLoading
  const list = data?.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('collections.title')}</h1>
            <p className="text-muted-foreground">{t('collections.subtitle')}</p>
          </div>
          {user && (
            <Button className="gap-2 shrink-0" onClick={() => navigate('/collections/create')}>
              <Plus className="h-4 w-4" />
              {t('collections.create')}
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">{t('collections.tabs.all')}</TabsTrigger>
              <TabsTrigger value="my" disabled={!user}>{t('collections.tabs.my')}</TabsTrigger>
              <TabsTrigger value="saved" disabled={!user}>{t('collections.tabs.saved')}</TabsTrigger>
            </TabsList>
            {(tab === 'all' || (tab === 'my' && user)) && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('collections.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-lg border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('collections.empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    onClick={() => navigate(`/collections/${c.id}`)}
                    onLike={user ? () => likeMu.mutate(c.id) : undefined}
                    onSave={user ? () => saveMu.mutate(c.id) : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {!user ? (
              <p className="text-muted-foreground">{t('collections.signInToViewMy')}</p>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-lg border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (myData?.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('collections.emptyMy')}</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/collections/create')}>
                  {t('collections.create')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(myData?.data ?? []).map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    onClick={() => navigate(`/collections/${c.id}`)}
                    onLike={() => likeMu.mutate(c.id)}
                    onSave={() => saveMu.mutate(c.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {!user ? (
              <p className="text-muted-foreground">{t('collections.signInToViewSaved')}</p>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-lg border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (savedData?.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('collections.emptySaved')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(savedData?.data ?? []).map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    onClick={() => navigate(`/collections/${c.id}`)}
                    onLike={() => likeMu.mutate(c.id)}
                    onSave={() => saveMu.mutate(c.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
