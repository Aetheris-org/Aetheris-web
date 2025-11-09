<template>
  <!-- Прелоадер -->
  <AppPreloader ref="preloaderRef" />
  
  <!-- Основной контент с плавным появлением -->
  <Transition name="fade">
    <div v-show="isAppReady" class="app-content">
      <Toast />
      <PrivacyConsentBanner />
      <UndoToastsContainer />
      <div v-if="$route.name === 'Welcome'">
        <div class="app-wrapper home-header-wrapper">
          <AppHeader />
        </div>
        <router-view />
        <div class="app-wrapper">
          <AppFooter />
        </div>
      </div>
      
      <!-- Для остальных страниц с wrapper -->
      <div v-else class="app-page-layout">
        <div class="app-wrapper">
          <AppHeader />
          
          <main class="app-main">
            <router-view />
          </main>
        </div>
        
        <div class="app-wrapper">
          <AppFooter />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import AppPreloader from './components/AppPreloader.vue';
import UndoToastsContainer from './components/UndoToastsContainer.vue';
import PrivacyConsentBanner from './components/PrivacyConsentBanner.vue';
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const isAppReady = ref(false)
const preloaderRef = ref<InstanceType<typeof AppPreloader> | null>(null)

// Функция для проверки загрузки всех стилей
const checkStylesLoaded = (): Promise<void> => {
  return new Promise((resolve) => {
    // Проверяем наличие основных CSS переменных и стилей
    const checkCSSVars = () => {
      try {
        const root = getComputedStyle(document.documentElement)
        const hasBgPrimary = root.getPropertyValue('--bg-primary').trim()
        const hasTextPrimary = root.getPropertyValue('--text-primary').trim()
        const hasFontPrimary = root.getPropertyValue('--font-primary').trim()
        
        // Проверяем, что стили действительно применены (не пустые значения)
        return hasBgPrimary !== '' && hasTextPrimary !== '' && hasFontPrimary !== ''
      } catch {
        return false
      }
    }
    
    // Проверяем загрузку всех стилей через несколько проверок
    let checkCount = 0
    const maxChecks = 50 // Максимум 50 проверок (~2-3 секунды)
    
    const check = () => {
      checkCount++
      if (checkCSSVars() || checkCount >= maxChecks) {
        resolve()
      } else {
        requestAnimationFrame(check)
      }
    }
    
    // Даем время на применение стилей (ждем загрузки DOM)
    if (document.readyState === 'complete') {
      setTimeout(() => {
        requestAnimationFrame(check)
      }, 150)
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          requestAnimationFrame(check)
        }, 150)
      })
    }
  })
}

// Функция для проверки загрузки всех шрифтов
const checkFontsLoaded = (): Promise<void> => {
  return new Promise((resolve) => {
    // Используем Font Loading API если доступен
    if ('fonts' in document && document.fonts.ready) {
      // Ждем загрузки всех шрифтов
      document.fonts.ready.then(() => {
        // Дополнительная проверка основных шрифтов
        const fontsToCheck = ['Comfortaa', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']
        let loadedCount = 0
        
        const checkFont = (font: string) => {
          try {
            if ((document as any).fonts.check(`16px "${font}"`)) {
              loadedCount++
            }
          } catch {
            // Игнорируем ошибки проверки
          }
        }
        
        fontsToCheck.forEach(checkFont)
        
        // Даем время на полную загрузку и применение шрифтов
        setTimeout(() => {
          resolve()
        }, Math.max(300, 500 - loadedCount * 50))
      }).catch(() => {
        // В случае ошибки просто ждем некоторое время
        setTimeout(resolve, 1500)
      })
    } else {
      // Fallback: ждем некоторое время для загрузки шрифтов
      setTimeout(resolve, 1500)
    }
  })
}

// Основная функция инициализации
const initializeApp = async () => {
  // Принудительно устанавливаем тему при загрузке
  if (!document.documentElement.getAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', 'night-dark')
  }
  
  // Инициализируем authStore при загрузке приложения
  authStore.tryRestoreFromStorage()
  
  // Если есть токен, обновляем данные пользователя из API (включая аватар)
  // Это важно, так как данные в localStorage могут быть устаревшими
  if (authStore.token && authStore.isAuthenticated) {
    try {
      await authStore.fetchMe()
    } catch (error) {
      // Игнорируем ошибки при восстановлении - если токен невалидный,
      // это обработается при следующем запросе к API
      console.warn('Failed to fetch user data on app init:', error)
    }
  }
  
  // Ждем загрузки стилей и шрифтов
  await Promise.all([
    checkStylesLoaded(),
    checkFontsLoaded()
  ])
  
  // Дополнительная небольшая задержка для плавности
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Показываем контент
  await nextTick()
  isAppReady.value = true
  
  // Скрываем прелоадер после небольшой задержки
  await new Promise(resolve => setTimeout(resolve, 300))
  if (preloaderRef.value) {
    preloaderRef.value.hide()
  }
}

onMounted(() => {
  // Защита от зависания прелоадера - принудительно скрываем через 15 секунд
  const fallbackTimeout = setTimeout(() => {
    console.warn('App initialization timeout - forcing app ready')
    isAppReady.value = true
    if (preloaderRef.value) {
      preloaderRef.value.hide()
    }
  }, 15000)
  
  initializeApp().finally(() => {
    clearTimeout(fallbackTimeout)
  })
})
</script>

<style lang="scss" scoped>
.app-wrapper {
  background-color: var(--bg-primary);
  min-height: auto;
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 20px;
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 16px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 90%;
    padding: 0 20px;
  }
  
  /* Десктоп небольшой */
  @media (min-width: 1025px) and (max-width: 1440px) {
    width: 85%;
    max-width: 1200px;
    padding: 0 24px;
  }
  
  /* Десктоп средний */
  @media (min-width: 1441px) and (max-width: 1920px) {
    width: 80%;
    max-width: 1400px;
    padding: 0 28px;
  }
  
  /* Большие экраны */
  @media (min-width: 1921px) {
    width: 75%;
    max-width: 1600px;
    padding: 0 32px;
  }
}

.app-main {
  padding: 0;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Специальный стиль,применяется только к home page,
чтоб не было проблем с отображением элементов хэдера*/
.home-header-wrapper {
  min-height: 100px !important;
  height: 100px;
}

/* Анимация появления контента */
.app-content {
  opacity: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.app-page-layout .app-wrapper {
  flex: 1 0 auto;
}

.fade-enter-active {
  transition: opacity 0.6s ease-in;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}
</style>
