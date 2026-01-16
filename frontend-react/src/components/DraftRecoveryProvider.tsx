import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DraftRecoveryDialog } from './DraftRecoveryDialog'
import { logger } from '@/lib/logger'
import { useAuthStore } from '@/stores/authStore'

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

export function DraftRecoveryProvider() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [recoveryDraft, setRecoveryDraft] = useState<{ data: DraftData; key: string } | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  // Получаем список обработанных ключей из sessionStorage
  const getProcessedKeys = (): Set<string> => {
    try {
      const stored = sessionStorage.getItem('draftRecovery_processed')
      if (stored) {
        return new Set(JSON.parse(stored))
      }
    } catch (error) {
      logger.warn('[DraftRecoveryProvider] Failed to get processed keys:', error)
    }
    return new Set()
  }

  // Сохраняем обработанный ключ в sessionStorage
  const markAsProcessed = (key: string) => {
    try {
      const processed = getProcessedKeys()
      processed.add(key)
      sessionStorage.setItem('draftRecovery_processed', JSON.stringify([...processed]))
      logger.debug('[DraftRecoveryProvider] Marked draft as processed:', { key })
    } catch (error) {
      logger.warn('[DraftRecoveryProvider] Failed to mark draft as processed:', error)
    }
  }

  useEffect(() => {
    // Проверяем только если пользователь авторизован и мы не на странице создания статьи
    if (!user || location.pathname === '/create') {
      setHasChecked(true)
      return
    }

    // Проверяем localStorage на наличие несохраненных черновиков
    try {
      const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
      
      if (localStorageKeys.length === 0) {
        setHasChecked(true)
        return
      }

      // Находим самый свежий черновик
      let latestDraft: DraftData | null = null
      let latestKey: string | null = null
      let latestTime = 0

      const processedKeys = getProcessedKeys()

      for (const key of localStorageKeys) {
        try {
          // Пропускаем уже обработанные ключи
          if (processedKeys.has(key)) {
            continue
          }

          // Проверяем, что ключ все еще существует в localStorage
          const data = localStorage.getItem(key)
          if (!data) continue

          const parsed = JSON.parse(data) as DraftData
          
          // Проверяем, что есть хотя бы какой-то контент
          const hasContent = parsed.title?.trim() || 
                            parsed.contentHTML?.trim() || 
                            parsed.contentJSON ||
                            parsed.excerpt?.trim()
          
          if (!hasContent) continue

          if (parsed.savedAt) {
            const savedTime = new Date(parsed.savedAt).getTime()
            if (savedTime > latestTime) {
              latestTime = savedTime
              latestDraft = parsed
              latestKey = key
            }
          } else if (!latestDraft) {
            // Если нет savedAt, но есть контент, используем его как резервный вариант
            latestDraft = parsed
            latestKey = key
          }
        } catch (error) {
          logger.warn('[DraftRecoveryProvider] Failed to parse localStorage draft:', { key, error })
        }
      }

      if (latestDraft && latestKey) {
        logger.debug('[DraftRecoveryProvider] Found unsaved draft:', { key: latestKey })
        setRecoveryDraft({ data: latestDraft, key: latestKey })
      }
    } catch (error) {
      logger.warn('[DraftRecoveryProvider] Failed to check localStorage:', error)
    } finally {
      setHasChecked(true)
    }
  }, [user, location.pathname])

  const handleClose = () => {
    // При закрытии модального окна сбрасываем состояние
    // Если пользователь закроет окно без действия, плашка появится снова при следующей проверке
    setRecoveryDraft(null)
  }

  const handleDraftProcessed = (key: string) => {
    // Помечаем ключ как обработанный в sessionStorage
    markAsProcessed(key)
    setRecoveryDraft(null)
  }

  // Не показываем диалог, если мы на странице создания статьи или еще не проверили
  if (!hasChecked || !recoveryDraft || location.pathname === '/create') {
    return null
  }

  return (
    <DraftRecoveryDialog
      draftData={recoveryDraft.data}
      localStorageKey={recoveryDraft.key}
      onClose={handleClose}
      onProcessed={handleDraftProcessed}
    />
  )
}
