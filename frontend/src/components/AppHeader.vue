<template>
  <div class="header-container" :class="{ 'home-page': isWelcomePage, 'admin-access': auth.isAuthenticated, 'scrolled': isScrolled, 'header-hidden': !isHeaderVisible, 'no-blur': isNotificationsPage }">
    <!-- Левая группа: Logo и Navigation -->
    <div class="header-left">
      <router-link to="/" class="header-brand-link">
        <Logo class="logo" />
        <p class="header-title">Aetheris Community</p>
      </router-link>

      <button type="button" id="nav-btn" class="nav-button">
        <NavigationIcon class="nav-icon" />
        <p class="button-text">{{ currentNavigationPage }}</p>
        <DropdownIcon class="dropdown-icon nav-arrow" />
      </button>
    </div>

    <!-- Центральная группа: FAQ -->
    <div class="header-center">
      <button type="button" id="faq-btn" class="faq-button">
        <FAQIcon class="faq-icon" />
        <p class="button-text">{{ currentFaqPage }}</p>
        <DropdownIcon class="dropdown-icon faq-arrow" />
      </button>
    </div>

    <!-- Правая группа: Create, View и Profile -->
    <div class="header-right">
      <!-- Отдельная кнопка создания статьи -->
      <router-link to="/create-article" class="create-button-link">
        <button class="create-button" type="button" aria-label="Create article">
          <AddIcon class="add-icon" />
        </button>
      </router-link>

      <!-- Кнопка выбора отображения статей -->
      <button id="view-btn" class="additional-button" type="button" :title="currentViewTitle" aria-label="Change view">
        <!-- Текущая иконка режима -->
        <template v-if="currentViewMode === 'line'">
          <svg class="panel-icon" width="25" height="18" viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.625 8.83026H23.375M1.625 1.08545H23.375M1.625 16.5751H23.375" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        <template v-else-if="currentViewMode === 'square'">
          <svg class="panel-icon" width="25" height="25" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0833 3.87256H3.625V12.9082H12.0833V3.87256Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M25.375 3.87256H16.9167V12.9082H25.375V3.87256Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M25.375 18.0714H16.9167V27.107H25.375V18.0714Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.0833 18.0714H3.625V27.107H12.0833V18.0714Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        <template v-else>
          <svg class="panel-icon" width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.375 13.5669V22.6025C23.375 23.2872 23.1204 23.9439 22.6672 24.428C22.214 24.9121 21.5993 25.1841 20.9583 25.1841H4.04167C3.40073 25.1841 2.78604 24.9121 2.33283 24.428C1.87961 23.9439 1.625 23.2872 1.625 22.6025V13.5669M23.375 13.5669V4.53131C23.375 3.84663 23.1204 3.18999 22.6672 2.70584C22.214 2.2217 21.5993 1.94971 20.9583 1.94971H4.04167C3.40073 1.94971 2.78604 2.2217 2.33283 2.70584C1.87961 3.18999 1.625 3.84663 1.625 4.53131V13.5669M23.375 13.5669H1.625" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </button>

      <!-- Кнопка входа/регистрации для незарегистрированных -->
      <router-link v-if="!auth.isAuthenticated" to="/auth" class="login-button-link">
        <button class="login-button">
          <ProfileIcon class="login-icon" />
          <p class="login-text">{{ t('form.signin.title') }}</p>
        </button>
      </router-link>

      <!-- Кнопка профиля для зарегистрированных -->
      <button v-else id="logo-btn" class="profile-button">
        <div class="profile-avatar">
          <AvatarImage :src="safeProfileAvatarUrl || null" :alt="auth.user?.nickname || 'Profile'" />
        </div>
        <DropdownIcon class="dropdown-icon profile-arrow" />
      </button>
    </div>
  </div>

  <!-- Navigation panel -->
  <div id="navigation_panel" class="dropdown-panel navigation-panel hidden opacity-0 pointer-events-none">
    <div class="panel-content">
      <router-link to="/home">
        <button class="panel-button" :class="{ 'active': route.path === '/home' && route.name === 'Welcome' }">
          <HomeIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.navigation.title1') }}</p>
        </button>
      </router-link>

      <router-link to="/">
        <button class="panel-button" :class="{ 'active': route.path === '/' && route.name === 'HomePage' }">
          <ArticlesIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.navigation.title2') }}</p>
        </button>
      </router-link>

      <router-link to="/articles/interactive">
        <button class="panel-button" :class="{ 'active': (route.path === '/articles/interactive' && route.name === 'ArticlesInteractive') || (route.path.startsWith('/articles/interactive') && !route.path.startsWith('/articles/companies')) }">
          <InteractiveIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.navigation.title3') }}</p>
        </button>
      </router-link>

      <router-link to="/articles/companies">
        <button class="panel-button" :class="{ 'active': (route.path === '/articles/companies' && route.name === 'ArticlesCompanies') || route.path.startsWith('/articles/companies') }">
          <CompaniesIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.navigation.title4') }}</p>
        </button>
      </router-link>

      <router-link to="/events">
        <button class="panel-button" :class="{ 'active': route.path === '/events' || route.path.startsWith('/events') }">
          <CompaniesIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.navigation.title5') }}</p>
        </button>
      </router-link>
    </div>
  </div>

  <!-- FAQ navigation panel -->
  <div id="faq_navigation_panel" class="dropdown-panel faq-panel hidden opacity-0 pointer-events-none">
    <div class="panel-content">
      <router-link to="/faq">
        <button class="panel-button" :class="{ 'active': route.path === '/faq' || (route.path.startsWith('/faq') && route.path !== '/faq/help' && route.path !== '/faq/changes' && !route.path.startsWith('/faq/item')) }">
          <FAQIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.faq.title1') }}</p>
        </button>
      </router-link>

      <router-link to="/faq/help">
        <button class="panel-button" :class="{ 'active': route.path.startsWith('/faq/help') }">
          <HelpIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.faq.title2') }}</p>
        </button>
      </router-link>

      <router-link to="/faq/changes">
        <button class="panel-button" :class="{ 'active': route.path.startsWith('/faq/changes') }">
          <ChangesIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.faq.title3') }}</p>
        </button>
      </router-link>

      <router-link to="/legal/community-rules">
        <button class="panel-button" :class="{ 'active': route.path.startsWith('/legal/community-rules') }">
          <RulesIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.faq.title4') }}</p>
        </button>
      </router-link>
    </div>
  </div>

  <!-- View panel -->
  <div id="view_panel" class="dropdown-panel additional-panel hidden opacity-0 pointer-events-none">
    <div class="panel-content">
      <button class="panel-button" @click="setArticlesView('line')" :title="t('header.additional.title2')" aria-label="Line view">
        <svg class="panel-icon" width="25" height="18" viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.625 8.83026H23.375M1.625 1.08545H23.375M1.625 16.5751H23.375" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="panel-button" @click="setArticlesView('square')" :title="t('header.additional.title3')" aria-label="Grid view">
        <svg class="panel-icon" width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.0833 3.87256H3.625V12.9082H12.0833V3.87256Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M25.375 3.87256H16.9167V12.9082H25.375V3.87256Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M25.375 18.0714H16.9167V27.107H25.375V18.0714Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.0833 18.0714H3.625V27.107H12.0833V18.0714Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="panel-button" @click="setArticlesView('default')" :title="t('header.additional.title4')" aria-label="Default view">
        <svg class="panel-icon" width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.375 13.5669V22.6025C23.375 23.2872 23.1204 23.9439 22.6672 24.428C22.214 24.9121 21.5993 25.1841 20.9583 25.1841H4.04167C3.40073 25.1841 2.78604 24.9121 2.33283 24.428C1.87961 23.9439 1.625 23.2872 1.625 22.6025V13.5669M23.375 13.5669V4.53131C23.375 3.84663 23.1204 3.18999 22.6672 2.70584C22.214 2.2217 21.5993 1.94971 20.9583 1.94971H4.04167C3.40073 1.94971 2.78604 2.2217 2.33283 2.70584C1.87961 3.18999 1.625 3.84663 1.625 4.53131V13.5669M23.375 13.5669H1.625" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Profile panel -->
  <div id="profile_panel" class="dropdown-panel profile-panel hidden opacity-0 pointer-events-none">
    <div class="panel-content">
      <router-link to="/profile">
        <button class="panel-button">
          <ProfileIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title1') }}</p>
        </button>
      </router-link>

      <router-link to="/notifications">
        <button class="panel-button">
          <NotificationsIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title2') }}</p>
          <div v-if="hasUnread" class="notification-indicator"></div>
        </button>
      </router-link>

      <router-link to="/stared-articles">
        <button class="panel-button">
          <StarIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title3') }}</p>
        </button>
      </router-link>

      <router-link to="/settings/appearance">
        <button class="panel-button">
          <SettingsIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title4') }}</p>
        </button>
      </router-link>

      <div class="panel-divider"></div>

      <router-link to="/your-articles">
        <button class="panel-button">
          <EditIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title5') }}</p>
        </button>
      </router-link>

      <router-link to="/analytics">
        <button class="panel-button">
          <AnalyticsIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title7') }}</p>
        </button>
      </router-link>

      <router-link to="/balance">
        <button class="panel-button">
          <BalanceIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title8') }}</p>
        </button>
      </router-link>

      <div class="panel-divider"></div>

      <router-link to="/settings/subscription">
        <button class="panel-button">
          <CheckmarkIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title9') }}</p>
        </button>
      </router-link>


      <router-link to="/shop">
        <button class="panel-button">
          <ShopIcon class="panel-icon" />
          <p class="panel-text">{{ t('header.profile.title10') }}</p>
        </button>
      </router-link>

      <div class="panel-divider"></div>

        <button v-if="auth.isAuthenticated" class="panel-button sign-out-button" @click="signOut">
            <SignOutIcon class="panel-icon" color="currentColor" />
            <p class="panel-text">{{ t('header.profile.title11') }}</p>
        </button>
        <router-link v-else to="/auth">
          <button class="panel-button sign-in-button">
            <ProfileIcon class="panel-icon" />
            <p class="panel-text">{{ t('form.signin.title') }}</p>
          </button>
        </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch, nextTick, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useViewModeStore } from '@/stores/viewMode'
