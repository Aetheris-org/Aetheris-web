<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const loading = ref(false)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'

// Если уже авторизован, редиректим на главную или на сохранённый redirect
onMounted(() => {
  auth.loadFromStorage()
  if (auth.isAuthenticated) {
    const redirect = route.query.redirect as string | undefined
    router.replace(redirect || '/')
  }
})

function loginWithGoogle() {
  if (loading.value) return
  loading.value = true
  
  // Сохраняем redirect в state для OAuth callback
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    // Сохраняем redirect в sessionStorage для использования после OAuth
    sessionStorage.setItem('auth_redirect', redirect)
  }
  
  // Strapi OAuth URL - кастомный контроллер автоматически редиректит на фронтенд с токеном
  window.location.href = `${API_BASE}/api/connect/google`
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="card-header">
        <h1>{{ $t('auth.title') }}</h1>
        <p class="card-subtitle">{{ $t('auth.subtitle') }}</p>
      </div>

      <div class="auth-providers">
        <button 
          class="google-btn" 
          :disabled="loading"
          @click="loginWithGoogle"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          <span>{{ loading ? $t('auth.button.loading') : $t('auth.button.continue') }}</span>
        </button>
      </div>

      <div class="auth-footer">
        <p>{{ $t('auth.footer.text') }}</p>
        <div class="legal-links">
          <router-link to="/legal/terms-of-use">{{ $t('auth.footer.terms') }}</router-link>
          <span>{{ $t('auth.footer.and') }}</span>
          <router-link to="/legal/privacy-policy">{{ $t('auth.footer.privacy') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.auth-card {
  position: relative;
  z-index: 1;
  width: min(520px, 100%);
  padding: 40px 44px 36px;
  border-radius: 28px;
  background: rgba(38, 41, 47, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(28px);
  font-family: var(--font-sans);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  text-align: center;
}

.card-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-sans);
}

.card-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-third);
  font-weight: 600;
  font-family: var(--font-sans);
}

.auth-providers {
  margin-bottom: 24px;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
}

.google-btn:hover:not(:disabled) {
  background: var(--btn-primary);
  border-color: rgba(255, 255, 255, 0.15);
  filter: brightness(0.9);
}

.google-btn:active:not(:disabled) {
  filter: brightness(0.85);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-third);
  font-family: var(--font-sans);
  font-weight: 600;
}

.auth-footer p {
  margin: 0 0 8px 0;
}

.legal-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.legal-links a {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
  position: relative;
  font-family: var(--font-sans);
}

.legal-links a:hover {
  opacity: 0.8;
}

.legal-links span {
  color: var(--text-third);
  font-weight: 600;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }
  
  .brand-text h1 {
    font-size: 24px;
  }
}
</style>

