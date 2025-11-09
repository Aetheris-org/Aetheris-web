<template>
  <div class="article-card-line" @click="handleCardClick">
    <div class="thumbnail" @click.stop="openImagePreview">
      <img 
        v-if="safePreviewUrl" 
        :src="safePreviewUrl"
        :alt="article.title"
        @error="onPreviewError"
        @load="onPreviewLoad"
        decoding="async"
        loading="lazy"
      />
      <div v-else class="thumb-fallback">{{ article.title.charAt(0).toUpperCase() }}</div>
    </div>
    <div class="content">
      <div class="header">
        <div class="avatar" @click.stop="emit('authorClick', article.author.id)">
          <AvatarImage :src="safeAvatarUrl || null" :alt="article.author.username" />
        </div>
        <div class="author-block" @click.stop="emit('authorClick', article.author.id)">
          <div class="username-with-badge">
            <div class="author">{{ article.author.username }}</div>
            <span v-if="isAuthor" class="self-badge">{{ t('labels.you') }}</span>
          </div>
          <span class="dot">•</span>
          <div class="time">{{ formatDate(article.createdAt) }}</div>
        </div>
      </div>
      <div class="title-row">
        <h3 class="title">{{ article.title }}</h3>
        <span v-if="article.status === 'draft'" class="badge">Draft</span>
      </div>
      
      <!-- Metadata: difficulty and reading time -->
      <div class="metadata">
        <div class="metadata-item difficulty" :class="`difficulty-${article.difficulty || 'medium'}`">
          <img class="metadata-icon" :src="fireIcon" alt="Difficulty" width="14" height="14">
          <span class="metadata-text">{{ getDifficultyText(article.difficulty) }}</span>
        </div>
        <div class="metadata-item time">
          <i class="pi pi-clock metadata-icon"></i>
          <span class="metadata-text">{{ readingTime }} min</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="tags">
        <Tag 
          v-for="tag in (article.tags || []).slice(0,4)" 
          :key="tag" 
          :value="tag" 
          :severity="getTagSeverity(tag)"
          class="tag" 
          @click.stop="emit('tagClick', tag)" 
        />
      </div>
    </div>
    
    <!-- Vertical action buttons on the right -->
    <div class="action-buttons" @click.stop v-if="article.status !== 'draft'">
      <button class="action-btn like-btn" @click.stop="onLike" :class="{ 'active': isLiked }" :disabled="isLikeLoading">
        <svg v-if="!isLikeLoading" class="heart-icon" :class="{ 'filled': isLiked }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :fill="isLiked ? 'currentColor' : 'none'"
          />
        </svg>
        <div v-else class="spinner"></div>
        <span class="action-count">{{ likesCount }}</span>
      </button>

      <button class="action-btn dislike-btn" @click.stop="onDislike" :class="{ 'active': isDisliked }" :disabled="isDislikeLoading">
        <svg v-if="!isDislikeLoading" class="dislike-icon" :class="{ 'filled': isDisliked }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :fill="isDisliked ? 'currentColor' : 'none'"
          />
        </svg>
        <div v-else class="spinner"></div>
        <span class="action-count">{{ dislikesCount }}</span>
      </button>

      <button class="action-btn comment-btn" @click.stop="onComment">
        <svg class="comment-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
          />
        </svg>
        <span class="action-count">{{ commentsCount }}</span>
      </button>

      <button class="action-btn bookmark-btn" @click.stop="onBookmark" :class="{ 'active': isBookmarked }">
        <svg class="bookmark-icon" :class="{ 'filled': isBookmarked }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :fill="isBookmarked ? 'currentColor' : 'none'"
          />
        </svg>
      </button>

      <button class="action-btn share-btn" @click.stop="onShare" :class="{ 'active': isShared }">
        <svg class="share-icon" :class="{ 'filled': isShared }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="5" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
          <circle cx="6" cy="12" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
          <circle cx="18" cy="19" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
          <path d="m8.59 13.51 6.83 3.98" stroke="currentColor" :stroke-width="isShared ? '3' : '2'" stroke-linecap="round"/>
          <path d="m15.41 6.51-6.82 3.98" stroke="currentColor" :stroke-width="isShared ? '3' : '2'" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Image Preview Modal -->
  <teleport to="body">
    <Transition name="image-fade">
    <div v-if="isImagePreviewOpen" class="image-preview-overlay" @click="closeImagePreview">
      <div class="image-preview-content" @click.stop>
        <div class="image-zoom-box" :class="[`zoom-${zoomLevel}`]">
          <img 
            v-if="safePreviewUrl"
            :src="safePreviewUrl" 
            :alt="article.title" 
            class="image-preview-img"
            @click.stop="toggleImageZoom"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
          />
          <button class="image-preview-close" @click="closeImagePreview" aria-label="Close preview">×</button>
        </div>
      </div>
    </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import Tag from 'primevue/tag'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/article'
