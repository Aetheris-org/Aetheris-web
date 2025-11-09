<template>
  <teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click="onCancel">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <div class="warning-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.29 3.86L1.82 18c-.175.302-.267.645-.268.994-.001.35.089.693.262.997.173.303.423.556.724.733.3.177.642.272.991.276H20.47c.349-.004.691-.099.992-.276.301-.177.55-.43.723-.733.173-.304.263-.647.262-.997-.001-.349-.093-.692-.268-.994L13.71 3.86A2.5 2.5 0 0 0 12 2.897a2.5 2.5 0 0 0-1.71.963Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="dialog-title">{{ t('notifications.deleteArticle.title') }}</h3>
            <p class="dialog-subtitle">{{ t('notifications.deleteArticle.subtitle') }}</p>
          </div>
          
          <div class="dialog-body">
            <p class="dialog-message">
              {{ t('notifications.deleteArticle.message') }} 
              <span class="article-title">"{{ articleTitle }}"</span>?
            </p>
          </div>
          
          <div class="dialog-footer">
            <button 
              class="dialog-button cancel" 
              @click="onCancel"
              :disabled="loading"
            >
              {{ t('notifications.deleteArticle.cancel') }}
            </button>
            <button 
              class="dialog-button delete" 
              @click="onConfirm"
              :disabled="loading"
            >
              <span v-if="loading">{{ t('notifications.deleteArticle.deleting') }}</span>
              <span v-else>{{ t('notifications.deleteArticle.confirm') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  articleTitle: string
  loading?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000004;
  margin: 0;
  padding: 0;
}

.dialog-content {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header {
  padding: 32px 32px 24px 32px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-icon {
  color: #ef4444;
  margin: 0 auto 16px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
}

.dialog-title {
  color: var(--text-primary);
  font-size: 24px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 8px 0;
}

.dialog-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 400;
  margin: 0;
}

.dialog-body {
  padding: 24px 32px;
}

.dialog-message {
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-sans);
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.article-title {
  color: var(--text-primary);
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.dialog-footer {
  padding: 24px 32px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dialog-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-button.cancel {
  background-color: transparent;
  color: var(--text-secondary);
  border-color: rgba(255, 255, 255, 0.2);
}

.dialog-button.cancel:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.3);
}

.dialog-button.delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 2px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.dialog-button.delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.5);
}

.dialog-button.delete:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.25s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-content,
.dialog-fade-leave-to .dialog-content {
  transform: translateY(12px);
  opacity: 0.98;
}

.dialog-content {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

@media (max-width: 768px) {
  .dialog-content {
    min-width: 320px;
    max-width: 90vw;
    margin: 0 20px;
    border-radius: 20px;
  }
  
  .warning-icon-container {
    padding: 24px 20px 12px 20px;
  }
  
  .warning-icon {
    width: 48px;
    height: 48px;
  }
  
  .dialog-header {
    padding: 0 20px 20px 20px;
  }
  
  .dialog-title {
    font-size: 24px;
  }
  
  .dialog-subtitle {
    font-size: 14px;
  }
  
  .dialog-body {
    padding: 0 20px 20px 20px;
  }
  
  .dialog-message {
    font-size: 16px;
  }
  
  .dialog-footer {
    padding: 16px 20px 24px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .dialog-button {
    min-width: 100%;
    padding: 12px 24px;
  }
}
</style>
