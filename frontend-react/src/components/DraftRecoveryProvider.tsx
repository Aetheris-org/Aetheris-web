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
  const [hasChecked, setHasChecked] = useState(false)
  const recoveryDraftRef = useRef<{ data: DraftData; key: string } | null>(null)
  
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

  useEffect(() => {
    // Если мы на странице создания статьи, не показываем модальное окно
    if (location.pathname === '/create') {
      setHasChecked(true)
      setRecoveryDraft(null)
      return
    }

    // Проверяем только если пользователь авторизован
    if (!user) {
      setHasChecked(true)
      setRecoveryDraft(null)
      return
    }

    // Сбрасываем состояние при смене страницы (но только если не на /create и пользователь авторизован)
    setHasChecked(false)
    setRecoveryDraft(null)

    // Функция проверки localStorage
    const checkLocalStorage = () => {
      // Проверяем localStorage на наличие несохраненных черновиков
      try {
        const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
        
        logger.debug('[DraftRecoveryProvider] Checking localStorage:', { 
          keysCount: localStorageKeys.length,
          pathname: location.pathname 
        })
        
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
          // Устанавливаем recoveryDraft только если его еще нет (чтобы не перезаписывать)
          setRecoveryDraft(prev => {
            if (!prev) {
              return { data: latestDraft, key: latestKey }
            }
            return prev
          })
        } else {
          logger.debug('[DraftRecoveryProvider] No unsaved drafts found', {
            keysCount: localStorageKeys.length,
            processedCount: processedKeys.size,
            pathname: location.pathname
          })
        }
      } catch (error) {
        logger.warn('[DraftRecoveryProvider] Failed to check localStorage:', error)
      } finally {
        setHasChecked(true)
      }
    }

    // Проверяем с несколькими задержками для надежности
    // Это нужно, потому что при переходе со страницы /create данные могут сохраняться
    // в localStorage в момент размонтирования, и нужно дать время на сохранение
    logger.debug('[DraftRecoveryProvider] Starting checks for pathname:', location.pathname)
    
    // Небольшая задержка перед первой проверкой, чтобы дать время localStorage обновиться
    const checkTimeout0 = setTimeout(checkLocalStorage, 100) // Первая проверка через 100ms
    const checkTimeout1 = setTimeout(checkLocalStorage, 500) // Вторая проверка через 500ms
    const checkTimeout2 = setTimeout(checkLocalStorage, 1000) // Третья проверка через 1 секунду
    const checkTimeout3 = setTimeout(checkLocalStorage, 2000) // Четвертая проверка через 2 секунды (на случай медленного сохранения)

    // Также слушаем изменения в localStorage
    // ВАЖНО: Событие storage срабатывает только между разными вкладками,
    // но для той же вкладки нужно проверять вручную
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('draft_') && e.newValue) {
        logger.debug('[DraftRecoveryProvider] Storage changed (cross-tab), rechecking:', { key: e.key })
        setTimeout(checkLocalStorage, 100)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Периодическая проверка для отслеживания изменений в той же вкладке
    // Это нужно, потому что событие storage не срабатывает в той же вкладке
    const intervalId = setInterval(() => {
      // Проверяем только если мы не на /create, пользователь авторизован и еще не нашли черновик
      if (location.pathname !== '/create' && user) {
        // Проверяем, не было ли показано модальное окно уже (используем ref для актуального состояния)
        if (!recoveryDraftRef.current) {
          checkLocalStorage()
        } else {
          // Если уже нашли черновик, останавливаем проверку
          clearInterval(intervalId)
        }
      }
    }, 2000) // Проверяем каждые 2 секунды, если модальное окно еще не показано

    return () => {
      clearTimeout(checkTimeout0)
      clearTimeout(checkTimeout1)
      clearTimeout(checkTimeout2)
      clearTimeout(checkTimeout3)
      clearInterval(intervalId)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user, location.pathname]) // Убрали recoveryDraft из зависимостей, чтобы не вызывать лишние проверки

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