import { useArticles } from '@/composables/useArticles'
import { toggleBookmark } from '@/api/articles'
import { sanitizeAvatarUrl, sanitizePreviewUrl } from '@/utils/avatarValidation'
import AvatarImage from './AvatarImage.vue'

const fireIcon = new URL('@/assets/svgs/fire_ico.svg', import.meta.url).href

const props = defineProps<{ article: Article }>()
const emit = defineEmits(['tagClick','authorClick','articleClick', 'shareArticle'])

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const authStore = useAuthStore()
const { react } = useArticles()

const isLiked = ref(props.article.userReaction === 'like')
const isDisliked = ref(props.article.userReaction === 'dislike')
const likesCount = ref(props.article.likes || 0)
const dislikesCount = ref(props.article.dislikes || 0)
const isLikeLoading = ref(false)
const isDislikeLoading = ref(false)
const commentsCount = ref(props.article.commentsCount || 0)
const isBookmarked = ref(false)
const isShared = ref(false)
const previewError = ref(false)
const previewLoaded = ref(false)
const isImagePreviewOpen = ref(false)
const zoomLevel = ref(1) // 1 = 1.6x (default), 2 = 2.2x, 3 = 3.0x

// Безопасный URL аватара
const safeAvatarUrl = computed(() => {
  return sanitizeAvatarUrl(props.article.author.avatar)
})

// Безопасный URL превью
const safePreviewUrl = computed(() => {
  if (previewError.value) return null
  return sanitizePreviewUrl(props.article.previewImage)
})

// Обработчики загрузки превью
const onPreviewError = () => {
  previewError.value = true
  previewLoaded.value = false
}

const onPreviewLoad = () => {
  previewLoaded.value = true
  previewError.value = false
}

// Сбрасываем ошибку превью при изменении URL
watch(() => props.article.previewImage, () => {
  previewError.value = false
  previewLoaded.value = false
})

const readingTime = computed(() => {
  const contentLength = props.article.content?.length || props.article.excerpt?.length || 0
  return Math.max(1, Math.ceil(contentLength / 1000)) // ~1000 символов в минуту
})

const isAuthor = computed(() => {
  if (!authStore.user) return false
  if (props.article.author.id) {
    return authStore.user.id === props.article.author.id
  }
  return false
})

const getDifficultyText = (difficulty: string | undefined): string => {
  switch (difficulty) {
    case 'easy': return 'Easy'
    case 'medium': return 'Medium'
    case 'hard': return 'Hard'
    default: return 'Medium'
  }
}

const tagColors = ['success', 'info', 'warning', 'danger', 'secondary'] as const
const tagColorGroups: Record<'success' | 'info' | 'warning' | 'danger' | 'secondary', string[]> = {
  success: ['JavaScript', 'Vue.js', 'React', 'Node.js', 'Web Development', 'Frontend', 'Tutorial', 'Guide'],
  info: ['Python', 'TypeScript', 'Angular', 'Programming', 'Backend', 'Database', 'SQL', 'API', 'REST'],
  warning: ['Design', 'UI/UX', 'Mobile Development', 'Game Development', 'Unity', 'Unreal Engine', 'Review', 'Interview'],
  danger: ['Security', 'Testing', 'Cryptography', 'DevOps', 'Docker', 'Kubernetes', 'Blockchain'],
  secondary: ['Tools', 'Git', 'NoSQL', 'Fullstack', 'Artificial Intelligence', 'Machine Learning', 'GraphQL', 'Microservices', 'Cloud', 'AWS', 'Azure', 'Google Cloud', 'Linux', 'Windows', 'macOS', 'News', 'Case Study', 'Architecture', 'Algorithms', 'Design Patterns']
}

