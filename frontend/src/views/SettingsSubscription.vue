<template>
  <div class="settings-subscription-container">
    <!-- Main Body -->
    <div class="main-body">
      <!-- Sidebar -->
      <SettingsSidebar />
      
      <!-- Content -->
      <div class="content">
        <div class="development-message">
          <h1 class="development-text">{{ $t('common.in_development') }}</h1>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import SettingsSidebar from '@/components/SettingsSidebar.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Subscription settings logic can be added here
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.settings-subscription-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  min-height: 100vh;
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
  justify-content: center;
  flex: 1;
}

.development-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.development-text {
  color: var(--text-secondary);
  font-size: 30px;
  font-family: var(--font-sans);
  padding-left: 320px;
  margin-right: 230px;
  font-weight: bold;
}
</style>