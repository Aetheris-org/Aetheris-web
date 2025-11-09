import { ref, watch, onMounted } from 'vue'

export type Theme = 'system' | 'white' | 'oled' | 'night-dark'

export function useTheme() {
  const selectedTheme = ref<Theme>('night-dark')
  const isSystemDark = ref(false)

  // Функция для работы с cookies
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Проверка системной темы
  const checkSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isSystemDark.value = true
    } else {
      isSystemDark.value = false
    }
  }

  // Применение темы
  const applyTheme = (theme: Theme) => {
    let actualTheme = theme

    // Если выбрана системная тема, определяем актуальную тему
    if (theme === 'system') {
      actualTheme = isSystemDark.value ? 'night-dark' : 'white'
    }

    // Применяем тему к документу
    document.documentElement.setAttribute('data-theme', actualTheme)
    
    // Сохраняем в cookies
    setCookie('theme', theme)
  }

  // Выбор темы
  const selectTheme = (theme: Theme) => {
    selectedTheme.value = theme
    applyTheme(theme)
  }

  // Инициализация темы при загрузке
  const initializeTheme = () => {
    // Проверяем системную тему
    checkSystemTheme()

    // Получаем сохраненную тему из cookies
    const savedTheme = getCookie('theme') as Theme
    if (savedTheme && ['system', 'white', 'oled', 'night-dark'].includes(savedTheme)) {
      selectedTheme.value = savedTheme
    }

    // Применяем тему
    applyTheme(selectedTheme.value)

    // Слушаем изменения системной темы
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', checkSystemTheme)
    }
  }

  // Следим за изменениями системной темы
  watch(isSystemDark, () => {
    if (selectedTheme.value === 'system') {
      applyTheme('system')
    }
  })

  // Инициализация при монтировании
  onMounted(() => {
    initializeTheme()
  })

  return {
    selectedTheme,
    selectTheme,
    isSystemDark
  }
}