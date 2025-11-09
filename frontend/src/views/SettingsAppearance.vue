<template>
  <div class="settings-appearance-container">
    <AppHeader />
    
    <!-- Main Body -->
    <div class="main-body">
      <!-- Sidebar -->
      <SettingsSidebar />
        
        
      
      <!-- Content -->
      <div class="content">
        <!-- Color Theme Section -->
        <div class="theme-section">
          <h1 class="section-title">{{ t('settings.appearance.theme.title') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.appearance.theme.subtitle') }}</h2>
          
          <div class="theme-buttons">
            <button 
              data-theme="system" 
              class="theme-button"
              :class="{ active: selectedTheme === 'system' }"
              @click="selectTheme('system')"
            >
              <div class="theme-preview">
                <img :src="themeImages['system']" alt="System theme preview" class="theme-preview-image" />
              </div>
              <div class="theme-label">
                <div class="theme-indicator">
                  <div class="theme-indicator-dot"></div>
                </div>
                <p class="theme-text">{{ t('settings.appearance.theme.system') }}</p>
              </div>
            </button>

            <button 
              data-theme="white" 
              class="theme-button"
              :class="{ active: selectedTheme === 'white' }"
              @click="selectTheme('white')"
            >
              <div class="theme-preview">
                <img :src="themeImages['white']" alt="White theme preview" class="theme-preview-image" />
              </div>
              <div class="theme-label">
                <div class="theme-indicator">
                  <div class="theme-indicator-dot"></div>
                </div>
                <p class="theme-text">{{ t('settings.appearance.theme.white') }}</p>
              </div>
            </button>

            <button 
              data-theme="oled" 
              class="theme-button"
              :class="{ active: selectedTheme === 'oled' }"
              @click="selectTheme('oled')"
            >
              <div class="theme-preview">
                <img :src="themeImages['oled']" alt="OLED theme preview" class="theme-preview-image" />
              </div>
              <div class="theme-label">
                <div class="theme-indicator">
                  <div class="theme-indicator-dot"></div>
                </div>
                <p class="theme-text">{{ t('settings.appearance.theme.oled') }}</p>
              </div>
            </button>

            <button 
              data-theme="night-dark" 
              class="theme-button"
              :class="{ active: selectedTheme === 'night-dark' }"
              @click="selectTheme('night-dark')"
            >
              <div class="theme-preview">
                <img :src="themeImages['night-dark']" alt="Dark theme preview" class="theme-preview-image" />
              </div>
              <div class="theme-label">
                <div class="theme-indicator">
                  <div class="theme-indicator-dot"></div>
                </div>
                <p class="theme-text">{{ t('settings.appearance.theme.dark') }}</p>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Language Section -->
        <div class="language-section">
          <h1 class="section-title">{{ t('settings.appearance.language.title') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.appearance.language.subtitle') }}</h2>
          
          <div class="language-dropdown">
            <button 
              class="language-select-button"
              @click="toggleLanguageDropdown"
            >
              <div class="selected-language">
                <span class="language-flag">{{ getCurrentLanguageFlag() }}</span>
                <span class="language-name">{{ getCurrentLanguageName() }}</span>
              </div>
              <svg class="dropdown-icon" width="22" height="12" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 2.375L12.5 12.625L22.75 2.375" stroke="var(--ico-color)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div 
              class="language-dropdown-menu"
              :class="{ 'open': isLanguageDropdownOpen }"
            >
              <div 
                class="language-option"
                :class="{ 'active': getCurrentLocale() === 'en' }"
                @click="selectLanguage('en')"
              >
                <span class="language-flag">🇺🇸</span>
                <span class="language-name">English</span>
              </div>
              
              <div 
                class="language-option"
                :class="{ 'active': getCurrentLocale() === 'ru' }"
                @click="selectLanguage('ru')"
              >
                <span class="language-flag">🇷🇺</span>
                <span class="language-name">Русский</span>
              </div>
              
              <div 
                class="language-option"
                :class="{ 'active': getCurrentLocale() === 'es' }"
                @click="selectLanguage('es')"
              >
                <span class="language-flag">🇪🇸</span>
                <span class="language-name">Español</span>
              </div>
              
              <div 
                class="language-option"
                :class="{ 'active': getCurrentLocale() === 'fr' }"
                @click="selectLanguage('fr')"
              >
                <span class="language-flag">🇫🇷</span>
                <span class="language-name">Français</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Article Font Section -->
        <div class="font-section">
          <h1 class="section-title">{{ t('settings.appearance.font.title') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.appearance.font.subtitle') }}</h2>
          
          <div class="font-dropdown">
            <button 
              class="font-select-button"
              @click="toggleFontDropdown"
            >
              <p class="font-select-text">{{ getCurrentFontName }}</p>
              <svg class="dropdown-icon" width="22" height="12" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 2.375L12.5 12.625L22.75 2.375" stroke="var(--ico-color)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div 
              class="font-dropdown-menu"
              :class="{ 'open': isFontDropdownOpen }"
            >
              <div 
                class="font-option"
                :class="{ 'active': selectedFont === 'comfortaa' }"
                @click="handleSelectFont('comfortaa')"
              >
                <span class="font-name">Comfortaa</span>
                <span class="font-sample" style="font-family: 'Comfortaa', cursive;">Aa</span>
              </div>
              
              <div 
                class="font-option"
                :class="{ 'active': selectedFont === 'roboto' }"
                @click="handleSelectFont('roboto')"
              >
                <span class="font-name">Roboto</span>
                <span class="font-sample" style="font-family: 'Roboto', sans-serif;">Aa</span>
              </div>
              
              <div 
                class="font-option"
                :class="{ 'active': selectedFont === 'opensans' }"
                @click="handleSelectFont('opensans')"
              >
                <span class="font-name">Open Sans</span>
                <span class="font-sample" style="font-family: 'Open Sans', sans-serif;">Aa</span>
              </div>
              
              <div 
                class="font-option"
                :class="{ 'active': selectedFont === 'lato' }"
                @click="handleSelectFont('lato')"
              >
                <span class="font-name">Lato</span>
                <span class="font-sample" style="font-family: 'Lato', sans-serif;">Aa</span>
              </div>
              
              <div 
                class="font-option"
                :class="{ 'active': selectedFont === 'montserrat' }"
                @click="handleSelectFont('montserrat')"
              >
                <span class="font-name">Montserrat</span>
                <span class="font-sample" style="font-family: 'Montserrat', sans-serif;">Aa</span>
              </div>
            </div>
          </div>

          <div class="font-preview">
            <h1 
              class="font-preview-text"
              :style="{ fontFamily: getCurrentFontFamily }"
            >{{ t('settings.appearance.font.preview') }}</h1>
          </div>
        </div>

        <!-- Articles View Layout Section -->
        <div class="view-layout-section">
          <h1 class="section-title">{{ t('settings.appearance.viewLayout.title') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.appearance.viewLayout.subtitle') }}</h2>
          
          <div class="layout-options">
            <button 
              class="layout-option"
              :class="{ active: currentViewMode === 'default' }"
              @click="selectViewMode('default')"
            >
              <div class="layout-preview">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="120" height="28" rx="4" :fill="currentViewMode === 'default' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'default' ? '0.6' : '0.3'"/>
                  <rect x="0" y="31" width="120" height="28" rx="4" :fill="currentViewMode === 'default' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'default' ? '0.6' : '0.3'"/>
                  <rect x="0" y="62" width="120" height="28" rx="4" :fill="currentViewMode === 'default' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'default' ? '0.6' : '0.3'"/>
                </svg>
              </div>
              <div class="layout-label">
                <div class="layout-radio">
                  <div 
                    class="layout-radio-dot"
                    :class="{ active: currentViewMode === 'default' }"
                  ></div>
                </div>
                <p class="layout-text">{{ t('settings.appearance.viewLayout.default') }}</p>
              </div>
            </button>

            <button 
              class="layout-option"
              :class="{ active: currentViewMode === 'line' }"
              @click="selectViewMode('line')"
            >
              <div class="layout-preview">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="36" height="90" rx="4" :fill="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'line' ? '0.6' : '0.3'"/>
                  <line x1="45" y1="10" x2="120" y2="10" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="22" x2="120" y2="22" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="34" x2="120" y2="34" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="46" x2="120" y2="46" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="58" x2="120" y2="58" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="70" x2="120" y2="70" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                  <line x1="45" y1="82" x2="120" y2="82" :stroke="currentViewMode === 'line' ? 'var(--ui-accent)' : 'currentColor'" :stroke-opacity="currentViewMode === 'line' ? '0.8' : '0.5'" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="layout-label">
                <div class="layout-radio">
                  <div 
                    class="layout-radio-dot"
                    :class="{ active: currentViewMode === 'line' }"
                  ></div>
                </div>
                <p class="layout-text">{{ t('settings.appearance.viewLayout.line') }}</p>
              </div>
            </button>

            <button 
              class="layout-option"
              :class="{ active: currentViewMode === 'square' }"
              @click="selectViewMode('square')"
            >
              <div class="layout-preview">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="55" height="55" rx="4" :fill="currentViewMode === 'square' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'square' ? '0.6' : '0.3'"/>
                  <rect x="65" y="0" width="55" height="55" rx="4" :fill="currentViewMode === 'square' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'square' ? '0.6' : '0.3'"/>
                  <rect x="0" y="65" width="55" height="25" rx="4" :fill="currentViewMode === 'square' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'square' ? '0.6' : '0.3'"/>
                  <rect x="65" y="65" width="55" height="25" rx="4" :fill="currentViewMode === 'square' ? 'var(--ui-accent)' : 'currentColor'" :fill-opacity="currentViewMode === 'square' ? '0.6' : '0.3'"/>
                </svg>
              </div>
              <div class="layout-label">
                <div class="layout-radio">
                  <div 
                    class="layout-radio-dot"
                    :class="{ active: currentViewMode === 'square' }"
                  ></div>
                </div>
                <p class="layout-text">{{ t('settings.appearance.viewLayout.square') }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// Импорты изображений тем
import theme1Image from '@/assets/imgs/theme3.png'
import theme2Image from '@/assets/imgs/theme2.png'
import theme3Image from '@/assets/imgs/theme1.png'
import { useTheme } from '@/composables/useTheme'
import { useArticleFont, type FontKey } from '@/composables/useArticleFont'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale, getCurrentLocaleData, availableLocales } from '@/i18n'
import SettingsSidebar from '@/components/SettingsSidebar.vue'
import { useViewModeStore, type ArticlesViewMode } from '@/stores/viewMode'

// Используем composables
const { selectedTheme, selectTheme } = useTheme()
const { t } = useI18n()
const viewModeStore = useViewModeStore()
const { selectedFont, selectFont, getCurrentFontFamily, getCurrentFontName, fonts, initFont } = useArticleFont()

// Режим отображения статей
const currentViewMode = computed(() => viewModeStore.mode)

const selectViewMode = (mode: ArticlesViewMode) => {
  viewModeStore.setMode(mode)
  // Отправляем событие для обновления на странице со статьями
  window.dispatchEvent(new CustomEvent('articles:viewMode', { detail: mode }))
}

// Состояние выпадающих списков
const isLanguageDropdownOpen = ref(false)
const isFontDropdownOpen = ref(false)

// Функция переключения выпадающего списка языков
const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
  isFontDropdownOpen.value = false
}

// Функция переключения выпадающего списка шрифтов
const toggleFontDropdown = () => {
  isFontDropdownOpen.value = !isFontDropdownOpen.value
  isLanguageDropdownOpen.value = false
}

// Функция выбора языка
const selectLanguage = (language: string) => {
  setLocale(language)
  isLanguageDropdownOpen.value = false
}

// Функция выбора шрифта
const handleSelectFont = (font: FontKey) => {
  selectFont(font)
  isFontDropdownOpen.value = false
}

// Функции для получения текущего языка
const getCurrentLanguageFlag = () => {
  return getCurrentLocaleData()?.flag || '🇺🇸'
}

const getCurrentLanguageName = () => {
  return getCurrentLocaleData()?.name || 'English'
}

// Функция getCurrentFontName теперь используется из composable

const themeImages = {
  'system': theme1Image,
  'white': theme2Image,
  'oled': theme1Image,
  'night-dark': theme1Image
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.settings-appearance-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding: 0 16px;
  padding-top: calc(var(--header-height, 80px) + 10px);
  box-sizing: border-box;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: calc(var(--header-height, 60px) + 10px) 12px 0 12px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: calc(var(--header-height, 70px) + 10px) 20px 0 20px;
  }
  
  /* Десктоп */
  @media (min-width: 1025px) {
    padding: calc(var(--header-height, 80px) + 10px) 24px 0 24px;
  }
  min-height: 100vh;
}

.main-body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 48px;
  gap: 12px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}


// Content Styles
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-bottom: 200px;
}


.theme-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 346px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin-top: 24px;
  margin-left: 48px;
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 4px;
  margin-left: 48px;
  width: 700px;
}

.theme-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-left: 48px;
  margin-top: 16px;
}

.theme-button {
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 1;
  transition: all 0.3s ease-in-out;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  // Состояние при наведении
  &:hover .theme-indicator-dot {
    background-color: var(--ui-accent);
  }

  // Состояние активной темы
  &.active {
    transform: scale(1.02);
  }
  
  // Активный блок при наведении тоже должен подниматься
  &.active:hover {
    transform: scale(1.02) translateY(-2px);
  }
  
  &.active .theme-indicator {
    border-color: var(--ui-accent);
    width: 22px;
    height: 22px;
    margin-left: 15px;
  }
  
  &.active .theme-indicator-dot {
    background-color: var(--ui-accent);
    width: 12.5px;
    height: 12.5px;
  }
}

.theme-preview {
  width: 208px;
  height: 145px;
  background-color: var(--btn-primary);
  border-radius: 25px 25px 0 0;
  
  @include responsive-2k {
    border-radius: 35px 35px 0 0;
  }
  
  @include responsive-4k {
    border-radius: 45px 45px 0 0;
  }
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px 25px 0 0;
  
  @include responsive-2k {
    border-radius: 35px 35px 0 0;
  }
  
  @include responsive-4k {
    border-radius: 45px 45px 0 0;
  }
}

.theme-label {
  width: 208px;
  height: 40px;
  background-color: var(--btn-primary);
  display: flex;
  align-items: center;
  border-radius: 0 0 25px 25px;
  
  @include responsive-2k {
    border-radius: 0 0 35px 35px;
  }
  
  @include responsive-4k {
    border-radius: 0 0 45px 45px;
  }
  position: absolute;
  margin-top: 130px;
}

.theme-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ui-border-light);
  border-radius: 50%;
  margin-left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
}