import Logo from './Logo.vue'
import NavigationIcon from '@/assets/icons/NavigationIcon.vue'
import DropdownIcon from '@/assets/icons/DropdownIcon.vue'
import HomeIcon from '@/assets/icons/HomeIcon.vue'
import ArticlesIcon from '@/assets/icons/ArticlesIcon.vue'
import InteractiveIcon from '@/assets/icons/InteractiveIcon.vue'
import CompaniesIcon from '@/assets/icons/CompaniesIcon.vue'
import FAQIcon from '@/assets/icons/FAQIcon.vue'
import HelpIcon from '@/assets/icons/HelpIcon.vue'
import AddIcon from '@/assets/icons/AddIcon.vue'
import ProfileIcon from '@/assets/icons/ProfileIcon.vue'
import NotificationsIcon from '@/assets/icons/NotificationsIcon.vue'
import StarIcon from '@/assets/icons/StarIcon.vue'
import SettingsIcon from '@/assets/icons/SettingsIcon.vue'
import EditIcon from '@/assets/icons/EditIcon.vue'
import DraftIcon from '@/assets/icons/DraftIcon.vue'
import AnalyticsIcon from '@/assets/icons/AnalyticsIcon.vue'
import BalanceIcon from '@/assets/icons/BalanceIcon.vue'
import CheckmarkIcon from '@/assets/icons/CheckmarkIcon.vue'
import ShopIcon from '@/assets/icons/ShopIcon.vue'
import SignOutIcon from '@/assets/icons/SignOutIcon.vue'
import ChangesIcon from '@/assets/icons/ChangesIcon.vue'
import RulesIcon from '@/assets/icons/RulesIcon.vue'
import EditorIcons from '@/assets/icons/EditorIcons.vue'
import { useI18n } from 'vue-i18n'
import { useNotifications } from '@/composables/useNotifications'
import { sanitizeAvatarUrl } from '@/utils/avatarValidation'
import AvatarImage from './AvatarImage.vue'

