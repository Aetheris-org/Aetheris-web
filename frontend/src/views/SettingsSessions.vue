<template>
  <div class="settings-sessions-container">
    
    <!-- Main Body -->
    <div class="main-body">
      <!-- Sidebar -->
      <SettingsSidebar />
      
      <!-- Content -->
      <div class="content">
        <!-- Active Sessions Section -->
        <div class="sessions-section">
          <h1 class="section-title">{{ $t('settings.sessions.h1') }}</h1>
          <h2 class="section-subtitle">{{ $t('settings.sessions.subtitle') }}</h2>
          <h2 class="section-warning">{{ $t('settings.sessions.subtitle2') }}</h2>
          
          <div class="sessions-content">
            <!-- Session placeholder -->
            <div class="session-placeholder"></div>
            
            <!-- Delete all sessions button -->
            <button class="delete-all-button" @click="deleteAllSessions">
              {{ $t('settings.sessions.button1') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import SettingsSidebar from '@/components/SettingsSidebar.vue'

const deleteAllSessions = () => {
  // Logic for deleting all sessions
  console.log('Deleting all sessions...')
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.settings-sessions-container {
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


.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.sessions-section {
  background-color: var(--bg-secondary);
  width: 980px;
  height: 900px;
  border-radius: 25px;
  margin-bottom: 200px;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin-top: 40px;
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

.section-warning {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 16px;
  margin-left: 48px;
  width: 900px;
}

.sessions-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 50px;
}

.session-placeholder {
  background-color: var(--bg-primary);
  width: 890px;
  height: 139px;
  border-radius: 25px;
  margin-left: 48px;
}

.delete-all-button {
  width: 890px;
  height: 59px;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  color: var(--text-primary);
  font-size: 23px;
  font-family: var(--font-sans);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  margin-left: 48px;
  margin-top: 16px;

  &:hover {
    background-color: var(--text-red);
  }
}
</style>