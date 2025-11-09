import { ref, computed, watch, onMounted } from 'vue'

export type FontKey = 'comfortaa' | 'roboto' | 'opensans' | 'lato' | 'montserrat'

interface FontData {
  name: string
  family: string
}

export const fonts: Record<FontKey, FontData> = {
  'comfortaa': { name: 'Comfortaa', family: "'Comfortaa', cursive" },
  'roboto': { name: 'Roboto', family: "'Roboto', sans-serif" },
  'opensans': { name: 'Open Sans', family: "'Open Sans', sans-serif" },
  'lato': { name: 'Lato', family: "'Lato', sans-serif" },
  'montserrat': { name: 'Montserrat', family: "'Montserrat', sans-serif" }
}

const STORAGE_KEY = 'selected-font'
const DEFAULT_FONT: FontKey = 'comfortaa'

// Глобальное состояние шрифта
const selectedFont = ref<FontKey>(DEFAULT_FONT)

export function useArticleFont() {
  // Инициализация из localStorage
  const initFont = () => {
    const savedFont = localStorage.getItem(STORAGE_KEY) as FontKey
    if (savedFont && fonts[savedFont]) {
      selectedFont.value = savedFont
    } else {
      selectedFont.value = DEFAULT_FONT
    }
    applyFontToDocument()
  }

  // Применение шрифта к документу через CSS переменную
  const applyFontToDocument = () => {
    const fontFamily = fonts[selectedFont.value].family
    document.documentElement.style.setProperty('--article-font-family', fontFamily)
    
    // Отправляем событие для обновления компонентов
    window.dispatchEvent(new CustomEvent('article:fontChanged', { 
      detail: { font: selectedFont.value, fontFamily } 
    }))
  }

  // Выбор шрифта
  const selectFont = (font: FontKey) => {
    if (!fonts[font]) {
      console.warn(`Font ${font} not found`)
      return
    }
    selectedFont.value = font
    localStorage.setItem(STORAGE_KEY, font)
    applyFontToDocument()
  }

  // Получение текущего шрифта
  const getCurrentFont = computed(() => selectedFont.value)
  const getCurrentFontFamily = computed(() => fonts[selectedFont.value].family)
  const getCurrentFontName = computed(() => fonts[selectedFont.value].name)

  // Инициализация при монтировании
  onMounted(() => {
    initFont()
  })

  // Слушаем изменения в localStorage (для синхронизации между вкладками)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newFont = e.newValue as FontKey
        if (fonts[newFont]) {
          selectedFont.value = newFont
          applyFontToDocument()
        }
      }
    })
  }

  return {
    selectedFont: computed(() => selectedFont.value),
    selectFont,
    getCurrentFont,
    getCurrentFontFamily,
    getCurrentFontName,
    fonts,
    initFont,
    // Экспортируем ref напрямую для использования в шаблонах (опционально)
    selectedFontRef: selectedFont
  }
}

// Инициализация при импорте (для глобального применения)
if (typeof document !== 'undefined') {
  const savedFont = localStorage.getItem(STORAGE_KEY) as FontKey
  const initialFont = (savedFont && fonts[savedFont]) ? savedFont : DEFAULT_FONT
  selectedFont.value = initialFont
  const fontFamily = fonts[initialFont].family
  document.documentElement.style.setProperty('--article-font-family', fontFamily)
}

