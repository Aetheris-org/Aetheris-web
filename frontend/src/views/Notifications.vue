<template>
  <div class="notifications-container">
    <AppHeader />
    
    <div class="notifications-wrapper">
      <!-- Header -->
    <div class="notifications-header">
        <div class="header-content">
          <div class="header-title-block">
            <svg class="header-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 class="main-header" style="text-shadow: none !important; filter: none !important;">Your notifications</h2>
          </div>
      <div v-if="hasUnread" class="header-actions">
        <button @click="markAllAsRead" class="mark-all-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Отметить все прочитанными
        </button>
          </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
        <p class="loading-text">{{ $t('notifications_page.loading') }}</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="error-text">{{ error }}</p>
        <button @click="fetchNotifications" class="retry-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('notifications_page.retry') }}
        </button>
    </div>
    
    <!-- Notifications list -->
    <div v-else class="notifications-list">
      <!-- Unread notifications -->
      <div v-if="unreadNotifications.length > 0" class="notifications-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ $t('notifications_page.sections.unread', { count: unreadNotifications.length }) }}
            </h3>
            <span class="section-badge">{{ unreadNotifications.length }}</span>
          </div>
        <NotificationItem
          v-for="notification in unreadNotifications"
          :key="notification.id"
          :notification="notification"
          @mark-as-read="handleMarkAsRead"
          @navigate="handleNavigate"
        />
      </div>
      
      <!-- Read notifications -->
      <div v-if="readNotifications.length > 0" class="notifications-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ $t('notifications_page.sections.read', { count: readNotifications.length }) }}
            </h3>
            <span class="section-count">{{ readNotifications.length }}</span>
          </div>
        <NotificationItem
          v-for="notification in readNotifications"
          :key="notification.id"
          :notification="notification"
          @mark-as-read="handleMarkAsRead"
          @navigate="handleNavigate"
        />
      </div>
      
      <!-- Empty state -->
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="empty-title">{{ $t('notifications_page.empty.title') }}</h3>
        <p class="empty-description">{{ $t('notifications_page.empty.subtitle') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import NotificationItem from '@/components/NotificationItem.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useNotifications } from '@/composables/useNotifications'

const {
  notifications,
  unreadNotifications,
  readNotifications,
  hasUnread,
  loading,
  error,
  fetchNotifications,
  markAsRead,
  markAsReadOnNavigate,
  markAllAsRead
} = useNotifications()

const handleMarkAsRead = async (notificationId: number) => {
  await markAsRead(notificationId)
}

const handleNavigate = async (notificationId: number) => {
  // Автоматически отмечаем уведомление как прочитанное при переходе
  await markAsReadOnNavigate(notificationId)
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.notifications-container {
  background-color: var(--bg-primary);
  min-height: 100vh;
}

.notifications-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-top: calc(var(--header-height, 80px) + 40px);
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  @media (max-width: 1024px) {
    max-width: 1000px;
    padding: 20px;
    padding-top: calc(var(--header-height, 70px) + 32px);
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    padding-top: calc(var(--header-height, 60px) + 24px);
  }
}

.notifications-header {
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 2px solid var(--btn-primary);
  position: relative;
  
  * {
    text-shadow: none !important;
    filter: none !important;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }
}

.header-title-block {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.header-icon {
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  filter: none;
}

.main-header {
  color: var(--text-primary);
  font-size: 26px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
  text-shadow: none !important;
  filter: none !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--btn-primary);
  color: var(--text-primary);
  border: 2px solid var(--text-third);
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-sans);
  letter-spacing: 0.02em;

  &:hover {
    background: var(--text-third);
  color: var(--bg-primary);
    border-color: var(--text-third);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
}

.notifications-list {
  max-width: 100%;
}

.notifications-section {
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  svg {
    color: var(--text-secondary);
  }
}

.section-badge {
  background: var(--text-secondary);
  color: var(--bg-primary);
  font-size: 13px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  font-family: var(--font-sans);
}

.section-count {
  color: var(--text-third);
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  background-color: var(--btn-primary);
  border-radius: 16px;
  font-family: var(--font-sans);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--btn-primary);
  border-top: 4px solid var(--text-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  font-family: var(--font-sans);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon {
  margin-bottom: 20px;
  color: var(--text-red);
  opacity: 0.8;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-text {
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  font-family: var(--font-sans);
  max-width: 400px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--btn-primary);
  color: var(--text-primary);
  border: 2px solid var(--text-third);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-sans);

  &:hover {
    background: var(--text-third);
  color: var(--bg-primary);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty state styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  color: var(--text-third);
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  color: var(--text-primary);
  font-size: 24px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}

.empty-description {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
  font-weight: 500;
}

/* Mobile responsiveness */
@media screen and (max-width: 768px) {
  .section-title {
    font-size: 16px;
  }
  
  .empty-title {
    font-size: 20px;
  }
  
  .empty-description {
    font-size: 14px;
  }
}
</style>
