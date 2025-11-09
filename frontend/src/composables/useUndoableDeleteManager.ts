import { ref, computed } from 'vue'
import i18n from '@/i18n'

export interface UndoableDeleteItem {
  id: string
  type: 'article' | 'comment'
  message: string
  onConfirm: () => Promise<void> | void
  onUndo?: () => Promise<void> | void
  progress: number
  timeoutId: ReturnType<typeof setTimeout> | null
  startTime: number
  duration: number
  isActive: boolean
}

const activeDeletes = ref<Map<string, UndoableDeleteItem>>(new Map())
const DELETE_DURATION = 5000 // 5 секунд по умолчанию

export function useUndoableDeleteManager() {
  const items = computed(() => Array.from(activeDeletes.value.values()))

  const startDelete = (
    id: string | number,
    type: 'article' | 'comment',
    onConfirm: () => Promise<void> | void,
    options: {
      message?: string
      duration?: number
      onUndo?: () => Promise<void> | void
    } = {}
  ): void => {
    const deleteId = String(id)
    const duration = options.duration || DELETE_DURATION
    const startTime = Date.now()

    // Если уже есть активное удаление для этого ID, отменяем его
    const existing = activeDeletes.value.get(deleteId)
    if (existing?.timeoutId) {
      clearTimeout(existing.timeoutId)
    }

    // Создаем новое состояние удаления
    const { t } = i18n.global
    const item: UndoableDeleteItem = {
      id: deleteId,
      type,
      message: options.message || (type === 'article' ? t('notifications.undoDelete.article.message') : t('notifications.undoDelete.comment.message')),
      onConfirm,
      onUndo: options.onUndo,
      progress: 0,
      timeoutId: null,
      startTime,
      duration,
      isActive: true,
    }

    // Обновляем прогресс каждые 50ms
    const updateProgress = () => {
      const currentItem = activeDeletes.value.get(deleteId)
      if (!currentItem) return // Если элемент удален, прекращаем обновление
      
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      
      currentItem.progress = progress

      if (progress < 100 && currentItem.isActive) {
        setTimeout(updateProgress, 50)
      }
    }

    updateProgress()

    // Таймер для автоматического подтверждения удаления
    const timeoutId = setTimeout(async () => {
      const currentItem = activeDeletes.value.get(deleteId)
      if (currentItem && currentItem.timeoutId === timeoutId && currentItem.isActive) {
        currentItem.isActive = false
        activeDeletes.value.delete(deleteId)
        await onConfirm()
      }
    }, duration)

    item.timeoutId = timeoutId
    activeDeletes.value.set(deleteId, item)
  }

  const cancelDelete = async (id: string | number): Promise<boolean> => {
    const deleteId = String(id)
    const item = activeDeletes.value.get(deleteId)
    if (item) {
      item.isActive = false
      if (item.timeoutId) {
        clearTimeout(item.timeoutId)
      }
      if (item.onUndo) {
        await item.onUndo()
      }
      activeDeletes.value.delete(deleteId)
      return true
    }
    return false
  }

  const getItem = (id: string | number): UndoableDeleteItem | undefined => {
    return activeDeletes.value.get(String(id))
  }

  const hasActiveDelete = (id: string | number): boolean => {
    return activeDeletes.value.has(String(id))
  }

  return {
    items,
    startDelete,
    cancelDelete,
    getItem,
    hasActiveDelete,
  }
}