const { t } = useI18n()
const auth = useAuthStore()
const { unreadCount, hasUnread } = useNotifications()

// Avatar handling for profile button
const avatarError = ref(false)
const safeProfileAvatarUrl = computed(() => {
  if (avatarError.value) return null
  return sanitizeAvatarUrl(auth.user?.avatar)
})

const onAvatarError = () => {
  avatarError.value = true
}

// Reset avatar error when user avatar changes
watch(() => auth.user?.avatar, () => {
  avatarError.value = false
})

// Отслеживаем изменения auth.user (важно после логина после очистки кеша)
watch(() => auth.user, (newUser) => {
  // Сбрасываем ошибку аватара при изменении пользователя
  if (newUser) {
    avatarError.value = false
  }
}, { deep: true })

// Route setup
const route = useRoute()
const router = useRouter()
const isWelcomePage = computed(() => route.name === 'Welcome')
const isNotificationsPage = computed(() => route.name === 'Notifications' || route.path === '/notifications')

// Текущий режим отображения статей
const currentViewMode = computed(() => {
  try {
    return useViewModeStore().mode
  } catch {
    return 'default'
  }
})

const currentViewTitle = computed(() => {
  if (currentViewMode.value === 'line') return t('header.additional.title2')
  if (currentViewMode.value === 'square') return t('header.additional.title3')
  return t('header.additional.title4')
})

// Определяем текущую страницу навигации
const currentNavigationPage = computed(() => {
  const path = route.path
  const name = route.name
  
  // Главная (Welcome страница на /home)
  if (path === '/home' && name === 'Welcome') {
    return t('header.navigation.title1')
  }
  // Статьи (HomePage на /)
  else if (path === '/' && name === 'HomePage') {
    return t('header.navigation.title2')
  }
  // Интерактив
  else if ((path === '/articles/interactive' && name === 'ArticlesInteractive') || path.startsWith('/articles/interactive')) {
    return t('header.navigation.title3')
  }
  // Компании
  else if ((path === '/articles/companies' && name === 'ArticlesCompanies') || path.startsWith('/articles/companies')) {
    return t('header.navigation.title4')
  }
  // События
  else if (path === '/events' || path.startsWith('/events')) {
    return t('header.navigation.title5')
  }
  // Новости, Исследования, Разработка - все показывают "Статьи" в хедере
  else if (path === '/news' || path === '/research' || path === '/development') {
    return t('header.navigation.title2')
  }
  
  return t('header.navigation.button')
})

// Определяем текущую страницу FAQ
const currentFaqPage = computed(() => {
  const path = route.path
  
  // Правила сообщества
  if (path.startsWith('/legal/community-rules')) {
    return t('header.faq.title4')
  }
  // Изменения
  else if (path.startsWith('/faq/changes')) {
    return t('header.faq.title3')
  }
  // Помощь
  else if (path.startsWith('/faq/help')) {
    return t('header.faq.title2')
  }
  // Страница FAQ (главная) — пока не выбран раздел, отображаем "Other"
  else if (path.startsWith('/faq')) {
    return t('header.faq.button')
  }
  
  return t('header.faq.button')
})

// Type definitions
interface PanelElement {
  panel: HTMLElement | null
  button: HTMLElement | null
}

interface PanelsConfig {
  nav: PanelElement
  faq: PanelElement
  view: PanelElement
  prof: PanelElement
}

