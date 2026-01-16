import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, Edit, Save, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { logger } from '@/lib/logger'
import { createDraft } from '@/api/drafts'
import { useToast } from '@/components/ui/use-toast'

interface DraftData {
  title?: string
  excerpt?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  previewImage?: string
  contentHTML?: string
  contentJSON?: any
  draftId?: string
  savedAt?: string
}

interface DraftRecoveryDialogProps {
  draftData: DraftData
  localStorageKey: string
  onClose: () => void
}

export function DraftRecoveryDialog({ draftData, localStorageKey, onClose }: DraftRecoveryDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    try {
      localStorage.removeItem(localStorageKey)
      logger.debug('[DraftRecoveryDialog] Deleted draft from localStorage:', { key: localStorageKey })
      toast({
        title: t('draftRecovery.deleted'),
        description: t('draftRecovery.deletedDescription'),
      })
      onClose()
    } catch (error) {
      logger.error('[DraftRecoveryDialog] Failed to delete draft:', error)
      toast({
        title: t('draftRecovery.deleteError'),
        description: t('draftRecovery.deleteErrorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleContinue = () => {
    // Переходим на страницу создания статьи с параметром для восстановления
    const params = new URLSearchParams()
    if (draftData.draftId) {
      params.set('draft', draftData.draftId)
    }
    params.set('recover', 'true')
    navigate(`/create?${params.toString()}`)
    onClose()
  }

  const handleSaveToDraft = async () => {
    setIsSaving(true)
    try {
      // Преобразуем данные для сохранения в черновик
      const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
        const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
          beginner: 'easy',
          intermediate: 'medium',
          advanced: 'hard',
        };
        return mapping[diff] || 'medium';
      };

      // Создаем contentDocument из contentJSON или contentHTML
      let contentDocument: any[] = []
      if (draftData.contentJSON && draftData.contentJSON.type === 'doc' && Array.isArray(draftData.contentJSON.content)) {
        contentDocument = draftData.contentJSON.content
      } else if (Array.isArray(draftData.contentJSON)) {
        contentDocument = draftData.contentJSON
      } else if (draftData.contentHTML) {
        // Создаем минимальный документ из HTML
        const plainText = draftData.contentHTML.replace(/<[^>]*>/g, '').trim()
        contentDocument = [
          {
            type: 'paragraph',
            children: [{ text: plainText || '' }],
          },
        ]
      } else {
        contentDocument = [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]
      }

      const draftTitle = (draftData.title || t('createArticle.untitledDraft')).trim()
      const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle

      const draftPayload: any = {
        title: finalDraftTitle,
        content: contentDocument,
        excerpt: (draftData.excerpt || ' ').trim(),
        tags: draftData.tags || [],
        difficulty: mapDifficultyToBackend(draftData.difficulty || 'intermediate'),
      }

      if (draftData.previewImage) {
        draftPayload.previewImage = draftData.previewImage
        draftPayload.preview_image = draftData.previewImage
        draftPayload.cover_url = draftData.previewImage
      }

      const savedDraft = await createDraft(draftPayload)
      
      // Обновляем localStorage с новым ID
      try {
        const newLocalStorageKey = `draft_${savedDraft.id}`
        const updatedData = {
          ...draftData,
          draftId: savedDraft.id,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(newLocalStorageKey, JSON.stringify(updatedData))
        if (localStorageKey !== newLocalStorageKey) {
          localStorage.removeItem(localStorageKey)
        }
      } catch (localStorageError) {
        logger.warn('[DraftRecoveryDialog] Failed to update localStorage:', localStorageError)
      }

      toast({
        title: t('draftRecovery.saved'),
        description: t('draftRecovery.savedDescription'),
      })
      
      onClose()
    } catch (error: any) {
      logger.error('[DraftRecoveryDialog] Failed to save draft:', error)
      toast({
        title: t('draftRecovery.saveError'),
        description: error?.message || t('draftRecovery.saveErrorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const draftTitle = draftData.title?.trim() || t('createArticle.untitledDraft')
  const savedAt = draftData.savedAt ? new Date(draftData.savedAt) : null
  const timeAgo = savedAt ? getTimeAgo(savedAt) : null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader className="flex flex-row items-center justify-center sm:justify-start gap-3 pb-4 border-b border-border/60">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
          <DialogTitle className="text-lg sm:text-xl text-center sm:text-left">
            {t('draftRecovery.title')}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm sm:text-base text-center sm:text-left pt-2 space-y-2">
          <p>{t('draftRecovery.description')}</p>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <FileText className="h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{draftTitle}</p>
              {timeAgo && (
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              )}
            </div>
          </div>
        </DialogDescription>
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? t('common.loading') : t('draftRecovery.delete')}
          </Button>
          <Button
            variant="outline"
            onClick={handleContinue}
            disabled={isDeleting || isSaving}
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t('draftRecovery.continue')}
          </Button>
          <Button
            onClick={handleSaveToDraft}
            disabled={isDeleting || isSaving}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('common.loading') : t('draftRecovery.saveToDraft')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} д назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
