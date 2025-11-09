<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const error = ref<string | null>(null)

onMounted(() => {
  // Обработка токена теперь происходит в router guard
  // Если мы оказались на этой странице без токена - значит была ошибка
  const accessToken = route.query.access_token as string | undefined
  
  if (!accessToken) {
    console.error('❌ No access token in URL params:', route.query)
    error.value = 'Токен авторизации не найден'
    setTimeout(() => router.replace('/auth'), 3000)
    return
  }

  // Если токен есть, router guard должен обработать его
  // Если мы всё ещё здесь через 2 секунды - значит что-то пошло не так
  setTimeout(() => {
    if (error.value === null) {
      // Router guard должен был редиректнуть, но если не редиректнул - показываем ошибку
      console.warn('⚠️ Router guard did not redirect, showing error')
      error.value = 'Ошибка обработки авторизации'
      setTimeout(() => router.replace('/auth'), 3000)
  }
  }, 2000)
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="error" class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h2>Ошибка авторизации</h2>
        <p>{{ error }}</p>
        <p class="redirect-text">Перенаправление на страницу входа...</p>
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <h2>Завершаем вход...</h2>
        <p>Получаем ваши данные</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.callback-container {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.redirect-text {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.error-state svg {
  margin-bottom: 8px;
}
</style>
