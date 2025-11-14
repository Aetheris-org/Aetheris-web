/**
 * Translation Hook
 * 
 * Хук для получения переводов в компонентах
 */

import { useMemo } from 'react'
import { useI18nStore } from '@/stores/i18nStore'
import enTranslations from '@/locales/en.json'
import ruTranslations from '@/locales/ru.json'

type Translations = typeof enTranslations

// Загружаем переводы в зависимости от языка
const translations: Record<'en' | 'ru', Translations> = {
  en: enTranslations,
  ru: ruTranslations,
}

/**
 * Получить значение из вложенного объекта по пути
 * Например: 'settings.profile.title' -> translations.settings.profile.title
 */
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.')
  let value = obj
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return path // Возвращаем путь, если значение не найдено
    }
    value = value[key]
  }
  
  return typeof value === 'string' ? value : path
}

/**
 * Заменить плейсхолдеры в строке
 * Например: "Hello {name}" с { name: "World" } -> "Hello World"
 * Поддерживает простую плюрализацию: "{count, plural, one {день} few {дня} other {дней}}"
 */
function replacePlaceholders(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  // Сначала обрабатываем плюрализацию
  let result = text.replace(/\{(\w+),\s*plural,\s*one\s*\{([^}]+)\}\s*few\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g, (match, key, one, few, other) => {
    const count = params[key]
    if (count === undefined) return match
    
    const num = Number(count)
    if (isNaN(num)) return match
    
    // Русская плюрализация: 1, 21, 31... -> one; 2-4, 22-24... -> few; остальные -> other
    const mod10 = num % 10
    const mod100 = num % 100
    
    if (mod100 >= 11 && mod100 <= 14) {
      return other
    } else if (mod10 === 1) {
      return one
    } else if (mod10 >= 2 && mod10 <= 4) {
      return few
    } else {
      return other
    }
  })
  
  // Обрабатываем английскую плюрализацию (проще: one/other)
  result = result.replace(/\{(\w+),\s*plural,\s*one\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g, (match, key, one, other) => {
    const count = params[key]
    if (count === undefined) return match
    
    const num = Number(count)
    if (isNaN(num)) return match
    
    return num === 1 ? one : other
  })
  
  // Затем обрабатываем обычные плейсхолдеры
  result = result.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
  
  return result
}

export function useTranslation() {
  const language = useI18nStore((state) => state.language)
  
  const t = useMemo(() => {
    const currentTranslations = translations[language]
    
    return (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(currentTranslations, key)
      return replacePlaceholders(translation, params)
    }
  }, [language])
  
  return { t, language }
}

/**
 * Хук для получения перевода напрямую (без параметров)
 */
export function useT() {
  const { t } = useTranslation()
  return t
}

