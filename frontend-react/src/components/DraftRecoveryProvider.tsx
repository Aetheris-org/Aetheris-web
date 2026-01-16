import { useEffect, useState, useRef } from 'react'
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
  const recoveryDraftRef = useRef<{ data: DraftData; key: string } | null>(null)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Синхронизируем ref с state
  useEffect(() => {
    recoveryDraftRef.current = recoveryDraft
  }, [recoveryDraft])

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

  // Функция проверки localStorage
  const checkLocalStorage = () => {
    // Если мы на странице создания статьи, не показываем модальное окно
    if (location.pathname === '/create') {
      setRecoveryDraft(null)
      return
    }

    // Проверяем только если пользователь авторизован
    if (!user) {
      setRecoveryDraft(null)
      return
    }

    // Проверяем localStorage на наличие несохраненных черновиков
    try {
      const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
      
      logger.debug('[DraftRecoveryProvider] Checking localStorage:', { 
        keysCount: localStorageKeys.length,
        pathname: location.pathname 
      })
      
      if (localStorageKeys.length === 0) {
        setRecoveryDraft(null)
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
            logger.debug('[DraftRecoveryProvider] Skipping processed key:', { key })
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
          
          if (!hasContent) {
            logger.debug('[DraftRecoveryProvider] Skipping empty draft:', { key })
            continue
          }

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
        logger.debug('[DraftRecoveryProvider] Found unsaved draft:', { 
          key: latestKey,
          title: latestDraft.title,
          pathname: location.pathname,
          savedAt: latestDraft.savedAt
        })
        // Устанавливаем recoveryDraft (обновляем если изменился)
        setRecoveryDraft(prev => {
          // Если уже есть черновик с таким же ключом, не обновляем (чтобы не сбрасывать состояние диалога)
          if (prev && prev.key === latestKey) {
            return prev
          }
          return { data: latestDraft!, key: latestKey! }
        })
      } else {
        logger.debug('[DraftRecoveryProvider] No unsaved drafts found', {
          keysCount: localStorageKeys.length,
          processedCount: processedKeys.size,
          pathname: location.pathname
        })
        // Если не нашли черновик, сбрасываем состояние
        setRecoveryDraft(null)
      }
    } catch (error) {
      logger.warn('[DraftRecoveryProvider] Failed to check localStorage:', error)
    }
  }

  // Основной эффект для постоянной проверки
  useEffect(() => {
    // Сбрасываем черновик при смене страницы на /create
    if (location.pathname === '/create') {
      setRecoveryDraft(null)
      return
    }

    // Проверяем только если пользователь авторизован
    if (!user) {
      setRecoveryDraft(null)
      return
    }

    logger.debug('[DraftRecoveryProvider] Setting up checks for pathname:', location.pathname)

    // Первая проверка сразу
    checkLocalStorage()
    
    // Проверки с задержками для надежности (на случай асинхронного сохранения)
    const checkTimeout0 = setTimeout(checkLocalStorage, 100)
    const checkTimeout1 = setTimeout(checkLocalStorage, 500)
    const checkTimeout2 = setTimeout(checkLocalStorage, 1000)
    const checkTimeout3 = setTimeout(checkLocalStorage, 2000)

    // Слушаем изменения в localStorage (для кросс-таб)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('draft_')) {
        logger.debug('[DraftRecoveryProvider] Storage changed (cross-tab), rechecking:', { key: e.key })
        setTimeout(checkLocalStorage, 100)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Постоянная периодическая проверка каждые 2 секунды
    // Это обеспечивает обнаружение черновиков на любой странице
    checkIntervalRef.current = setInterval(() => {
      if (location.pathname !== '/create' && user) {
        checkLocalStorage()
      }
    }, 2000)

    return () => {
      clearTimeout(checkTimeout0)
      clearTimeout(checkTimeout1)
      clearTimeout(checkTimeout2)
      clearTimeout(checkTimeout3)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      window.removeEventListener('storage', handleStorageChange)
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

  // Не показываем диалог, если мы на странице создания статьи или нет черновика
  if (!recoveryDraft || location.pathname === '/create' || !user) {
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