// Panel configuration
const panels: PanelsConfig = {
  nav: {
    panel: null,
    button: null,
  },
  faq: {
    panel: null,
    button: null,
  },
  view: {
    panel: null,
    button: null,
  },
  prof: {
    panel: null,
    button: null,
  },
}

// Universal functions
function showPanel(panel: HTMLElement): void {
  // Close all other panels
  Object.values(panels).forEach(({ panel: p, button: b }) => {
    if (p && p !== panel) {
      hidePanel(p)
      if (b) b.classList.remove('active')
    }
  })

  panel.classList.remove('hidden')

  // Position panel directly under its trigger button
  const button = Object.values(panels).find(({ panel: p }) => p === panel)?.button
  if (button) {
    const rect = button.getBoundingClientRect()
    // Measure panel width to center it under the button
    const panelWidth = panel.offsetWidth || 0
    const viewportWidth = window.innerWidth
    let left = rect.left + rect.width / 2 - panelWidth / 2
    // Clamp within viewport with 8px padding
    left = Math.max(8, Math.min(left, viewportWidth - panelWidth - 8))
    panel.style.left = `${Math.round(left)}px`
    panel.style.top = `${Math.round(rect.bottom + 15)}px` // 15px gap
  }

  // Add active class to corresponding button
  const activeBtn = Object.values(panels).find(({ panel: p }) => p === panel)?.button
  if (activeBtn) activeBtn.classList.add('active')

  // First frame - just show
  requestAnimationFrame(() => {
    // Second frame - apply smooth animation
    requestAnimationFrame(() => {
      panel.classList.remove('opacity-0', 'pointer-events-none')
      panel.classList.add('opacity-100')
    })
  })
}

function hidePanel(panel: HTMLElement): void {
  panel.classList.remove('opacity-100')
  panel.classList.add('opacity-0', 'pointer-events-none')

  // Remove active class from corresponding button
  const button = Object.values(panels).find(({ panel: p }) => p === panel)?.button
  if (button) button.classList.remove('active')

  const handler = (): void => {
    if (panel.classList.contains('opacity-0')) {
      panel.classList.add('hidden')
    }
    panel.removeEventListener('transitionend', handler)
  }
  panel.addEventListener('transitionend', handler)
}

// Initialize panels and add event listeners
const isScrolled = ref(false)
const isHeaderVisible = ref(true)
let lastScrollY = 0
let ticking = false
let initialHeaderHeight = 0
let previousHeaderHeight = 0

// Provide header visibility state for parent components
provide('isHeaderVisible', isHeaderVisible)

// Константы для порогов прокрутки
const SCROLL_THRESHOLD_TOP = 50
const SCROLL_THRESHOLD_HIDE = 10
const SCROLL_MIN_BEFORE_HIDE = 20

// Проверка, находимся ли мы в верхней части страницы
const isAtTop = (scrollY: number): boolean => scrollY <= SCROLL_THRESHOLD_TOP

// Оптимизированная функция обновления высоты хэдера
const updateHeaderHeight = () => {
  const headerElement = document.querySelector('.header-container') as HTMLElement
  if (!headerElement) return
  
  const currentScroll = window.scrollY
  
  // В верхней части страницы всегда используем исходную высоту
  if (isAtTop(currentScroll) && initialHeaderHeight > 0) {
    document.documentElement.style.setProperty('--header-height', `${initialHeaderHeight}px`)
    return
  }
  
  // В остальных случаях используем текущую высоту или 0 если скрыт
  const height = isHeaderVisible.value ? headerElement.offsetHeight : 0
  document.documentElement.style.setProperty('--header-height', `${height}px`)
}

// Update CSS variable for header height when visibility changes
watch(isHeaderVisible, () => {
  const currentScrollY = window.scrollY
  
  // В верхней части страницы обрабатываем по-особому
  if (isAtTop(currentScrollY)) {
    document.body.classList.add('header-at-top')
    
    const targetHeight = initialHeaderHeight > 0 
      ? initialHeaderHeight 
      : (document.querySelector('.header-container') as HTMLElement)?.offsetHeight || 80
    
    document.documentElement.style.setProperty('--header-height', `${targetHeight}px`)
    previousHeaderHeight = targetHeight
    
    // Убираем класс после небольшой задержки
    setTimeout(() => document.body.classList.remove('header-at-top'), 400)
    return
  }
  
  // Обновляем высоту хэдера
  updateHeaderHeight()
  
  // Сохраняем новую высоту для следующего обновления
  nextTick(() => {
    const newHeight = isHeaderVisible.value 
      ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
      : 0
    
    previousHeaderHeight = newHeight
    
    // Оповещаем другие компоненты об изменении высоты
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('header:heightChanged'))
    }, 100)
  })
})

