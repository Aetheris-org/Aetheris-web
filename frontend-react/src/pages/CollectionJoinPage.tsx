import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { joinCollectionByInviteToken } from '@/api/collections'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog'

export default function CollectionJoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)

  const join = useMutation({
    mutationFn: () => joinCollectionByInviteToken(token!),
    onSuccess: (r) => {
      if (r.joined && r.collectionId) {
        navigate(`/collections/${r.collectionId}`, { replace: true })
      }
    },
  })

  useEffect(() => {
    if (!token?.trim()) return
    if (!user) {
      setShowAuth(true)
      return
    }
    join.mutate()
  }, [token, user])

  if (!token?.trim()) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-md mx-auto px-4 py-16 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{t('collections.invalidInviteLink')}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/collections')}>
            {t('collections.browseCollections')}
          </Button>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">{t('collections.signInToJoin')}</p>
          <AuthRequiredDialog open={showAuth} onOpenChange={setShowAuth} />
        </main>
      </div>
    )
  }

  if (join.isPending) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-md mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p>{t('collections.joining')}</p>
        </main>
      </div>
    )
  }

  if (join.isError || (join.isSuccess && !join.data?.joined)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-md mx-auto px-4 py-16 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{t('collections.invalidInviteToken')}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/collections')}>
            {t('collections.browseCollections')}
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-md mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p>{t('common.loading')}</p>
      </main>
    </div>
  )
}