const getTagSeverity = (tag: string): typeof tagColors[number] => {
  if (tagColorGroups.success.includes(tag)) return 'success'
  if (tagColorGroups.info.includes(tag)) return 'info'
  if (tagColorGroups.warning.includes(tag)) return 'warning'
  if (tagColorGroups.danger.includes(tag)) return 'danger'
  if (tagColorGroups.secondary.includes(tag)) return 'secondary'
  
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % tagColors.length
  return tagColors[index]
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const handleCardClick = () => {
  // Проверяем авторизацию
  if (!authStore.isAuthenticated) {
    // Показываем уведомление о необходимости авторизации
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    
    // Перенаправляем на страницу авторизации
    router.push('/auth')
    return
  }
  
  // Эмитим событие для перехода к статье
  emit('articleClick', props.article.id)
}

const onLike = async () => {
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }
  
  if (isLikeLoading.value) return
  
  isLikeLoading.value = true
  try {
    const updated = await react(props.article.id, 'like')
    likesCount.value = updated.likes ?? 0
    dislikesCount.value = updated.dislikes ?? 0
    isLiked.value = updated.userReaction === 'like'
    isDisliked.value = updated.userReaction === 'dislike'
  } catch (e) {
    console.error('Ошибка лайка:', e)
  } finally {
    isLikeLoading.value = false
  }
}

const onDislike = async () => {
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }
  
  if (isDislikeLoading.value) return
  
  isDislikeLoading.value = true
  try {
    const updated = await react(props.article.id, 'dislike')
    likesCount.value = updated.likes ?? 0
    dislikesCount.value = updated.dislikes ?? 0
    isLiked.value = updated.userReaction === 'like'
    isDisliked.value = updated.userReaction === 'dislike'
  } catch (e) {
    console.error('Ошибка дизлайка:', e)
  } finally {
    isDislikeLoading.value = false
  }
}

const onComment = () => {
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }
  router.push(`/article/${props.article.id}#comments`)
}

const onBookmark = async () => {
  if (!authStore.isAuthenticated || !authStore.user) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }
  
  try {
    const previousState = isBookmarked.value
    isBookmarked.value = !previousState
    
    const response = await toggleBookmark(props.article.id)
    isBookmarked.value = response.is_bookmarked
    
    if (response.was_added) {
      toast.add({
        severity: 'success',
        summary: t('notifications.bookmark.added.summary', 'Статья добавлена в избранное'),
        detail: t('notifications.bookmark.added.detail', 'Вы можете найти её на странице избранного'),
        life: 3000
      })
    }
    
    // Отправляем событие обновления закладок для обновления страницы избранного
    window.dispatchEvent(new CustomEvent('bookmark:updated', { 
      detail: { articleId: props.article.id, isBookmarked: response.is_bookmarked } 
    }))
  } catch (error) {
    isBookmarked.value = !isBookmarked.value
    console.error('Ошибка при работе с закладкой:', error)
  }
}

const onShare = () => {
  isShared.value = true
  emit('shareArticle', { id: props.article.id, title: props.article.title })
}

// Image preview functions
function openImagePreview() {
  if (!safePreviewUrl.value) return
  isImagePreviewOpen.value = true
  zoomLevel.value = 1
  try { document.body.style.overflow = 'hidden' } catch {}
}

function closeImagePreview() {
  isImagePreviewOpen.value = false
  zoomLevel.value = 1
  try { document.body.style.overflow = '' } catch {}
}

