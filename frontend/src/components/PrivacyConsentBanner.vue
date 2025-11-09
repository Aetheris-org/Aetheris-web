<template>
  <Transition name="consent-fade">
    <div v-if="shouldShow" class="consent-banner" role="dialog" aria-live="polite">
      <div class="consent-content">
        <p class="consent-text">
          {{ t('privacyConsent.message') }}
        </p>
        <div class="consent-actions">
          <button class="consent-btn read" @click="goToPolicy">{{ t('privacyConsent.read') }}</button>
          <button class="consent-btn agree" @click="agree">{{ t('privacyConsent.agree') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const shouldShow = ref(false)

const consentKey = computed(() => {
  const id = auth.user?.id
  return id ? `privacy_consent_${id}` : null
})

const evaluateVisibility = () => {
  if (!auth.isAuthenticated || !auth.user?.id) {
    shouldShow.value = false
    return
  }
  const key = consentKey.value
  if (!key) {
    shouldShow.value = false
    return
  }
  const stored = localStorage.getItem(key)
  shouldShow.value = stored !== 'true'
}

const agree = () => {
  const key = consentKey.value
  if (key) localStorage.setItem(key, 'true')
  shouldShow.value = false
}

const goToPolicy = () => {
  // Primary destination is the legal page as requested
  const potentialRoutes = ['/legal', '/policy/privacy', '/policy', '/settings/privacy']
  const target = potentialRoutes.find(Boolean)
  router.push(target || '/')
}

onMounted(() => {
  evaluateVisibility()
})

watch(() => auth.user, () => evaluateVisibility(), { deep: true })
watch(() => auth.isAuthenticated, () => evaluateVisibility())
</script>

<style scoped>
.consent-banner {
  position: fixed;
  left: 50%;
  bottom: 36px;
  transform: translateX(-50%);
  z-index: 100000001;
  max-width: 1060px;
  width: calc(100vw - 40px);
}

.consent-content {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 18px;
}

.consent-text {
  margin: 0;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 18px;
  line-height: 1.4;
  flex: 1;
}

.consent-actions {
  display: flex;
  gap: 12px;
}

.consent-btn {
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  font-family: var(--font-sans);
  font-size: 16px;
  cursor: pointer;
}

.consent-btn.read { 
  background: rgba(255, 255, 255, 0.08); 
  color: var(--text-primary); 
}
.consent-btn.agree { 
  background: var(--primary-violet); 
  color: white; 
}

.consent-fade-enter-active, .consent-fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.consent-fade-enter-from, .consent-fade-leave-to { opacity: 0; transform: translate(-50%, 8px); }
</style>