.theme-indicator-dot {
  width: 11.5px;
  height: 11.5px;
  background-color: transparent;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
}

.theme-text {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 8px;
}

// Language Section Styles
.language-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 200px;
  border-radius: 25px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
}

.language-dropdown {
  position: relative;
  margin-left: 48px;
  margin-top: 16px;
}

.language-select-button {
  width: 300px;
  height: 56px;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  cursor: pointer;
  padding: 0 16px;
  
  @include responsive-2k {
    padding: 0 22.4px;
  }
  
  @include responsive-4k {
    padding: 0 28.8px;
  }

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

.selected-language {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-flag {
  font-size: 24px;
}

.language-name {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.language-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background-color: var(--bg-secondary);
  border-radius: 15px;
  border: 2px solid var(--text-secondary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;

  &.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border-radius: 13px;
  margin: 4px;

  &:hover {
    background-color: var(--ui-hover-bg);
  }

  &.active {
    background-color: rgba(139, 92, 246, 0.2);
    color: var(--primary-violet);
  }

  &:first-child {
    border-radius: 13px 13px 0 0;
  }

  &:last-child {
    border-radius: 0 0 13px 13px;
  }
}

// Font Section Styles
.font-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 440px;
  border-radius: 25px;
  margin-top: 12px;
}

.font-dropdown {
  position: relative;
  margin-left: 48px;
  margin-top: 16px;
}

.font-select-button {
  width: 200px;
  height: 47px;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 20px;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  color: var(--text-third);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  padding: 0 16px;
  
  @include responsive-2k {
    padding: 0 22.4px;
  }
  
  @include responsive-4k {
    padding: 0 28.8px;
  }

  &:hover {
    background-color: var(--ui-hover-bg);
  }
}

.font-select-text {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.dropdown-icon {
  margin-left: 16px; 
}

.font-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  border: 2px solid var(--text-secondary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;

  &.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.font-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  
  @include responsive-2k {
    padding: 16.8px 22.4px;
  }
  
  @include responsive-4k {
    padding: 21.6px 28.8px;
  }
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border-radius: 18px;
  margin: 4px;

  &:hover {
    background-color: var(--ui-hover-bg);
  }

  &.active {
    background-color: rgba(139, 92, 246, 0.2);
    color: var(--primary-violet);
  }

  &:first-child {
    border-radius: 18px 18px 0 0;
  }

  &:last-child {
    border-radius: 0 0 18px 18px;
  }
}

.font-name {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
}

.font-sample {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: bold;
}

.font-preview {
  width: 900px;
  height: 170px;
  background-color: var(--btn-primary);
  border-radius: 25px;
  margin-top: 24px;
  margin-left: 40px;
  display: flex;
  justify-content: center;
}

.font-preview-text {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  text-align: center;
  width: 700px;
}

// View Layout Section Styles
.view-layout-section {
  background-color: var(--bg-secondary);
  width: 980px;
  min-height: 346px;
  border-radius: 25px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
}

.layout-options {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-left: 48px;
  margin-top: 16px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 1;
  transition: all 0.3s ease-in-out;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  &:hover .layout-radio-dot {
    background-color: var(--ui-accent);
  }

  &.active {
    transform: scale(1.02);
  }
  
  &.active:hover {
    transform: scale(1.02) translateY(-2px);
  }
  
  &.active .layout-radio {
    border-color: var(--ui-accent);
    width: 22px;
    height: 22px;
    margin-left: 15px;
  }
  
  &.active .layout-radio-dot {
    background-color: var(--ui-accent);
    width: 12.5px;
    height: 12.5px;
  }
}

.layout-preview {
  width: 208px;
  height: 145px;
  background-color: var(--btn-primary);
  border-radius: 25px 25px 0 0;
  
  @include responsive-2k {
    border-radius: 35px 35px 0 0;
  }
  
  @include responsive-4k {
    border-radius: 45px 45px 0 0;
  }
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  svg {
    color: var(--text-secondary);
  }
}

.layout-label {
  width: 208px;
  height: 40px;
  background-color: var(--btn-primary);
  display: flex;
  align-items: center;
  border-radius: 0 0 25px 25px;
  
  @include responsive-2k {
    border-radius: 0 0 35px 35px;
  }
  
  @include responsive-4k {
    border-radius: 0 0 45px 45px;
  }
  position: absolute;
  margin-top: 130px;
}

.layout-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ui-border-light);
  border-radius: 50%;
  margin-left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
}

.layout-radio-dot {
  width: 11.5px;
  height: 11.5px;
  background-color: transparent;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;

  &.active {
    background-color: var(--ui-accent);
  }
}

.layout-text {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 8px;
}
</style>