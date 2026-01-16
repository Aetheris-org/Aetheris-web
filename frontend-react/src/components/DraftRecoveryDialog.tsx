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
  onProcessed?: (key: string) => void
}

export function DraftRecoveryDialog({ draftData, localStorageKey, onClose, onProcessed }: DraftRecoveryDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    try {
      // Удаляем из localStorage
      localStorage.removeItem(localStorageKey)
      logger.debug('[DraftRecoveryDialog] Deleted draft from localStorage:', { key: localStorageKey })
      
      // Также удаляем все связанные черновики (на случай, если есть другие ключи)
      try {
        Object.keys(localStorage).filter(key => key.startsWith('draft_')).forEach(key => {
          localStorage.removeItem(key)
        })
        logger.debug('[DraftRecoveryDialog] Cleared all draft keys from localStorage')
      } catch (e) {
        logger.warn('[DraftRecoveryDialog] Failed to clear all draft keys:', e)
      }
      
      // Помечаем как обработанный ПЕРЕД закрытием
      onProcessed?.(localStorageKey)
      
      toast({
        title: t('draftRecovery.deleted'),
        description: t('draftRecovery.deletedDescription'),
      })
      
      // Небольшая задержка перед закрытием, чтобы состояние успело обновиться
      setTimeout(() => {
        onClose()
      }, 100)
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
    // Помечаем как обработанный ПЕРЕД удалением и переходом
    onProcessed?.(localStorageKey)
    
    // Очищаем ВСЕ черновики из localStorage, чтобы при заходе на страницу создания поля были чистыми
    try {
      localStorage.removeItem(localStorageKey)
      // Также удаляем все связанные черновики
      Object.keys(localStorage).filter(key => key.startsWith('draft_')).forEach(key => {
        localStorage.removeItem(key)
      })
      logger.debug('[DraftRecoveryDialog] Cleared all drafts from localStorage on continue:', { key: localStorageKey })
    } catch (error) {
      logger.warn('[DraftRecoveryDialog] Failed to clear localStorage on continue:', error)
    }
    
    // Переходим на страницу создания статьи
    // Если есть draftId, переходим к редактированию этого черновика из базы
    const params = new URLSearchParams()
    if (draftData.draftId) {
      params.set('draft', draftData.draftId)
    }
    // НЕ добавляем recover=true, чтобы не восстанавливать из localStorage
    
    // Небольшая задержка перед переходом, чтобы состояние успело обновиться
    setTimeout(() => {
      navigate(`/create?${params.toString()}`)
      onClose()
    }, 100)
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

      // Проверяем, есть ли уже черновик с таким ID
      let savedDraft
      if (draftData.draftId) {
        try {
          // Пытаемся обновить существующий черновик
          const { updateDraft } = await import('@/api/drafts')
          savedDraft = await updateDraft(draftData.draftId, draftPayload)
          logger.debug('[DraftRecoveryDialog] Updated existing draft:', { id: savedDraft.id })
        } catch (error: any) {
          // Если черновик не найден, создаем новый
          if (error?.message?.includes('Draft not found') || error?.message?.includes('not found')) {
            logger.warn('[DraftRecoveryDialog] Draft not found, creating new one:', { draftId: draftData.draftId })
            savedDraft = await createDraft(draftPayload)
          } else {
            throw error
          }
        }
      } else {
        // Если нет draftId, проверяем существование похожего черновика
        try {
          const { getDrafts } = await import('@/api/drafts')
          const existingDrafts = await getDrafts(0, 10)
          
          // Ищем черновик с таким же заголовком
          const similarDraft = existingDrafts.find(d => 
            d.title.trim() === finalDraftTitle.trim()
          )
          
          if (similarDraft) {
            logger.debug('[DraftRecoveryDialog] Found similar draft, updating it:', { id: similarDraft.id })
            const { updateDraft } = await import('@/api/drafts')
            savedDraft = await updateDraft(similarDraft.id, draftPayload)
          } else {
            savedDraft = await createDraft(draftPayload)
          }
        } catch (checkError) {
          // Если проверка не удалась, создаем новый
          logger.warn('[DraftRecoveryDialog] Failed to check existing drafts, creating new one:', checkError)
          savedDraft = await createDraft(draftPayload)
        }
      }
      
      // Помечаем как обработанный ПЕРЕД удалением
      onProcessed?.(localStorageKey)
      
      // Очищаем ВСЕ черновики из localStorage, чтобы при заходе на страницу создания поля были чистыми
      // Черновик уже сохранен в базу, поэтому localStorage не нужен
      try {
        localStorage.removeItem(localStorageKey)
        // Также удаляем все связанные черновики
        Object.keys(localStorage).filter(key => key.startsWith('draft_')).forEach(key => {
          localStorage.removeItem(key)
        })
        logger.debug('[DraftRecoveryDialog] Cleared all drafts from localStorage after saving:', { key: localStorageKey })
      } catch (localStorageError) {
        logger.warn('[DraftRecoveryDialog] Failed to clear localStorage after saving:', localStorageError)
      }

      toast({
        title: t('draftRecovery.saved'),
        description: t('draftRecovery.savedDescription'),
      })
      
      // Небольшая задержка перед закрытием, чтобы состояние успело обновиться
      setTimeout(() => {
        onClose()
      }, 100)
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