// Оптимизированная функция обработки скролла
const handleScroll = () => {
  const currentScrollY = window.scrollY
  const scrollDelta = currentScrollY - lastScrollY
  const wasNotAtTop = lastScrollY > SCROLL_THRESHOLD_TOP
  
  // В верхней части страницы
  if (isAtTop(currentScrollY)) {
    document.body.classList.add('header-at-top')
    
    if (!isHeaderVisible.value) {
      isHeaderVisible.value = true
    }
    
    // Если только что вернулись в верх (переход из >50 в <=50)
    // Устанавливаем высоту мгновенно без transition
    if (wasNotAtTop && isAtTop(currentScrollY)) {
      // Временно отключаем transition для мгновенного обновления
      const containers = document.querySelectorAll('.articles-container')
      containers.forEach((el) => {
        (el as HTMLElement).style.transition = 'none'
      })
      
      // Устанавливаем высоту
      if (initialHeaderHeight > 0) {
        document.documentElement.style.setProperty('--header-height', `${initialHeaderHeight}px`)
        previousHeaderHeight = initialHeaderHeight
      } else {
        updateHeaderHeight()
      }
      
      // Возвращаем transition через RAF
      requestAnimationFrame(() => {
        containers.forEach((el) => {
          (el as HTMLElement).style.transition = ''
        })
      })
    } else {
      // Обычное обновление если мы уже были в верху
      if (initialHeaderHeight > 0) {
        document.documentElement.style.setProperty('--header-height', `${initialHeaderHeight}px`)
        previousHeaderHeight = initialHeaderHeight
      } else {
        updateHeaderHeight()
      }
    }
    
    isScrolled.value = false
  } else {
    // Ниже верхней части страницы
    isScrolled.value = true
    document.body.classList.remove('header-at-top')
    
    // Скрываем хэдер при прокрутке вниз
    if (scrollDelta > SCROLL_THRESHOLD_HIDE && isHeaderVisible.value && currentScrollY > SCROLL_MIN_BEFORE_HIDE) {
      requestAnimationFrame(() => {
        isHeaderVisible.value = false
      })
    }
    // Показываем хэдер при прокрутке вверх
    else if (scrollDelta < -SCROLL_THRESHOLD_HIDE && !isHeaderVisible.value) {
      isHeaderVisible.value = true
      updateHeaderHeight()
    }
  }
  
  lastScrollY = currentScrollY
  ticking = false
}

const requestScrollUpdate = () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll)
    ticking = true
  }
}

// Debounce helper для оптимизации resize
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Function to initialize panel button handlers
const setupPanelHandlers = () => {
  Object.values(panels).forEach(({ panel, button }) => {
    if (panel && button && !(button as any).__panelHandlerAttached) {
      const clickHandler = (e: Event) => {
        if (panel.classList.contains('hidden')) {
          showPanel(panel)
        } else {
          hidePanel(panel)
        }
        e.stopPropagation()
      }
      button.addEventListener('click', clickHandler)
      ;(button as any).__panelHandlerAttached = true
      ;(button as any).__panelClickHandler = clickHandler
    }
  })
}

// Function to initialize panels
const initializePanels = async () => {
  await nextTick() // Wait for DOM to update
  
  // Get panel elements
  panels.nav.panel = document.getElementById('navigation_panel')
  panels.nav.button = document.getElementById('nav-btn')
  panels.faq.panel = document.getElementById('faq_navigation_panel')
  panels.faq.button = document.getElementById('faq-btn')
  panels.view.panel = document.getElementById('view_panel')
  panels.view.button = document.getElementById('view-btn')
  panels.prof.panel = document.getElementById('profile_panel')
  panels.prof.button = document.getElementById('logo-btn')

  // Setup click handlers
  setupPanelHandlers()
}

onMounted(async () => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', requestScrollUpdate, { passive: true })
  
  // Initialize panels
  await initializePanels()
  await nextTick()
  
  // Инициализация высоты хэдера
  const currentScroll = window.scrollY
  if (isAtTop(currentScroll)) {
    document.body.classList.add('header-at-top')
    isHeaderVisible.value = true
  }
  
  // Установка начальной высоты хэдера
  const setInitialHeight = () => {
    const headerElement = document.querySelector('.header-container') as HTMLElement
    if (headerElement) {
      const height = headerElement.offsetHeight
      if (height > 0) {
        initialHeaderHeight = height
        document.documentElement.style.setProperty('--header-height', `${height}px`)
        previousHeaderHeight = height
        
        if (isAtTop(currentScroll)) {
          setTimeout(() => document.body.classList.remove('header-at-top'), 300)
        }
        return true
      }
    }
    return false
  }
  
  // Попытка установить высоту с несколькими повторами
  if (!setInitialHeight()) {
    await nextTick()
    if (!setInitialHeight()) {
      setTimeout(setInitialHeight, 50)
    }
  }
  
  // Retry profile button initialization if needed
  if (auth.isAuthenticated && !panels.prof.button) {
    await nextTick()
    setTimeout(() => {
      const profileButton = document.getElementById('logo-btn')
      if (profileButton) {
        panels.prof.button = profileButton
        setupPanelHandlers()
      }
    }, 100)
  }

  // Load notifications for authenticated users
  if (auth.isAuthenticated) {
    const { fetchUnreadCount } = useNotifications()
    await fetchUnreadCount()
    
    // Add admin-access class to panels
    Object.values(panels).forEach(({ panel }) => {
      if (panel) panel.classList.add('admin-access')
    })
  }

  // Global click handler for closing panels
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    Object.values(panels).forEach(({ panel, button }) => {
      if (panel && button && !panel.contains(target) && !button.contains(target)) {
        if (!panel.classList.contains('hidden')) {
          hidePanel(panel)
        }
      }
    })
  })

  // Оптимизированный resize handler с debounce
  const handleResize = () => {
    // Reposition visible panels
    Object.values(panels).forEach(({ panel, button }) => {
      if (!panel || !button) return
      if (!panel.classList.contains('hidden') && panel.classList.contains('opacity-100')) {
        const rect = button.getBoundingClientRect()
        const panelWidth = panel.offsetWidth || 0
        const viewportWidth = window.innerWidth
        let left = rect.left + rect.width / 2 - panelWidth / 2
        left = Math.max(8, Math.min(left, viewportWidth - panelWidth - 8))
        panel.style.left = `${Math.round(left)}px`
        panel.style.top = `${Math.round(rect.bottom + 15)}px`
      }
    })
    
    // Update header height
    if (isAtTop(window.scrollY) && initialHeaderHeight > 0) {
      document.documentElement.style.setProperty('--header-height', `${initialHeaderHeight}px`)
    } else {
      updateHeaderHeight()
    }
  }
  
  window.addEventListener('resize', debounce(handleResize, 150))
})

