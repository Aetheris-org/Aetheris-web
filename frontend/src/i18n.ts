import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'
import es from './locales/es.json'
import fr from './locales/fr.json'

// Определение доступных языков
export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

// Получение языка из localStorage или определение языка браузера
const getDefaultLocale = (): string => {
  const savedLocale = localStorage.getItem('preferred-language')
  if (savedLocale && availableLocales.some(locale => locale.code === savedLocale)) {
    return savedLocale
  }
  
  const browserLocale = navigator.language.split('-')[0]
  const supportedLocale = availableLocales.find(locale => locale.code === browserLocale)
  return supportedLocale ? supportedLocale.code : 'en'
}

// Создание экземпляра i18n
const i18n = createI18n({
  legacy: false, // Используем Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
    es,
    fr
  }
})

// Функция для смены языка
export const setLocale = (locale: string) => {
  if (availableLocales.some(loc => loc.code === locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('preferred-language', locale)
  }
}

// Функция для получения текущего языка
export const getCurrentLocale = () => i18n.global.locale.value

// Функция для получения данных текущего языка
export const getCurrentLocaleData = () => {
  const currentLocale = getCurrentLocale()
  return availableLocales.find(locale => locale.code === currentLocale)
}

export default i18n
