import './assets/main.scss';

console.log(import.meta.env)
console.log('IMGBB KEY from main:', import.meta.env.VITE_IMGBB_API_KEY)

// Инициализация шрифта статей при загрузке приложения
import { useArticleFont } from '@/composables/useArticleFont'
if (typeof document !== 'undefined') {
  useArticleFont().initFont()
}

// Инициализация темы при загрузке приложения
const initializeAppTheme = () => {
  // Функция для работы с cookies
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
      return 'night-dark'
    } else {
      return 'white'
    }
  }

  // Получаем сохраненную тему из cookies
  const savedTheme = getCookie('theme')
  let theme = 'night-dark' // тема по умолчанию

  if (savedTheme && ['system', 'white', 'oled', 'night-dark'].includes(savedTheme)) {
    if (savedTheme === 'system') {
      theme = checkSystemTheme()
    } else {
      theme = savedTheme
    }
  }

  // Применяем тему
  document.documentElement.setAttribute('data-theme', theme)
}

// Инициализируем тему
initializeAppTheme();

//primeui
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import Editor from 'primevue/editor';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

//vue
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router';
import { useAuthStore } from '@/stores/auth'
import i18n from './i18n'

console.log('Vue app started/Веб приложение запущено');
const app = createApp(App);
const pinia = createPinia()

app.use(PrimeVue, {
    theme: { preset: Aura }
});
app.use(ToastService)
app.use(pinia)
// Restore auth BEFORE installing router so guards see correct auth state
const auth = useAuthStore()
auth.tryRestoreFromStorage()

app.use(i18n)

app.component('Editor', Editor);
app.component('Toast', Toast)
app.use(router);

app.mount('#app');

// Global listener to show auth-required toast
document.addEventListener('auth-required', (e: any) => {
  const { detail } = e
  // Find any mounted vue app root with toast service
  try {
    // @ts-ignore
    const { t } = i18n.global
    app.config.globalProperties.$toast.add({ 
      severity: 'warn', 
      summary: t('notifications.authRequired.actionRequired.summary'), 
      detail: t('notifications.authRequired.actionRequired.detail'), 
      life: 4000 
    })
  } catch {}
})

// Generic app toast with i18n keys
document.addEventListener('app-toast', (e: any) => {
  const { detail } = e || {}
  try {
    const summary = detail?.summaryKey ? i18n.global.t(detail.summaryKey, detail.params || {}) : (detail?.summary || '')
    const msg = detail?.detailKey ? i18n.global.t(detail.detailKey, detail.params || {}) : (detail?.detail || '')
    // @ts-ignore
    app.config.globalProperties.$toast.add({
      severity: detail?.severity || 'info',
      summary,
      detail: msg,
      life: detail?.life || 4000
    })
  } catch {}
})