// Watch for authentication changes and reinitialize profile panel
watch(() => auth.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await nextTick()
    
    // Reinitialize profile panel button with retry
    const initProfilePanel = () => {
      const profileButton = document.getElementById('logo-btn')
      if (profileButton && panels.prof.panel) {
        panels.prof.button = profileButton
        
        // Remove old handler if exists
        if ((profileButton as any).__panelClickHandler) {
          profileButton.removeEventListener('click', (profileButton as any).__panelClickHandler)
          ;(profileButton as any).__panelHandlerAttached = false
        }
        
        setupPanelHandlers()
        
        // Load notifications
        const { fetchUnreadCount } = useNotifications()
        fetchUnreadCount()
      }
    }
    
    // Try immediately and with delay
    setTimeout(initProfilePanel, 100)
    setTimeout(initProfilePanel, 300)
  }
  
  // Update header height after auth changes
  await nextTick()
  if (isAtTop(window.scrollY) && initialHeaderHeight > 0) {
    document.documentElement.style.setProperty('--header-height', `${initialHeaderHeight}px`)
  } else {
    updateHeaderHeight()
  }
})

async function signOut() {
  try {
    // Закрываем панель профиля, если она открыта
    if (panels.prof.panel && !panels.prof.panel.classList.contains('hidden')) {
      hidePanel(panels.prof.panel)
    }
    
    // Сбрасываем ошибку аватара
    avatarError.value = false
    
    // Выполняем выход
    auth.logout()
    
    // Перенаправляем на страницу авторизации
    await router.push('/auth')
  } catch (error) {
    console.error('Logout error:', error)
    // Все равно очищаем данные и редиректим
    auth.logout()
    router.push('/auth').catch(() => {
      // Если push тоже упал, используем replace
      router.replace('/auth')
    })
  }
}


function setArticlesView(mode: 'default' | 'line' | 'square') {
  try {
    // Используем store для сохранения режима
    const viewModeStore = useViewModeStore()
    viewModeStore.setMode(mode)
    // Также отправляем событие для компонентов, которые слушают его
    window.dispatchEvent(new CustomEvent('articles:viewMode', { detail: mode }))
  } catch {}
  // Hide the View panel after selection if open
  const viewPanel = panels.view.panel
  if (viewPanel && !viewPanel.classList.contains('hidden')) {
    hidePanel(viewPanel)
  }
}

onUnmounted(() => {
  window.removeEventListener('scroll', requestScrollUpdate)
})

</script>

<style lang="scss">

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-center {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-brand-link {
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 80px;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }
}

