import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { createCollection } from '@/api/collections'
import { useToast } from '@/components/ui/use-toast'
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog'

export default function CreateCollectionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showAuth, setShowAuth] = useState(false)

  const create = useMutation({
    mutationFn: () => createCollection({ title: title.trim(), description: description.trim() || null, isPublic: true }),
    onSuccess: (c) => {
      toast({ title: t('collections.created') })
      navigate(`/collections/${c.id}`)
    },
    onError: (e: any) => {
      toast({ title: t('common.error'), description: e?.message, variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setShowAuth(true); return }
    if (title.trim().length < 2) {
      toast({ title: t('common.error'), description: t('collections.titleMin'), variant: 'destructive' })
      return
    }
    create.mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold mb-2">{t('collections.create')}</h1>
        <p className="text-muted-foreground mb-8">{t('collections.createDescription')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">{t('collections.titleLabel')} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('collections.titlePlaceholder')}
              minLength={2}
              maxLength={200}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">{t('collections.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('collections.descriptionPlaceholder')}
              rows={4}
              className="mt-2"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending || title.trim().length < 2}>
              {create.isPending ? t('common.loading') : t('common.create')}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </main>
      <AuthRequiredDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  )
}
