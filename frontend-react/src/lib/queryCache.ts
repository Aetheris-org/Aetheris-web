/**
 * Персистентное кэширование для TanStack Query
 * Сохраняет кэш в localStorage и восстанавливает при перезагрузке страницы
 */
import { QueryClient } from '@tanstack/react-query'

const CACHE_KEY = 'react-query-cache'
const CACHE_VERSION = '1.0.0'
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 часа

interface CacheEntry {
  version: string
  timestamp: number
  data: any
}

/**
 * Сохранить кэш в localStorage
 */
export function persistCache(queryClient: QueryClient) {
  try {
    const cache = queryClient.getQueryCache().getAll()
    const cacheData: Record<string, any> = {}

    cache.forEach((query) => {
      const queryKey = JSON.stringify(query.queryKey)
      const state = query.state

      // Сохраняем только успешные запросы с данными
      if (state.status === 'success' && state.data !== undefined) {
        // Пропускаем большие объекты (например, изображения)
        const dataSize = JSON.stringify(state.data).length
        if (dataSize > 5 * 1024 * 1024) {
          // Пропускаем объекты больше 5MB
          return
        }

        cacheData[queryKey] = {
          data: state.data,
          dataUpdatedAt: state.dataUpdatedAt,
          status: state.status,
        }
      }
    })

    const cacheEntry: CacheEntry = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data: cacheData,
    }

    const serialized = JSON.stringify(cacheEntry)
    
    // Проверяем размер перед сохранением (localStorage ограничен ~5-10MB)
    if (serialized.length > 4 * 1024 * 1024) {
      console.warn('[QueryCache] Cache too large, skipping persistence')
      return
    }

    localStorage.setItem(CACHE_KEY, serialized)
  } catch (error) {
    // Ошибка может быть из-за переполнения localStorage или других проблем
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('[QueryCache] localStorage quota exceeded, clearing old cache')
      clearCache()
    } else {
      console.warn('[QueryCache] Failed to persist cache:', error)
    }
  }
}

/**
 * Восстановить кэш из localStorage
 */
export function restoreCache(queryClient: QueryClient) {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return

    const cacheEntry: CacheEntry = JSON.parse(cached)

    // Проверяем версию и возраст кэша
    if (cacheEntry.version !== CACHE_VERSION) {
      console.log('[QueryCache] Cache version mismatch, clearing cache')
      localStorage.removeItem(CACHE_KEY)
      return
    }

    const cacheAge = Date.now() - cacheEntry.timestamp
    if (cacheAge > MAX_CACHE_AGE) {
      console.log('[QueryCache] Cache too old, clearing cache')
      localStorage.removeItem(CACHE_KEY)
      return
    }

    // Восстанавливаем кэш
    let restoredCount = 0
    Object.entries(cacheEntry.data).forEach(([queryKey, queryState]) => {
      try {
        const key = JSON.parse(queryKey)
        queryClient.setQueryData(key, queryState.data, {
          updatedAt: queryState.dataUpdatedAt,
        })
        restoredCount++
      } catch (error) {
        console.warn('[QueryCache] Failed to restore query:', queryKey, error)
      }
    })

    if (restoredCount > 0) {
      console.log(`[QueryCache] Restored ${restoredCount} queries from cache`)
    }
  } catch (error) {
    console.warn('[QueryCache] Failed to restore cache:', error)
    localStorage.removeItem(CACHE_KEY)
  }
}

/**
 * Очистить кэш
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('[QueryCache] Failed to clear cache:', error)
  }
}

let saveTimeout: NodeJS.Timeout | null = null

/**
 * Настроить автоматическое сохранение кэша
 */
export function setupCachePersistence(queryClient: QueryClient) {
  // Восстанавливаем кэш при инициализации (синхронно, до рендера)
  restoreCache(queryClient)

  // Сохраняем кэш при изменениях (с дебаунсом)
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'updated' || event?.type === 'added') {
      // Дебаунс сохранения, чтобы не спамить localStorage
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      saveTimeout = setTimeout(() => {
        persistCache(queryClient)
      }, 2000) // Сохраняем через 2 секунды после последнего изменения
    }
  })

  // Сохраняем кэш перед закрытием страницы
  if (typeof window !== 'undefined') {
    const handleBeforeUnload = () => {
      persistCache(queryClient)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Также сохраняем периодически (каждые 30 секунд)
    const intervalId = setInterval(() => {
      persistCache(queryClient)
    }, 30 * 1000)

    // Cleanup функция
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(intervalId)
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      unsubscribe()
    }
  }

  return unsubscribe
}

