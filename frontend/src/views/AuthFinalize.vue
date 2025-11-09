<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import AeLogo from '@/components/Ae_logo.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const nickname = ref('')
const error = ref('')
const saving = ref(false)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'

onMounted(() => {
  console.log('🔵 AuthFinalize mounted, auth state:', {
    isAuthenticated: auth.isAuthenticated,
    hasUser: !!auth.user,
    username: auth.user?.username
  })
  
  // Загружаем данные из storage
  auth.loadFromStorage()
  
  if (!auth.isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /auth')
    router.replace('/auth')
    return
  }

  // Если у пользователя уже есть никнейм, редиректим на главную
  // Проверяем что username не является временным (user_xxxxx) или хешем (hash-xxxxx)
  const hasValidUsername = auth.user?.username && 
                           auth.user.username !== auth.user.email &&
                           !auth.user.username.startsWith('user_') &&
                           !auth.user.username.startsWith('hash-')
  
  console.log('🔵 Username validation:', {
    username: auth.user?.username,
    hasValidUsername
  })
  
  if (hasValidUsername) {
    console.log('✅ User already has valid username, redirecting')
    const savedRedirect = sessionStorage.getItem('auth_redirect')
    sessionStorage.removeItem('auth_redirect')
    router.replace(savedRedirect || '/')
    return
  }

  console.log('✅ User needs to set username, showing form')
  // Оставляем поле пустым для безопасности (не показываем хеш или временный username)
  nickname.value = ''
})

const nicknameError = computed(() => {
  if (!nickname.value) {
    return t('authFinalize.input.errors.empty')
  }
  if (nickname.value.length < 3) {
    return t('authFinalize.input.errors.min')
  }
  if (nickname.value.length > 24) {
    return t('authFinalize.input.errors.max')
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(nickname.value)) {
    return t('authFinalize.input.errors.pattern')
  }
  return ''
})

const canSave = computed(() => {
  return !nicknameError.value && !saving.value && nickname.value.trim() !== ''
})

async function saveNickname() {
  if (!canSave.value) return

  saving.value = true
  error.value = ''

  try {
    // Обновляем профиль через кастомный безопасный endpoint
    const response = await api.put('/api/users/me', {
      username: nickname.value.trim(),
    })

    // Обновляем данные в store
    if (response.data) {
      auth.setUser({
        ...auth.user!,
        username: response.data.username,
      })
    }

    // Редиректим на сохранённый redirect или на главную
    const savedRedirect = sessionStorage.getItem('auth_redirect')
    sessionStorage.removeItem('auth_redirect')
    router.replace(savedRedirect || '/')
  } catch (err: any) {
    console.error('Failed to update username:', err)
    
    // Обрабатываем ошибки от Strapi
    if (err.response?.data?.error?.message) {
      error.value = err.response.data.error.message
    } else if (err.response?.status === 400) {
      error.value = t('authFinalize.errors.duplicate')
    } else {
      error.value = t('authFinalize.errors.generic')
    }
  } finally {
    saving.value = false
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && canSave.value) {
    saveNickname()
  }
}
</script>

<template>
  <div class="finalize-page">
    <div class="finalize-card">
      <div class="card-header">
        <div class="brand">
          <AeLogo class="brand-logo" />
          <div class="brand-text">
            <span class="brand-caption">{{ $t('authFinalize.brandCaption') }}</span>
            <h1>{{ $t('authFinalize.title') }}</h1>
          </div>
        </div>
        <p class="card-subtitle">{{ $t('authFinalize.subtitle') }}</p>
      </div>

      <form @submit.prevent="saveNickname" class="finalize-form">
        <label class="input-label" for="nickname">{{ $t('authFinalize.input.label') }}</label>
  <div class="input-wrapper" :class="{ 'has-error': nicknameError || error }">
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            :placeholder="$t('authFinalize.input.placeholder')"
            :disabled="saving"
            @keypress="handleKeyPress"
            autofocus
          />
          <span class="input-focus-ring"></span>
        </div>

        <p v-if="nicknameError" class="validation-error">{{ nicknameError }}</p>
        <p v-if="error" class="server-error">{{ error }}</p>
        <p class="input-hint">{{ $t('authFinalize.input.hint') }}</p>

        <button
          type="submit"
          class="save-btn"
          :disabled="!canSave"
        >
          <span v-if="!saving">{{ $t('authFinalize.button.submit') }}</span>
          <span v-else class="saving-state">
            <span class="spinner-small"></span>
            {{ $t('authFinalize.button.saving') }}
          </span>
        </button>
      </form>

      <div class="finalize-footer">
        <p>{{ $t('authFinalize.footer') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finalize-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.finalize-card {
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
}

.brand {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-left: 12px;
}

.brand-logo :deep(svg) {
  width: 56px;
  height: 68px;
  filter: drop-shadow(0 10px 30px rgba(140, 0, 255, 0.22));
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brand-caption {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-third);
  font-weight: 700;
  font-family: var(--font-comfortaa);
}

.brand-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.card-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-third);
  font-weight: 600;
}

.finalize-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  font-family: var(--font-sans);
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  color: var(--text-primary);
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  transition: border-color 0.15s ease, background 0.15s ease;
  outline: none;
  font-family: var(--font-sans);
  font-weight: 600;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.32);
}

.input-wrapper input:focus {
  border-color: var(--primary-violet);
  background: transparent;
}

.input-wrapper.has-error input {
  border-color: var(--text-red);
  background: transparent;
}

.input-wrapper.has-error input:focus {
  border-color: var(--text-red);
}

.input-wrapper input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.validation-error,
.server-error {
  margin-top: -4px;
  font-size: 13px;
  color: var(--text-red);
  font-weight: 500;
  font-family: var(--font-sans);
}

.server-error {
  color: #ff6b6b;
}

.input-hint {
  margin-top: -4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-third);
  font-family: var(--font-sans);
  font-weight: 500;
}

.save-btn {
  margin-top: 8px;
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(120deg, var(--primary-violet), var(--primary-blue));
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: filter 0.15s ease, opacity 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
}

.save-btn:hover:not(:disabled) {
  filter: brightness(0.9);
}

.save-btn:active:not(:disabled) {
  filter: brightness(0.82);
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: none;
}

.saving-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.finalize-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text-third);
  letter-spacing: 0.01em;
  font-family: var(--font-sans);
  font-weight: 600;
}

.finalize-footer p {
  margin: 0;
}

@media (max-width: 600px) {
  .finalize-page {
    padding: 32px 16px;
  }

  .finalize-card {
    padding: 32px 24px 28px;
    border-radius: 22px;
  }

  .brand {
    gap: 12px;
  }

  .brand-logo :deep(svg) {
    width: 48px;
    height: 58px;
  }

  .brand-text h1 {
    font-size: 24px;
  }

  .card-subtitle {
    font-size: 14px;
  }
}
</style>