.logo {
  margin: 0;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  
  :deep(.logo-container) {
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  :deep(.logo-image) {
    max-width: 100px !important;
    max-height: 100px !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
}

/* Make logo black on white theme */
:root[data-theme='white'] .logo :deep(.logo-image) {
  filter: brightness(0) saturate(100%);
}

.header-title {
  font-family: var(--font-comfortaa);
  font-size: 35px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0 90px;
  white-space: nowrap;
  padding: 0;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 1000;
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-in-out;
  will-change: transform;
  background-color: rgba(18, 18, 23, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 0 0 16px 16px;
  
  /* Десктоп (базовые значения) */
  width: 100%;
  height: 80px;
  padding: 0 20px;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    padding: 0 16px;
    flex-wrap: wrap;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 90%;
    height: 70px;
    padding: 0 20px;
  }
  
  /* Десктоп небольшой */
  @media (min-width: 1025px) and (max-width: 1440px) {
    width: 85%;
    max-width: 1200px;
    height: 80px;
    padding: 0 24px;
  }
  
  /* Десктоп средний */
  @media (min-width: 1441px) and (max-width: 1920px) {
    width: 80%;
    max-width: 1400px;
    height: 80px;
    padding: 0 28px;
  }
  
  /* Большие экраны */
  @media (min-width: 1921px) {
    width: 75%;
    max-width: 1600px;
    height: 80px;
    padding: 0 32px;
  }

  /* Тень при прокрутке */
  &.scrolled {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: rgba(18, 18, 23, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
  }

  /* Скрытие при прокрутке вниз */
  &.header-hidden {
    transform: translate(-50%, -100%);
  }
  
  /* Убираем размытие на странице уведомлений */
  &.no-blur {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background-color: rgba(18, 18, 23, 0.98);
    
    &.scrolled {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background-color: rgba(18, 18, 23, 1);
    }
  }
}

/* Lighten header for white theme */
:root[data-theme='white'] .header-container {
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

:root[data-theme='white'] .header-container.scrolled {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

:root[data-theme='white'] .header-container.no-blur {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background-color: rgba(255, 255, 255, 0.98);
  
  &.scrolled {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background-color: rgba(255, 255, 255, 1);
  }
}

/* Force dark logo image on white theme */
:root[data-theme='white'] .header-container .logo .logo-image {
  filter: brightness(0) saturate(100%) !important;
}
.header-container.admin-access {
  height: 110px;
}




// Navigation button
.nav-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;

  /* Десктоп (базовые значения) */
  width: 260px;
  height: 52px;
  padding: 8px 16px;

  /* Планшеты */
  @media (max-width: 1024px) {
    width: 220px;
    height: 46px;
    padding: 7px 14px;
  }

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 200px;
    height: 40px;
    border-radius: 12px;
    padding: 6px 12px;
  }

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

// FAQ button
.faq-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center; /* выравниваем иконку, текст и стрелку по центру */
  background-color: rgba(67, 73, 86, 0);
  border-radius: 20px;
  width: 200px; /* чуть шире, чтобы уместить текст и стрелку */
  height: 52px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;
  padding-right: 12px; /* резервируем место под стрелочку */

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

// Additional button
.additional-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 20px;
  width: 60px;
  height: 52px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

// Create button
.create-button-link {
  text-decoration: none;
}

.create-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 20px;
  width: 60px;
  height: 52px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

// Profile button
.profile-button {
  position: relative;
  display: flex;
  align-items: center;
  background-color: transparent;
  border-radius: 15px;
  width: 100px;
  height: 56px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;
  margin-left: 16px;

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

// Login button for unauthenticated users
.login-button-link {
  text-decoration: none;
  color: inherit;
}

.login-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  padding: 0 20px;
  height: 52px;
  transition: background-color 0.3s ease-in-out;
  border: none;
  cursor: pointer;
  gap: 12px;

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

.login-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.login-text {
  font-family: var(--font-sans-serif);
  font-size: 23px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
}

.profile-avatar {
  background-color: var(--btn-primary);
  border-radius: 50%;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  margin-left: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.6;
}

.avatar-icon {
  color: currentColor;
}

// Dropdown icons rotation
.dropdown-icon {
  color: var(--text-primary);
  transition: transform 0.3s ease-in-out;
  margin-left: 10px;
  flex: 0 0 auto; /* не сжимать и использовать естественный размер SVG */
}

// FAQ arrow spacing
.faq-arrow {
  margin-left: 20px;
  margin-right: 12px;
}

// Additional arrow spacing
.additional-arrow {
  margin-left: 10px;
}

// Profile arrow spacing
.profile-arrow {
  margin-left: 10px;
  margin-right: 12px;
}

// Active state for dropdown icons (when panel is open)
.nav-button.active .dropdown-icon,
.faq-button.active .dropdown-icon,
.additional-button.active .dropdown-icon,
.profile-button.active .dropdown-icon {
  transform: rotate(180deg);
}

// Button text
.button-text {
  font-family: var(--font-sans-serif);
  font-size: 23px;
  font-weight: bold;
  color: var(--text-primary);
  margin-left: 14px;
}

// Icon positioning
.nav-icon {
  margin-left: 0;
}

.faq-icon {
  margin-left: 16px;
  width: 23px;
  height: 23px;
  flex-shrink: 0;
}

.add-icon {
  margin-left: 0;
}

.panel-icon {
  width: 23px;
  height: 23px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  flex-shrink: 0;
  
  path,
  circle,
  line,
  polyline,
  polygon,
  rect {
    stroke: currentColor;
  }
}

// EditorIcons specific styling for panel
.panel-button .editor-icons {
  color: var(--text-primary);
  transition: color 0.3s ease-in-out;
}

// Dropdown panels
.dropdown-panel {
  position: fixed; /* фиксируем относительно окна */
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 99999;
  min-width: 200px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease-in-out;
}

// Animation classes
.hidden {
  display: none !important;
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.pointer-events-none {
  pointer-events: none;
}

/* ==================== DROPDOWN PANELS POSITIONING ==================== */
/*
 * ВАЖНО ДЛЯ РАЗРАБОТЧИКОВ:
 *
 * 1. Структура каждой панели (Desktop-first подход):
 *    - Базовые значения (десктоп ≥1025px)
 *    - Планшеты: @media (max-width: 1024px)
 *    - Мобильные: @media (max-width: 768px)
 *
 * 2. Порядок панелей слева направо:
 *    Navigation (550px) → FAQ (870px) → Additional (1100px) → Profile (1210px)
 *
 * 3. НЕ ИСПОЛЬЗУЙ !important - все конфликты решены через правильную специфичность
 *
 * 4. Для изменения позиции:
 *    - Измени базовое значение left для десктопа
 *    - При необходимости измени значения в медиазапросах
 *
 * 5. Порядок медиазапросов везде одинаковый: Десктоп → Планшеты → Мобильные
 */

.dropdown-panel.navigation-panel {
  min-width: 260px;
  width: auto;
  height: auto;
}

.dropdown-panel.faq-panel {
  min-width: 260px;
  width: auto;
  height: auto;
}

.dropdown-panel.additional-panel {
  width: 60px;
  min-width: 60px;
  height: auto;
}

.dropdown-panel.profile-panel {
  min-width: 260px;
  width: auto;
  height: auto;
  max-height: 80vh;
}

/* When header is taller for admin access, offset dropdowns */
/* top managed dynamically; no admin-specific offset needed */

.panel-content {
  display: flex;
  flex-direction: column;
  margin-top: 0;
  gap: 4px;
  width: 100%;
}

.panel-content .panel-divider {
  align-self: stretch;
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
  border-radius: 0;
}

.profile-panel .panel-content {
  max-height: calc(80vh - 20px);
  overflow-y: auto;
  /* Резервируем стабильное место под полосу прокрутки (поддерживается современными браузерами) */
  scrollbar-gutter: stable;
}

/* Адаптивные настройки для скроллбара панели профиля */
@media (max-width: 1024px) {
  .profile-panel .panel-content {
    max-height: calc(75vh - 20px);
  }
}

@media (max-width: 768px) {
  .profile-panel .panel-content {
    max-height: calc(70vh - 20px);
  }
}

/* Стилизация скроллбара для панели профиля */
.profile-panel .panel-content::-webkit-scrollbar {
  width: 7px; /* на пиксель толще */
}

.profile-panel .panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03); /* менее заметный трек */
  border-radius: 4px;
}

.profile-panel .panel-content::-webkit-scrollbar-thumb {
  background: white; /* постоянно белый */
  border-radius: 6px;
  /* Уменьшаем высоту бегунка в половину */
  min-height: 20px; /* минимальная высота */
  background-image: linear-gradient(to bottom, 
    white 0%, 
    white 50%, 
    transparent 50%, 
    transparent 100%
  );
}

.profile-panel .panel-content::-webkit-scrollbar-thumb:hover {
  background: white; /* отключаем подсветку на hover */
}

/* Firefox (стандартное API) */
.profile-panel .panel-content {
  scrollbar-width: thin; /* уменьшенная ширина */
  scrollbar-color: white rgba(255, 255, 255, 0.03);
}

// Panel buttons
.panel-button {
  position: relative;
  display: flex;
  align-items: center;
  background: none;
  border-radius: 10px;
  width: 100%;
  padding: 16px 18px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 16px;
  
  &.active {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    
    .panel-icon {
      color: var(--text-primary);
    }
  }
}

// Компактные кнопки-иконки в панели вида
.additional-panel .panel-button {
  justify-content: center;
  padding: 10px 8px;
  gap: 0;
}
.additional-panel .panel-button .panel-icon {
  width: 24px;
  height: 24px;
}

.profile-panel .panel-button {
  width: 100%;
}

.panel-text {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

// Panel divider
.panel-divider {
  align-self: stretch;
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
  border-radius: 0;
  flex-shrink: 0;
}


// Sign out button special styling
.sign-out-button {
  padding: 16px 18px !important;
  flex-shrink: 0 !important;
  color: var(--text-primary);
  
  .panel-icon { 
    color: var(--text-secondary); 
    transition: color 0.2s ease; 
  }
  
  .panel-icon path,
  .panel-icon circle,
  .panel-icon line,
  .panel-icon polyline,
  .panel-icon polygon { 
    stroke: currentColor !important; 
  }
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    
    .panel-text {
      color: #ef4444 !important;
    }
    
    .panel-icon { 
      color: #ef4444; 
    }
    
    .panel-icon path,
    .panel-icon circle,
    .panel-icon line,
    .panel-icon polyline,
    .panel-icon polygon { 
      stroke: #ef4444 !important; 
    }
  }
}

.sign-in-button {
  padding: 16px 18px !important;
  flex-shrink: 0 !important;
  background: none;
  &:hover { 
    background-color: rgba(255, 255, 255, 0.05);
  }
}

// Notification indicator
.notification-indicator {
  position: absolute;
  top: 40%;
  right: 20px;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background-color: #3b82f6; /* голубой цвет */
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Router link styling
a {
  text-decoration: none;
  color: inherit;
}

a:hover {
  text-decoration: none;
}

/* ===== Theme-specific hover fixes for light theme ===== */
:root[data-theme='white'] {
  /* Trigger buttons in header */
  .header-container .nav-button:hover,
  .header-container .faq-button:hover,
  .header-container .additional-button:hover,
  .header-container .create-button:hover,
  .header-container .profile-button:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  /* Items inside dropdown panels */
  .dropdown-panel .panel-button:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .dropdown-panel .panel-button.active {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

/* Только монолитное масштабирование через transform scale в App.vue */
/* Все размеры фиксированные - интерфейс выглядит абсолютно одинаково на всех разрешениях */

</style>