function toggleImageZoom() {
  zoomLevel.value = zoomLevel.value >= 3 ? 1 : zoomLevel.value + 1
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isImagePreviewOpen.value) {
    closeImagePreview()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // Используем isBookmarked из props статьи (получено с сервера одним запросом)
  if (props.article.isBookmarked !== undefined) {
    isBookmarked.value = props.article.isBookmarked
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.article-card-line {
  display: flex;
  background-color: var(--bg-secondary);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  position: relative;
}
.article-card-line:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
.thumbnail { width: 220px; height: 100%; min-height: 160px; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: stretch; }
.thumbnail img { width: 100%; height: 100%; object-fit: cover; }
.thumb-fallback { color: var(--text-secondary); font-weight: 700; font-family: var(--font-sans); font-size: 28px; }
.content { display: flex; flex-direction: column; padding: 12px 14px; gap: 8px; min-width: 0; flex: 1; }
.action-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
  gap: 8px;
  padding: 12px 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  width: 180px;
}
.header { display: flex; align-items: center; gap: 10px; }
.avatar { 
  width: 44px; 
  height: 44px; 
  border-radius: 50%; 
  overflow: hidden; 
  background: var(--btn-primary); 
  flex-shrink: 0; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer;
}
/* Стили для AvatarImage компонента */
.avatar :deep(.avatar-container) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar :deep(.avatar-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-fallback { color: var(--text-primary); font-weight: 700; font-family: var(--font-sans); }
.author-block { 
  display: flex; 
  flex-direction: row; 
  align-items: center;
  gap: 6px;
}

.username-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.author { 
  color: var(--text-primary); 
  font-size: 16px; 
  font-family: var(--font-sans); 
  font-weight: 700; 
}

.self-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(140, 0, 255, 0.1);
  color: var(--primary-violet);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.dot {
  opacity: 0.6;
  color: var(--text-secondary);
}
.time { 
  color: var(--text-secondary); 
  font-size: 14px; 
  font-family: var(--font-sans); 
  font-weight: 600; 
}
.title-row { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-top: 4px;
}
.title { 
  color: var(--text-primary); 
  font-size: 20px; 
  font-family: var(--font-sans); 
  font-weight: 700; 
  margin: 0; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}
.badge { 
  background: var(--badge-draft-bg); 
  color: var(--badge-draft-text); 
  border: 1px solid var(--badge-draft-border); 
  padding: 2px 8px; 
  border-radius: 999px; 
  font-size: 11px; 
  font-weight: 700; 
}

.metadata {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 4px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: 13px;
}

.metadata-item.difficulty {
  padding: 5px 12px;
  border-radius: 20px;
  height: 26px;
}

.metadata-item.difficulty-easy {
  background-color: var(--difficulty-easy-bg);
}
.metadata-item.difficulty-easy .metadata-icon {
  filter: var(--difficulty-easy-icon);
}
.metadata-item.difficulty-easy .metadata-text {
  color: var(--difficulty-easy-text);
}

.metadata-item.difficulty-medium {
  background-color: var(--difficulty-medium-bg);
}
.metadata-item.difficulty-medium .metadata-icon {
  filter: var(--difficulty-medium-icon);
}
.metadata-item.difficulty-medium .metadata-text {
  color: var(--difficulty-medium-text);
}

.metadata-item.difficulty-hard {
  background-color: var(--difficulty-hard-bg);
}
.metadata-item.difficulty-hard .metadata-icon {
  filter: var(--difficulty-hard-icon);
}
.metadata-item.difficulty-hard .metadata-text {
  color: var(--difficulty-hard-text);
}

.metadata-icon {
  font-size: 14px;
  color: var(--ui-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metadata-text {
  font-size: 13px;
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--ui-gray);
}

.tags { 
  display: flex; 
  gap: 6px; 
  margin-top: 2px; 
  flex-wrap: wrap;
}
::deep(.tag) { 
  font-size: 12px !important; 
  padding: 5px 10px !important; 
  border-radius: 10px !important; 
}

.action-btn {
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-btn.active {
  color: var(--primary-violet);
}

.action-btn.like-btn.active {
  color: #ef4444;
}

.action-btn.bookmark-btn.active {
  color: #f59e0b;
}

.action-btn.bookmark-btn,
.action-btn.share-btn {
  gap: 0;
}

.action-btn.dislike-btn {
  &:hover {
    background-color: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
  }
  
  &.active {
    background-color: rgba(156, 163, 175, 0.15);
    color: #9ca3af;
  }
}

.action-btn.share-btn {
  &:hover {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  
  &.active {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
}

.action-count {
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .thumbnail { width: 140px; min-height: 100px; }
  .title { font-size: 18px; }
  .action-buttons {
    padding: 10px 8px;
    gap: 6px;
    width: 150px;
  }
  .action-btn {
    padding: 6px;
    width: 44px;
    height: 44px;
    font-size: 12px;
    gap: 4px;
  }
  .action-btn svg {
    width: 18px;
    height: 18px;
  }
  .action-count {
    font-size: 12px;
  }
}

/* Image Preview Modal */
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.2s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}

.image-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60000;
  cursor: zoom-out;
}

.image-preview-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 80vw;
  max-height: 80vh;
  padding: 40px;
}

.image-zoom-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 0.25s ease;
  max-width: 100%;
  max-height: 100%;
}

.image-zoom-box.zoom-1 {
  transform: scale(1.1);
}

.image-zoom-box.zoom-2 {
  transform: scale(1.4);
}

.image-zoom-box.zoom-3 {
  transform: scale(1.8);
}

.image-preview-img {
  max-width: 70vw;
  max-height: 70vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  transition: transform 0.25s ease, cursor 0.2s ease;
  cursor: zoom-in;
  background: transparent;
  padding: 0;
}

.image-zoom-box.zoom-1 .image-preview-img {
  cursor: zoom-in;
}

.image-zoom-box.zoom-2 .image-preview-img {
  cursor: zoom-in;
}

.image-zoom-box.zoom-3 .image-preview-img {
  cursor: zoom-out;
}

.image-preview-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-close:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>


