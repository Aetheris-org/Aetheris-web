<template>
  <Transition name="share-fade">
    <div v-if="visible" class="share-panel-overlay" @click="closePanel">
      <div class="share-panel" @click.stop>
        <div class="share-panel-content">
          <h3 class="share-panel-title">{{ t('share.title') }}</h3>
          <p class="share-panel-subtitle">{{ t('share.subtitle') }}</p>
          
          <div class="share-options">
            <button class="share-option" @click="copyLink">
              <div class="share-icon-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07v0a5 5 0 0 1-7.07 0l-1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11a5 5 0 0 1-7.07 0L5.5 9.57a5 5 0 0 1 0-7.07v0a5 5 0 0 1 7.07 0L14 3.91" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.copyLink') }}</span>
            </button>

            <button class="share-option" @click="shareToTwitter">
              <div class="share-icon-container twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.twitter') }}</span>
            </button>

            <button class="share-option" @click="shareToFacebook">
              <div class="share-icon-container facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.facebook') }}</span>
            </button>

            <button class="share-option" @click="shareToLinkedIn">
              <div class="share-icon-container linkedin">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.linkedin') }}</span>
            </button>

            <button class="share-option" @click="shareToTelegram">
              <div class="share-icon-container telegram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.telegram') }}</span>
            </button>

            <button class="share-option" @click="shareToWhatsApp">
              <div class="share-icon-container whatsapp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.214-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="share-option-text">{{ t('share.whatsapp') }}</span>
            </button>
          </div>
          
          <div class="share-panel-buttons">
            <button class="share-panel-button cancel" @click="closePanel">{{ t('share.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  articleUrl: string
  articleTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const toast = useToast()
const { t } = useI18n()

const closePanel = () => {
  emit('close')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.articleUrl)
    toast.add({
      severity: 'success',
      summary: t('share.success.summary'),
      detail: t('share.success.detail'),
      life: 3000
    })
    closePanel()
  } catch (err) {
    console.error('Ошибка при копировании ссылки:', err)
    toast.add({
      severity: 'error',
      summary: t('share.error.summary'),
      detail: t('share.error.detail'),
      life: 3000
    })
  }
}

const shareToTwitter = () => {
  const text = encodeURIComponent(`"${props.articleTitle}"`)
  const url = encodeURIComponent(props.articleUrl)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
  closePanel()
}

const shareToFacebook = () => {
  const url = encodeURIComponent(props.articleUrl)
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
  closePanel()
}

const shareToLinkedIn = () => {
  const url = encodeURIComponent(props.articleUrl)
  const title = encodeURIComponent(props.articleTitle)
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`
  window.open(linkedinUrl, '_blank', 'width=600,height=400')
  closePanel()
}

const shareToTelegram = () => {
  const text = encodeURIComponent(`"${props.articleTitle}"`)
  const url = encodeURIComponent(props.articleUrl)
  const telegramUrl = `https://t.me/share/url?url=${url}&text=${text}`
  window.open(telegramUrl, '_blank', 'width=600,height=400')
  closePanel()
}

const shareToWhatsApp = () => {
  const text = encodeURIComponent(`"${props.articleTitle}" ${props.articleUrl}`)
  const whatsappUrl = `https://wa.me/?text=${text}`
  window.open(whatsappUrl, '_blank', 'width=600,height=400')
  closePanel()
}
</script>

<style scoped>
.share-fade-enter-active,
.share-fade-leave-active {
  transition: opacity 0.25s ease;
}

.share-fade-enter-from,
.share-fade-leave-to {
  opacity: 0;
}

.share-fade-enter-from .share-panel,
.share-fade-leave-to .share-panel {
  transform: translateY(12px);
  opacity: 0.98;
}

.share-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.share-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.share-panel-content {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.share-panel-title {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 12px 0;
}

.share-panel-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  margin: 0 0 24px 0;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-primary);
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.share-option:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.share-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.share-icon-container svg {
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.share-option:hover .share-icon-container {
  background-color: rgba(255, 255, 255, 0.15);
}

.share-option:hover .share-icon-container svg {
  transform: scale(1.1);
}

/* Цвета для разных социальных сетей */
.share-option:hover .share-icon-container.twitter {
  background-color: rgba(29, 161, 242, 0.2);
}

.share-option:hover .share-icon-container.twitter svg {
  color: #1da1f2;
}

.share-option:hover .share-icon-container.facebook {
  background-color: rgba(24, 119, 242, 0.2);
}

.share-option:hover .share-icon-container.facebook svg {
  color: #1877f2;
}

.share-option:hover .share-icon-container.linkedin {
  background-color: rgba(0, 119, 181, 0.2);
}

.share-option:hover .share-icon-container.linkedin svg {
  color: #0077b5;
}

.share-option:hover .share-icon-container.telegram {
  background-color: rgba(0, 136, 204, 0.2);
}

.share-option:hover .share-icon-container.telegram svg {
  color: #0088cc;
}

.share-option:hover .share-icon-container.whatsapp {
  background-color: rgba(37, 211, 102, 0.2);
}

.share-option:hover .share-icon-container.whatsapp svg {
  color: #25d366;
}

.share-option-text {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
}

.share-panel-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.share-panel-button {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.share-panel-button.cancel {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: 2px solid var(--text-secondary);
}

.share-panel-button.cancel:hover {
  background-color: var(--text-secondary);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .share-panel-content {
    padding: 24px;
    min-width: 320px;
    max-width: 90vw;
    margin: 0 20px;
  }
  
  .share-panel-title {
    font-size: 24px;
  }
  
  .share-panel-subtitle {
    font-size: 16px;
  }
  
  .share-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .share-option {
    padding: 16px;
  }
  
  .share-icon-container {
    width: 40px;
    height: 40px;
  }
  
  .share-option-text {
    font-size: 16px;
  }
}
</style>
