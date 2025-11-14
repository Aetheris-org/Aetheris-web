/**
 * i18n Store
 * 
 * Управление языком интерфейса
 * Поддерживаемые языки: русский (ru), английский (en)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ru' | 'en'

interface I18nState {
  language: Language
  setLanguage: (language: Language) => void
  initialize: () => void
}

const DEFAULT_LANGUAGE: Language = 'en'

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      
      setLanguage: (language: Language) => {
        set({ language })
        // Обновляем атрибут lang на html элементе
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language
        }
      },
      
      initialize: () => {
        if (typeof document !== 'undefined') {
          // Получаем сохраненный язык
          const stored = localStorage.getItem('aetheris-i18n')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.state?.language && (parsed.state.language === 'ru' || parsed.state.language === 'en')) {
                document.documentElement.lang = parsed.state.language
                // Zustand persist автоматически восстановит состояние, поэтому здесь не нужно set
                return
              }
            } catch {
              // Игнорируем ошибки парсинга
            }
          }
          
          // Если сохраненного языка нет, определяем язык из браузера
          const browserLang = navigator.language.toLowerCase()
          const detectedLang: Language = browserLang.startsWith('ru') ? 'ru' : 'en'
          document.documentElement.lang = detectedLang
          // Устанавливаем язык в store (persist сохранит его автоматически)
          set({ language: detectedLang })
        }
      },
    }),
    {
      name: 'aetheris-i18n',
      version: 1,
    }
  )
)

