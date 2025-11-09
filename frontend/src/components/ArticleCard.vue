<template>
  <div class="article-card">
    <!-- Header -->
    <div class="article-card-header">
        <div class="logo" @click.stop="onAuthorClick">
          <AvatarImage :src="safeAvatarUrl || null" :alt="article.author.username" />
        </div>
        <div class="nickname-container" @click.stop="onAuthorClick">
            <div class="username-with-badge">
                <h2 class="nickname">{{ article.author.username }}</h2>
                <span v-if="isAuthor" class="self-badge">{{ t('labels.you') }}</span>
            </div>
            <h2 class="publication-time">{{ formatDate(article.createdAt) }}</h2>
        </div>
        <div class="more-options-wrapper" ref="moreMenuRef">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            class="more-options-icon"
            :class="{ 'active': showOptionsMenu }"
            @click.stop="toggleOptionsMenu"
          >
            <path d="M24 26C25.1046 26 26 25.1046 26 24C26 22.8954 25.1046 22 24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M24 12C25.1046 12 26 11.1046 26 10C26 8.89543 25.1046 8 24 8C22.8954 8 22 8.89543 22 10C22 11.1046 22.8954 12 24 12Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M24 40C25.1046 40 26 39.1046 26 38C26 36.8954 25.1046 36 24 36C22.8954 36 22 36.8954 22 38C22 39.1046 22.8954 40 24 40Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <Transition name="dropdown-fade">
            <teleport to="body">
            <div v-if="showOptionsMenu" class="options-dropdown" :style="optionsStyle" @click.stop>
              <button class="dropdown-item" @click="handleCopyLink">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07v0a5 5 0 0 1-7.07 0l-1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11a5 5 0 0 1-7.07 0L5.5 9.57a5 5 0 0 1 0-7.07v0a5 5 0 0 1 7.07 0L14 3.91" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Copy link</span>
              </button>
              <button 
                v-if="isAuthor" 
                class="dropdown-item" 
                @click="handleEditArticle"
              >
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Edit</span>
              </button>
              <button 
                v-if="isAuthor" 
                class="dropdown-item danger" 
                @click="handleDeleteArticle"
              >
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Delete</span>
              </button>
              <button v-if="!isAuthor" class="dropdown-item danger" @click="handleReportArticle">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18c-.175.302-.267.645-.268.994-.001.35.089.693.262.997.173.303.423.556.724.733.3.177.642.272.991.276H20.47c.349-.004.691-.099.992-.276.301-.177.55-.43.723-.733.173-.304.263-.647.262-.997-.001-.349-.093-.692-.268-.994L13.71 3.86A2.5 2.5 0 0 0 12 2.897a2.5 2.5 0 0 0-1.71.963Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Report</span>
              </button>
            </div>
            </teleport>
          </Transition>
        </div>
    </div>
    <!-- Content -->
    <div class="article-card-content">
        <div class="title-row">
          <h2 class="article-card-content-title">{{ article.title }}</h2>
          <span v-if="article.status === 'draft'" class="draft-badge">Draft</span>
          <span v-if="isEdited" class="edited-badge">Edited</span>
        </div>

        <!-- Metadata Panel -->
        <div class="metadata-panel">
        <div class="metadata-item difficulty" :class="`difficulty-${article.difficulty || 'medium'}`">
          <img class="metadata-icon" :src="fireIcon" alt="Difficulty" width="16" height="16">
          <span class="metadata-text">{{ getDifficultyText(article.difficulty) }}</span>
        </div>
            <div class="metadata-item time">
                <i class="pi pi-clock metadata-icon"></i>
                <span class="metadata-text">22 min</span>
            </div>
            <div class="metadata-item views">
                <i class="pi pi-eye metadata-icon"></i>
                <span class="metadata-text">3</span>
            </div>
        </div>

        <div class="tags-container">
            <Tag
              v-for="tag in article.tags"
              :key="tag"
              :value="tag"
              :severity="getTagSeverity(tag)"
              class="custom-tag"
              @click.stop="onTagClick(tag)"
            />
        </div>

        <!-- Preview Block -->
        <div class="article-card-preview">
            <!-- Если превью есть - показываем всегда, даже если была ошибка -->
            <div 
                class="preview-image" 
                v-if="fixedPreviewUrl || safePreviewUrl"
                :style="{ '--preview-bg': `url(${fixedPreviewUrl || safePreviewUrl})` }"
                @click.stop="openImagePreview"
            >
                <img
                    v-if="fixedPreviewUrl || safePreviewUrl"
                    :key="`preview-${article.id}`"
                    :src="fixedPreviewUrl || safePreviewUrl"
                    :alt="article.title"
                    class="preview-img"
                    :class="{ 'image-loading': imageLoading && !imageLoaded }"
                    @error="onImageError"
                    @load="onImageLoad"
                    decoding="async"
                />
                <!-- Индикатор загрузки -->
                <div v-if="imageLoading" class="preview-loading">
                    <div class="preview-loading-spinner"></div>
                </div>
                <!-- Индикатор клика для просмотра -->
                <div class="preview-indicator" v-show="!imageLoading && !imageError">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                    </svg>
                </div>
                <!-- Fallback текст если все попытки исчерпаны -->
                <div v-if="imageError && imageRetryCount >= maxRetries" class="preview-fallback-overlay">
                <span class="preview-fallback-text">
                        Изображение не загружено
                </span>
                </div>
            </div>

            <!-- Если вообще нет превью -->
            <div class="preview-content" v-else>
                <div class="preview-placeholder">
                    <i class="pi pi-image preview-icon"></i>
                    <span class="preview-text">{{ $t('common.articlePreview') }}</span>
                </div>
            </div>
        </div>


        <div class="article-card-content-text" :data-text="decodedArticleText">
            {{ decodedArticleText }}
        </div>
    </div>

    <!-- Footer block with icons and read more button -->
    <div class="article-card-footer">
        <div class="article-actions">
            <div class="action-group" v-if="article.status !== 'draft'">
                <button class="action-btn like-btn" @click.stop="onLike" :class="{ 'active': isLiked }" :disabled="isLikeLoading">
                    <svg v-if="!isLikeLoading" class="heart-icon" :class="{ 'filled': isLiked }" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <svg v-if="!isDislikeLoading" class="dislike-icon" :class="{ 'filled': isDisliked }" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                <button class="action-btn comment-btn" @click.stop="onComment" :class="{ 'active': isCommentsOpen }">
                    <svg class="comment-icon" :class="{ 'filled': isCommentsOpen }" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              :fill="isCommentsOpen ? 'currentColor' : 'none'"
                        />
                    </svg>
                    <span class="action-count">{{ commentsCount }}</span>
                </button>

                <button class="action-btn bookmark-btn" @click.stop="onBookmark" :class="{ 'active': isBookmarked, 'pulse': isBookmarking }">
                    <svg class="bookmark-icon" :class="{ 'filled': isBookmarked }" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <svg class="share-icon" :class="{ 'filled': isShared }" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="5" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
                        <circle cx="6" cy="12" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
                        <circle cx="18" cy="19" r="3" :stroke="isShared ? 'none' : 'currentColor'" stroke-width="2" :fill="isShared ? 'currentColor' : 'none'"/>
                        <path d="m8.59 13.51 6.83 3.98" stroke="currentColor" :stroke-width="isShared ? '3' : '2'" stroke-linecap="round"/>
                        <path d="m15.41 6.51-6.82 3.98" stroke="currentColor" :stroke-width="isShared ? '3' : '2'" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>

        <button class="read-more-btn" @click.stop="onArticleClick">
            {{ t('common.read_more') }}
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
            v-if="fixedPreviewUrl || safePreviewUrl"
            :src="fixedPreviewUrl || safePreviewUrl || ''" 
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

  <!-- Report Panel -->
  <Transition name="report-fade">
  <div v-if="isReportPanelOpen" class="report-panel-overlay" @click="closeReportPanel">
    <div class="report-panel" @click.stop>
      <div class="report-panel-content">
      <h3 class="report-panel-title">Report Article</h3>
      <p class="report-panel-subtitle">Select the reason for reporting:</p>
      
      <div class="report-reasons">
        <label 
          v-for="reason in reportReasons" 
          :key="reason.id" 
          class="reason-item"
          :class="{ 'selected': selectedReasons.includes(reason.id) }"
        >
          <input 
            type="checkbox" 
            :value="reason.id" 
            v-model="selectedReasons"
            class="reason-checkbox"
          />
          <span class="reason-checkmark"></span>
          <span class="reason-title">{{ reason.title }}</span>
        </label>
      </div>
      
      <div class="report-panel-buttons">
        <button class="report-panel-button cancel" @click="closeReportPanel">Cancel</button>
        <button 
          class="report-panel-button confirm" 
          @click="confirmReport"
          :disabled="selectedReasons.length === 0"
        >
          Submit Report
        </button>
      </div>
      </div>
    </div>
  </div>
  </Transition>

  <!-- Delete Confirmation Dialog -->
  <DeleteConfirmDialog
    :visible="isDeleteDialogOpen"
    :article-title="article.title"
    :loading="isDeleting"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
  
  <!-- Uses global Toast from App.vue -->

</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import type { Article, ArticleCardProps, ArticleCardEmits } from '@/types/article'
import { useArticles } from '@/composables/useArticles'
import { useAuthStore } from '@/stores/auth'
import { deleteArticle, toggleBookmark } from '@/api/articles'
import { useUndoableDeleteManager } from '@/composables/useUndoableDeleteManager'
import DeleteConfirmDialog from './DeleteConfirmDialog.vue'
import { sanitizeAvatarUrl, sanitizePreviewUrl } from '@/utils/avatarValidation'
import AvatarImage from './AvatarImage.vue'
const fireIcon = new URL('@/assets/svgs/fire_ico.svg', import.meta.url).href

// === props и emits ===
const props = defineProps<ArticleCardProps>()
const emit = defineEmits<ArticleCardEmits>()

// === composable ===
const { react } = useArticles()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const { startDelete } = useUndoableDeleteManager()

// Инициализация authStore убрана - она должна происходить в главном компоненте

// === состояния ===
const isLiked = ref(props.article.userReaction === 'like')
const isDisliked = ref(props.article.userReaction === 'dislike')
const likesCount = ref(props.article.likes || 0)
const dislikesCount = ref(props.article.dislikes || 0)
const isBookmarked = ref(false)
const isBookmarking = ref(false) // Для визуальной анимации при нажатии
const isCommentsOpen = ref(false)
const isShared = ref(false)
const isLikeLoading = ref(false)
const isDislikeLoading = ref(false)
const commentsCount = ref(props.article.commentsCount || 0)
const imageError = ref(false)
const imageLoading = ref(false)
const imageRetryCount = ref(0)
const maxRetries = 3
const imageLoaded = ref(false)
const showOptionsMenu = ref(false)
const isReportPanelOpen = ref(false)
const selectedReasons = ref<string[]>([])
const isDeleteDialogOpen = ref(false)
const isDeleting = ref(false)
const isImagePreviewOpen = ref(false)
const isImageZoomed = ref(false) // legacy flag no longer used for class
const zoomLevel = ref(1) // 1 = 1.6x (default), 2 = 2.2x, 3 = 3.0x
const avatarError = ref(false) // Флаг ошибки загрузки аватара
const previewError = ref(false) // Флаг ошибки загрузки превью
const fixedPreviewUrl = ref<string | null>(null) // Фиксированный URL для предотвращения изменений во время загрузки

// === computed ===
// Безопасный URL аватара (валидируется перед использованием)
const safeAvatarUrl = computed(() => {
  if (avatarError.value) return null
  return sanitizeAvatarUrl(props.article.author.avatar)
})

// Безопасный URL превью (валидируется перед использованием)
const safePreviewUrl = computed(() => {
  const rawUrl = props.article.previewImage;
  const sanitized = sanitizePreviewUrl(rawUrl);
  
  console.log('🔍 [ArticleCard] safePreviewUrl computed:', {
    articleId: props.article.id,
    rawUrl,
    sanitized
  });
  
  // ВАЖНО: Если URL валидный, показываем его даже если была ошибка
  // previewError устанавливается только после всех попыток загрузки
  if (sanitized) {
    return sanitized;
  }
  
  return null;
})

// Computed для проверки условия v-show
const shouldShowImage = computed(() => {
  const result = !imageLoading.value || imageLoaded.value
  console.log('👁️ [ArticleCard] shouldShowImage - Article', props.article.id, ':', {
    imageLoading: imageLoading.value,
    imageLoaded: imageLoaded.value,
    result
  });
  return result
})

// === handlers ===
const onAvatarError = () => {
  avatarError.value = true
}
const isAuthor = computed(() => {
  console.log('🔍 Checking isAuthor:', {
    'authStore.user': authStore.user,
    'article.author': props.article.author,
    'article.author.id': props.article.author.id,
    'article.author.username': (props.article.author as any).username
  })
  
  // Если author - это объект с id, используем id для сравнения
  if (props.article.author.id) {
    const result = authStore.user && props.article.author.id === authStore.user.id
    console.log('🔍 ID comparison result:', result)
    return result
  }
  
  // Если author - это строка (username), сравниваем по username
  if (typeof props.article.author === 'string') {
    const result = authStore.user && props.article.author === (authStore.user.nickname || (authStore.user as any).username)
    console.log('🔍 String username comparison result:', result)
    return result
  }
  
  // Если author - это объект с username, сравниваем по username
  if ((props.article.author as any).username) {
    const result = authStore.user && (props.article.author as any).username === (authStore.user.nickname || (authStore.user as any).username)
    console.log('🔍 Object username comparison result:', result)
    return result
  }
  
  console.log('🔍 No match found, returning false')
  return false
})

const isEdited = computed(() => {
  const updated = (props.article as any).updatedAt || (props.article as any).updated_at
  const created = (props.article as any).createdAt || (props.article as any).created_at
  if (!updated || !created) return false
  try {
    const cu = new Date(String(created)).getTime()
    const uu = new Date(String(updated)).getTime()
    return !isNaN(cu) && !isNaN(uu) && uu > cu + 60_000 // больше минуты после создания
  } catch { return false }
})


// === watchers ===
watch(() => props.article.userReaction, (v) => {
  isLiked.value = v === 'like'
  isDisliked.value = v === 'dislike'
})
watch(() => props.article.likes, (v) => { likesCount.value = v ?? likesCount.value })
watch(() => props.article.dislikes, (v) => { dislikesCount.value = v ?? dislikesCount.value })

// Сбрасываем ошибку аватара при изменении автора
watch(() => props.article.author.avatar, () => {
  avatarError.value = false
})

// Watcher для отслеживания изменений safePreviewUrl и фиксации URL
watch(safePreviewUrl, (newUrl, oldUrl) => {
  console.log('🔵 [ArticleCard] watch safePreviewUrl:', { 
    articleId: props.article.id,
    newUrl, 
    oldUrl, 
    fixedPreviewUrl: fixedPreviewUrl.value,
    imageLoading: imageLoading.value,
    imageLoaded: imageLoaded.value,
    imageError: imageError.value
  });
  
  // Фиксируем URL когда он появляется впервые или меняется
  if (newUrl && newUrl !== fixedPreviewUrl.value) {
    console.log('✅ [ArticleCard] Fixing URL to:', newUrl);
    fixedPreviewUrl.value = newUrl
    // Сбрасываем ошибки при новом URL
    if (newUrl !== oldUrl) {
      imageError.value = false
      previewError.value = false
      imageRetryCount.value = 0
    }
  } else if (!newUrl) {
    console.log('❌ [ArticleCard] URL is null, clearing fixed URL');
    // Если URL стал null, очищаем фиксированный
    fixedPreviewUrl.value = null
  }
}, { immediate: true })

// Сбрасываем ошибку и состояние загрузки изображения при изменении URL превью
watch(() => props.article.previewImage, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    // ВАЖНО: Всегда сбрасываем ошибки при изменении URL
    // НЕ создаем новый Image() - пусть реальный img тег в DOM загружает изображение
    imageError.value = false
    previewError.value = false
    imageLoading.value = true
    imageLoaded.value = false
    imageRetryCount.value = 0
    
    // Просто сбрасываем fixedPreviewUrl - он установится в watch safePreviewUrl
    fixedPreviewUrl.value = null
  }
})

// === реакция (лайк/дизлайк) ===
const onLike = async () => {
    // Проверяем авторизацию
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
    // Проверяем авторизацию
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

// === теги ===
const tagColors = ['success', 'info', 'warning', 'danger', 'secondary'] as const

// Группы тегов по цветам (синхронизировано с CreateArticle.vue)
const tagColorGroups: Record<'success' | 'info' | 'warning' | 'danger' | 'secondary', string[]> = {
  success: ['JavaScript', 'Vue.js', 'React', 'Node.js', 'Web Development', 'Frontend', 'Tutorial', 'Guide'],
  info: ['Python', 'TypeScript', 'Angular', 'Programming', 'Backend', 'Database', 'SQL', 'API', 'REST'],
  warning: ['Design', 'UI/UX', 'Mobile Development', 'Game Development', 'Unity', 'Unreal Engine', 'Review', 'Interview'],
  danger: ['Security', 'Testing', 'Cryptography', 'DevOps', 'Docker', 'Kubernetes', 'Blockchain'],
  secondary: ['Tools', 'Git', 'NoSQL', 'Fullstack', 'Artificial Intelligence', 'Machine Learning', 'GraphQL', 'Microservices', 'Cloud', 'AWS', 'Azure', 'Google Cloud', 'Linux', 'Windows', 'macOS', 'News', 'Case Study', 'Architecture', 'Algorithms', 'Design Patterns']
}

const getTagSeverity = (tagOrIndex: string | number): typeof tagColors[number] => {
  if (typeof tagOrIndex === 'number') {
    return tagColors[tagOrIndex % tagColors.length]
  }
  
  const tag = tagOrIndex as string
  if (tagColorGroups.success.includes(tag)) return 'success'
  if (tagColorGroups.info.includes(tag)) return 'info'
  if (tagColorGroups.warning.includes(tag)) return 'warning'
  if (tagColorGroups.danger.includes(tag)) return 'danger'
  if (tagColorGroups.secondary.includes(tag)) return 'secondary'
  
  // Fallback
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % tagColors.length
  return tagColors[index]
}

// === прочее ===
const onShare = () => {
  // Переключаем состояние для монолитного вида иконки
  isShared.value = true
  // Эмитим событие для открытия панели поделиться в родительском компоненте
  emit('shareArticle', { id: props.article.id, title: props.article.title })
}

// Метод для сброса состояния share (вызывается при закрытии панели)
const resetShareState = () => {
  isShared.value = false
}

// Экспортируем метод для использования родительским компонентом
defineExpose({
  resetShareState
})
const onTagClick = (tag: string) => {
  emit('tagClick', tag)
}
const onComment = () => {
  // Проверяем авторизацию
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
  
  // Переключаем состояние для монолитного вида иконки
  isCommentsOpen.value = !isCommentsOpen.value
  
  // Переходим на страницу статьи и прокручиваем к разделу комментариев
  router.push(`/article/${props.article.id}#comments`)
}
const handleCardClick = () => {
  console.log('Клик по карточке статьи:', props.article.id, 'Авторизован:', authStore.isAuthenticated)
  
  // Проверяем авторизацию (дополнительная проверка на null/undefined)
  if (!authStore.isAuthenticated || authStore.isAuthenticated === null || authStore.isAuthenticated === undefined) {
    console.log('Пользователь не авторизован, показываем уведомление')
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
  
  console.log('Пользователь авторизован, переходим к статье')
  // Эмитим событие для перехода к статье
  emit('articleClick', props.article.id)
}

const onArticleClick = () => {
  // Эмитим событие для перехода к статье
  emit('articleClick', props.article.id)
}
const onAuthorClick = () => {
  // Получаем ID автора - приоритет: author_id из статьи, затем author.id
  let authorId: number | undefined
  
  // Сначала пробуем получить author_id напрямую из статьи (из бэкенда)
  if (props.article.author_id && props.article.author_id > 0) {
    authorId = props.article.author_id
    console.log('✅ Using author_id from article:', authorId)
  } 
  // Затем пробуем из объекта author
  else if (typeof props.article.author === 'object' && props.article.author && props.article.author.id > 0) {
    authorId = props.article.author.id
    console.log('✅ Using author.id:', authorId)
  }
  
  // Проверяем, что ID валидный (не 0 и не undefined)
  if (authorId && authorId > 0) {
    // Проверяем, является ли текущий пользователь автором статьи
    if (authStore.user && authStore.user.id === authorId) {
      // Показываем уведомление вместо перехода
      toast.add({
        severity: 'info',
        summary: t('notifications.ownArticle.summary', 'Это ваша статья'),
        detail: t('notifications.ownArticle.detail', 'Вы не можете перейти на свой профиль из собственной статьи'),
        life: 3000
      })
      return
    }
    
    console.log('🚀 Navigating to user profile:', authorId)
    // Переходим на профиль пользователя
    router.push(`/user/${authorId}`)
    // Также эмитим событие для обратной совместимости
    emit('authorClick', authorId)
  } else {
    console.warn('❌ Cannot navigate to profile: invalid author ID', {
      author_id: props.article.author_id,
      author: props.article.author,
      articleId: props.article.id,
      authorType: typeof props.article.author
    })
  }
}
const onBookmark = async () => {
  // Проверяем авторизацию
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
    // Включаем визуальную анимацию
    isBookmarking.value = true
    
    // Оптимистично обновляем UI
    const previousState = isBookmarked.value
    isBookmarked.value = !previousState
    
    // Переключаем закладку на сервере
    const response = await toggleBookmark(props.article.id)
    isBookmarked.value = response.is_bookmarked
    
    // Показываем уведомление при успешном добавлении
    if (response.was_added) {
      toast.add({
        severity: 'success',
        summary: t('notifications.bookmark.added.summary', 'Статья добавлена в избранное'),
        detail: t('notifications.bookmark.added.detail', 'Вы можете найти её на странице избранного'),
        life: 3000
      })
    } else {
      toast.add({
        severity: 'info',
        summary: t('notifications.bookmark.removed.summary', 'Статья удалена из избранного'),
        detail: t('notifications.bookmark.removed.detail', 'Статья больше не в списке избранного'),
        life: 3000
      })
    }
    
    // Отключаем анимацию через некоторое время
    setTimeout(() => {
      isBookmarking.value = false
    }, 600)
    
    // Отправляем событие обновления закладок для обновления страницы избранного
    window.dispatchEvent(new CustomEvent('bookmark:updated', { 
      detail: { articleId: props.article.id, isBookmarked: response.is_bookmarked } 
    }))
  } catch (error) {
    // Откатываем оптимистичное обновление при ошибке
    isBookmarked.value = !isBookmarked.value
    isBookmarking.value = false
    console.error('Ошибка при работе с закладкой:', error)
    toast.add({
      severity: 'error',
      summary: t('notifications.bookmark.error.summary', 'Ошибка'),
      detail: t('notifications.bookmark.error.detail', 'Не удалось изменить состояние закладки'),
      life: 3000
    })
  }
}

const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function onImageError(event: Event) {
    const img = event.target as HTMLImageElement
    const currentSrc = img.src
    const expectedSrc = fixedPreviewUrl.value || safePreviewUrl.value
    
    console.error('❌ [ArticleCard] onImageError - Article', props.article.id);
    console.error('   currentSrc:', currentSrc);
    console.error('   expectedSrc:', expectedSrc);
    console.error('   fixedPreviewUrl:', fixedPreviewUrl.value);
    console.error('   safePreviewUrl:', safePreviewUrl.value);
    console.error('   imageLoading:', imageLoading.value);
    console.error('   imageLoaded:', imageLoaded.value);
    console.error('   img.complete:', img.complete);
    console.error('   img.naturalWidth:', img.naturalWidth);
    console.error('   img.naturalHeight:', img.naturalHeight);
    
    // ВАЖНО: Проверяем что ошибка произошла с правильным URL
    if (currentSrc !== expectedSrc && expectedSrc) {
        console.warn('⚠️ [ArticleCard] URL mismatch, fixing...');
        // Если URL не совпадает, устанавливаем правильный немедленно
        if (img && expectedSrc) {
            nextTick(() => {
                if (img && expectedSrc) {
                    img.src = expectedSrc
                    imageError.value = false
                    previewError.value = false
                }
            })
            return
        }
    }
    
    // Все попытки исчерпаны или URL неправильный
    console.error('💥 [ArticleCard] Setting error state');
    imageError.value = true
    previewError.value = true
    imageLoading.value = false
    imageLoaded.value = false
}

function onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement
    console.log('✅ [ArticleCard] onImageLoad - Image loaded!', {
        articleId: props.article.id,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
    });
    
    imageError.value = false
    previewError.value = false
    imageLoading.value = false
    imageLoaded.value = true
}


// Позиционирование меню в портале: вычисляем координаты относительно текущей кнопки
const moreMenuRef = ref<HTMLElement | null>(null)
const optionsStyle = ref({
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: 1000003
})

const updateOptionsPosition = () => {
    if (!moreMenuRef.value) return
    
    const rect = moreMenuRef.value.getBoundingClientRect()
    optionsStyle.value = {
        position: 'fixed',
        top: `${rect.top - 10}px`,
        left: `${rect.left + 70}px`,
        zIndex: 1000003
    }
}

const toggleOptionsMenu = () => {
    showOptionsMenu.value = !showOptionsMenu.value
    if (showOptionsMenu.value) {
        // Обновляем позицию при открытии меню
        nextTick(() => {
            updateOptionsPosition()
        })
    }
}

// Закрываем меню при скролле
const handleScroll = () => {
    if (showOptionsMenu.value) {
        updateOptionsPosition()
    }
}


function handleReportArticle() {
    showOptionsMenu.value = false
    emit('reportArticle', { id: props.article.id, title: props.article.title })
    console.log('[ArticleCard] emit report-article event')
}

// === copy link function ===
const handleCopyLink = async () => {
    showOptionsMenu.value = false
    
    try {
        const articleUrl = `${window.location.origin}/article/${props.article.id}`
        await navigator.clipboard.writeText(articleUrl)
        
        toast.add({
            severity: 'success',
            summary: t('notifications.copyLink.success.summary'),
            detail: t('notifications.copyLink.success.detail'),
            life: 3000
        })
    } catch (err) {
        console.error('Ошибка при копировании ссылки:', err)
        toast.add({
            severity: 'error',
            summary: t('notifications.copyLink.error.summary'),
            detail: t('notifications.copyLink.error.detail'),
            life: 3000
        })
    }
}

// Закрывать меню при клике вне области
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const dropdown = target.closest('.more-options-wrapper')
    const dropdownMenu = target.closest('.options-dropdown')
    if (!dropdown && !dropdownMenu && showOptionsMenu.value) {
        showOptionsMenu.value = false
    }
}

onMounted(async () => {
    console.log('🎬 [ArticleCard] onMounted - Article ID:', props.article.id);
    console.log('   previewImage:', props.article.previewImage);
    console.log('   safePreviewUrl:', safePreviewUrl.value);
    console.log('   fixedPreviewUrl:', fixedPreviewUrl.value);
    console.log('   imageLoading:', imageLoading.value);
    console.log('   imageLoaded:', imageLoaded.value);
    console.log('   imageError:', imageError.value);
    console.log('   shouldShowImage:', shouldShowImage.value);
    
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updateOptionsPosition)
    
    // Используем isBookmarked из props статьи (получено с сервера одним запросом)
    if (props.article.isBookmarked !== undefined) {
        isBookmarked.value = props.article.isBookmarked
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isImagePreviewOpen.value) {
        closeImagePreview()
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', updateOptionsPosition)
})

function openImagePreview() {
    isImagePreviewOpen.value = true
    zoomLevel.value = 1
    try { document.body.style.overflow = 'hidden' } catch {}
}

function closeImagePreview() {
    isImagePreviewOpen.value = false
    isImageZoomed.value = false
    zoomLevel.value = 1
    try { document.body.style.overflow = '' } catch {}
}

function toggleImageZoom() {
    zoomLevel.value = zoomLevel.value >= 3 ? 1 : zoomLevel.value + 1
}

const reportReasons = [
    { id: 'spam', title: 'Spam', description: 'Unwanted commercial content or repetitive messages' },
    { id: 'harassment', title: 'Harassment', description: 'Bullying, threats, or personal attacks' },
    { id: 'hate', title: 'Hate Speech', description: 'Content promoting violence or hatred' },
    { id: 'inappropriate', title: 'Inappropriate Content', description: 'Sexual, violent, or disturbing content' },
    { id: 'misinformation', title: 'Misinformation', description: 'False or misleading information' },
]
// Позиционирование меню в портале: вычисляем координаты относительно текущей кнопки
// No computed positioning needed when dropdown is inside wrapper

const closeReportPanel = () => {
    isReportPanelOpen.value = false
    selectedReasons.value = []
}

const confirmReport = () => {
    console.log('Report article:', props.article.id, 'Reasons:', selectedReasons.value)
    isReportPanelOpen.value = false
    selectedReasons.value = []
}

// === edit functions ===
const handleEditArticle = () => {
    showOptionsMenu.value = false
    emit('editArticle', { id: props.article.id, title: props.article.title })
    // Навигация на страницу редактирования на случай, если родитель не перехватывает событие
    router.push(`/edit-article/${props.article.id}`)
}

// === delete functions ===
const handleDeleteArticle = () => {
    console.log('Delete button clicked!')
    showOptionsMenu.value = false
    isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
    if (!authStore.user) return
    
    isDeleteDialogOpen.value = false
    
    // Сохраняем данные для возможной отмены
    const articleId = props.article.id
    const articleIndex = -1 // Будет установлено родительским компонентом при необходимости
    
    // Начинаем удаление с возможностью отмены
    startDelete(
        `article-${articleId}`,
        'article',
        async () => {
            // Функция выполнится после истечения таймера
            try {
                await deleteArticle(articleId)
                emit('articleDeleted', articleId)
                toast.add({
                    severity: 'success',
                    summary: t('notifications.deleteArticle.success.summary'),
                    detail: t('notifications.deleteArticle.success.detail'),
                    life: 3000
                })
            } catch (error) {
                console.error('Ошибка удаления статьи:', error)
                toast.add({
                    severity: 'error',
                    summary: t('notifications.deleteArticle.error.summary'),
                    detail: t('notifications.deleteArticle.error.detail'),
                    life: 3000
                })
            }
        },
        {
            message: 'Статья будет удалена',
            onUndo: async () => {
                // Отмена удаления - ничего не делаем, статья остается
                toast.add({
                    severity: 'info',
                    summary: 'Удаление отменено',
                    detail: 'Статья не была удалена',
                    life: 2000
                })
            }
        }
    )
}

const cancelDelete = () => {
    isDeleteDialogOpen.value = false
}

// Функция для удаления HTML-тегов и декодирования HTML-сущностей
const stripHtmlTags = (text: string): string => {
    if (!text) return ''
    
    // Создаем временный div элемент
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = text
    
    // Получаем текстовое содержимое без HTML-тегов
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    // Декодируем HTML-сущности
    const textarea = document.createElement('textarea')
    textarea.innerHTML = textContent
    return textarea.value
}

// Computed свойство для очищенного текста статьи
const decodedArticleText = computed(() => {
    const text = props.article.content || props.article.excerpt
    return text ? stripHtmlTags(text) : ''
})

// Функция для получения текста сложности
const getDifficultyText = (difficulty: string | undefined): string => {
    switch (difficulty) {
        case 'easy':
            return 'Easy'
        case 'medium':
            return 'Medium'
        case 'hard':
            return 'Hard'
        default:
            return 'Medium'
    }
}
</script>
<style scoped>
.article-card {
    background-color: var(--bg-secondary);
    border-radius: 70px 70px 15px 15px;
    cursor: default;
    transition: all 0.2s ease-in-out;
    position: relative;
    display: flex;
    flex-direction: column;
    /* Убираем ограничения высоты */
    max-height: none;
    height: auto;

    /* Мобильные устройства */
    @media (max-width: 768px) {
        width: 100%;
        min-height: 500px; /* Оптимальная минимальная высота для мобильных */
        border-radius: 25px 25px 10px 45px;
    }

    /* Планшеты */
    @media (min-width: 769px) and (max-width: 1024px) {
        width: 100%;
        min-height: 650px; /* Оптимальная минимальная высота для планшетов */
        border-radius: 35px 35px 12px 12px;
    }

    /* Десктоп */
    @media (min-width: 1025px) {
        width: 1055px;
        min-height: 800px; /* Оптимальная минимальная высота для десктопа */
        border-radius: 60px 30px 15px 15px;
    }

    &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
}

.article-card-header {
    display: flex;
    height: 120px;
    width: 100%;
    flex-direction: row;
    align-items: center;
}

.more-options-wrapper {
    position: relative;
    margin-left: auto;
    margin-right: 30px;
    z-index: 1; /* Низкий z-index, чтобы не перекрывать dropdown профиля */
}

.more-options-icon {
    width: 31px;
    height: 31px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    
    &:hover {
        color: var(--text-primary);
    }
    
    &.active {
        color: var(--primary-violet);
    }
}

.options-dropdown {
    position: fixed;
    transform: none;
    background-color: var(--bg-secondary);
    border-radius: 16px;
    padding: 10px;
    min-width: 260px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 1000003;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px 18px;
    background: none;
    border: none;
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 20px;
    font-family: var(--font-sans);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    
    svg {
        width: 23px;
        height: 23px;
        color: var(--text-secondary);
        transition: color 0.2s ease;
    }
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        
        svg {
            color: var(--text-primary);
        }
    }
    
    &.danger {
        &:hover {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            
            svg {
                color: #ef4444;
            }
        }
    }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.16s ease-in-out, margin-top 0.16s ease-in-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    margin-top: -4px; /* очень легкое появление сверху */
}

/* Report Panel Transition */
.report-fade-enter-active,
.report-fade-leave-active {
    transition: opacity 0.25s ease;
}

.report-fade-enter-from,
.report-fade-leave-to {
    opacity: 0;
}

/* Subtle slide for panel */
.report-fade-enter-from .report-panel,
.report-fade-leave-to .report-panel {
    transform: translateY(12px);
    opacity: 0.98;
}

.report-panel {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

/* Report Panel */
.report-panel-overlay {
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

.report-panel-content {
    background-color: var(--bg-secondary);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    min-width: 550px;
    max-width: 650px;
    max-height: 80vh;
    overflow-y: auto;
}

.report-panel-title {
    color: var(--text-primary);
    font-size: 28px;
    font-family: var(--font-sans);
    font-weight: 700;
    margin: 0 0 12px 0;
}

.report-panel-subtitle {
    color: var(--text-secondary);
    font-size: 18px;
    font-family: var(--font-sans);
    margin: 0 0 20px 0;
}

.report-reasons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.reason-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background-color: var(--bg-primary);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.reason-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}

.reason-item.selected {
    background-color: rgba(140, 0, 255, 0.1);
    border-color: var(--primary-violet);
}

.reason-checkbox {
    position: absolute;
    opacity: 0;
}

.reason-checkmark {
    position: relative;
    width: 24px;
    height: 24px;
    border: 2px solid var(--text-secondary);
    border-radius: 8px;
    margin-right: 14px;
    flex-shrink: 0;
}

.reason-item.selected .reason-checkmark {
    background-color: var(--primary-violet);
    border-color: var(--primary-violet);
}

.reason-item.selected .reason-checkmark::after {
    content: '';
    position: absolute;
    left: 7px;
    top: 3px;
    width: 7px;
    height: 12px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
}

.reason-title {
    color: var(--text-primary);
    font-size: 18px;
    font-family: var(--font-sans);
    font-weight: 600;
}

.report-panel-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.report-panel-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 16px;
    font-family: var(--font-sans);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.report-panel-button.cancel {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    border: 2px solid var(--text-secondary);
}

.report-panel-button.cancel:hover {
    background-color: var(--text-secondary);
    color: var(--bg-primary);
}

.report-panel-button.confirm {
    background-color: var(--primary-violet);
    color: white;
}

.report-panel-button.confirm:hover:not(:disabled) {
    background-color: var(--primary-blue);
}

@media (max-width: 768px) {
    .report-panel-content {
        padding: 24px;
        min-width: 320px;
        max-width: 90vw;
        margin: 0 20px;
    }
    .report-panel-title {
        font-size: 24px;
    }
    .report-panel-subtitle {
        font-size: 16px;
    }
}

.logo {
    width: 80px; /* Уменьшено с 85px на 30% */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px; /* Уменьшено с 85px на 30% */
    background-color: #434956;
    border-radius: 100%;
    margin-left: 30px;
    margin-top: 55px;
    margin-bottom: 24px;
    margin-right: 24px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        transform: scale(1.05);
    }
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 100%;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--btn-primary);
    color: var(--text-primary);
    font-size: 22px; /* Уменьшено с 32px на 30% */
    font-weight: 700;
    font-family: var(--font-sans);
}

.question-icon {
    color: var(--text-primary);
    transition: all 0.2s ease-in-out;
}

.avatar-placeholder:hover .question-icon {
    color: #FFFFFF;
    transform: scale(1.1);
}

.nickname {
    color: var(--text-primary);
    font-size: 25px;
    font-family: var(--font-sans);
    font-weight: 700;
}

.nickname-container {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover .nickname {
        color: var(--btn-primary);
    }
}

.username-with-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
}

.username-with-badge .nickname {
    margin: 0;
    white-space: nowrap;
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
    flex-shrink: 0;
}

.publication-time {
    color: var(--text-secondary);
    font-size: 20px;
    font-family: var(--font-sans);
    font-weight: 500;
}

.article-card-content {
    display: flex;
    margin-top: 0px;
    flex-direction: column;
    margin-left: 30px;
    margin-right: 30px;
    padding-bottom: 65px;
    overflow: visible;
    position: relative;
    flex: 1;
    min-height: 0;
    /* Убираем все ограничения для текста */
    max-height: none;
    height: auto;
    
    /* Эффект размытия и тени поверх текста - отключен, чтобы текст не обрезался */
    &::after {
        display: none; /* Отключаем псевдоэлемент, чтобы текст не обрезался */
    }
    
    /* Дополнительный слой для более глубокого эффекта с нарастающим размытием - отключен */
    &::before {
        display: none; /* Отключаем псевдоэлемент, чтобы текст не обрезался */
    }
}

.article-card-content-title {
    color: var(--text-primary);
    font-size: 25px;
    margin-top: 30px;
    font-family: var(--font-sans);
    font-weight: 700;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.draft-badge {
    align-self: flex-start;
    margin-top: 30px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.4px;
    background-color: var(--badge-draft-bg);
    color: var(--badge-draft-text);
    border: 1px solid var(--badge-draft-border);
}

.edited-badge {
    align-self: flex-start;
    margin-top: 30px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.4px;
    background-color: var(--badge-edited-bg);
    color: var(--badge-edited-text);
    border: 1px solid var(--badge-edited-border);
}

.metadata-panel {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-top: 15px;
    margin-bottom: 10px;
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}

.metadata-item.difficulty {
    padding: 8px 16px;
    border-radius: 40px;
    min-width: 60px;
    height: 32px;
    transition: all 0.3s ease;
}

/* Стили для разных уровней сложности */
.metadata-item.difficulty-easy {
  background-color: var(--difficulty-easy-bg);
  
  .metadata-icon {
    filter: var(--difficulty-easy-icon);
  }
  
  .metadata-text {
    color: var(--difficulty-easy-text);
  }
}

.metadata-item.difficulty-medium {
  background-color: var(--difficulty-medium-bg);
  
  .metadata-icon {
    filter: var(--difficulty-medium-icon);
  }
  
  .metadata-text {
    color: var(--difficulty-medium-text);
  }
}

.metadata-item.difficulty-hard {
  background-color: var(--difficulty-hard-bg);
  
  .metadata-icon {
    filter: var(--difficulty-hard-icon);
  }
  
  .metadata-text {
    color: var(--difficulty-hard-text);
  }
}

.metadata-icon {
    font-size: 16px;
    color: var(--ui-gray);
}

.metadata-text {
    font-size: 16px;
    font-family: var(--font-sans);
    font-weight: 500;
    color: var(--ui-gray);
}

.tags-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-top: 10px;
}

/* PrimeVue Tag стили */
:deep(.custom-tag) {
    padding: 10px 16px !important;
    font-size: 16px !important;
    font-family: var(--font-sans) !important;
    font-weight: bold !important;
    border-radius: 12px !important;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .p-tag-value {
        font-weight: bold !important;
    }
}

.article-card-content-text {
    color: var(--text-primary);
    font-size: 20px;
    font-family: var(--article-font-family, var(--font-sans));
    font-weight: 500;
    margin-top: 30px;
    flex: 1;
    position: relative;
    display: -webkit-box;
    line-height: 1.5;
    min-height: 200px;
    max-height: 300px; /* ~10 строк по 1.5 line-height */
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal !important;
    padding-bottom: 36px; /* визуально на строку ниже футера */
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 10;
    line-clamp: 10;
    text-overflow: ellipsis;
    mask-image: linear-gradient(
        to bottom,
        black 0%,
        black 88%,
        rgba(0, 0, 0, 0.75) 94%,
        transparent 100%
    );
    -webkit-mask-image: linear-gradient(
        to bottom,
        black 0%,
        black 88%,
        rgba(0, 0, 0, 0.75) 94%,
        transparent 100%
    );
    z-index: 2;
}


.read-more-btn {
    background-color: var(--btn-primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-family: var(--font-sans);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 140px;
    position: relative;
    z-index: 10; /* Поднимаем кнопку над тенями */

    &:hover {
        background-color: var(--btn-primary-hover, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    &:active {
        transform: translateY(0);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
}

.article-card-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background-color: var(--bg-secondary);
    border-bottom-left-radius: 40px; /* Исправил для соответствия основному блоку */
    border-bottom-right-radius: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2; /* Поверх эффекта размытия */
}

.article-actions {
    display: flex;
    align-items: center;
}

.action-group {
    display: flex;
    align-items: center;
    gap: 10px; /* Увеличено с 8px (+25%) */
}

.action-btn {
    background: none;
    border: none;
    border-radius: 8px;
    padding: 12px 17px; /* Увеличено с 10px 14px (+20%) */
    display: flex;
    align-items: center;
    gap: 10px; /* Увеличено с 8px (+25%) */
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    font-size: 18px; /* Увеличено с 15px (+20%) */
    font-family: var(--font-sans);
    min-height: 48px; /* Увеличено с 40px (+20%) */

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }

    &:active {
        transform: scale(0.95);
    }

    i {
        font-size: 22px; /* Увеличено с 18px до 22px (+22%) */
        transition: all 0.2s ease;
    }

    .action-count {
        font-weight: 500;
        font-size: 18px; /* Увеличено с 15px (+20%) */
    }
}

.action-btn.like-btn {
    &:hover {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;

        .heart-icon {
            color: #ef4444;
            transform: scale(1.1);
        }
    }

    &.active {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;

        .heart-icon {
            color: #ef4444;
            animation: heartPulse 0.3s ease-out;
        }
    }
}

.heart-icon {
    transition: all 0.3s ease;

    &.filled {
        color: #ef4444;
        transform: scale(1.05);
        filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.3));
    }
}

@keyframes heartPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1.05);
    }
}

.action-btn.dislike-btn {
    &:hover {
        background-color: rgba(156, 163, 175, 0.1);
        color: #9ca3af;

        .dislike-icon {
            color: #9ca3af;
            transform: scale(1.1);
        }
    }

    &.active {
        background-color: rgba(156, 163, 175, 0.15);
        color: #9ca3af;

        .dislike-icon {
            color: #9ca3af;
            animation: dislikePulse 0.3s ease-out;
        }
    }
}

.dislike-icon {
    transition: all 0.3s ease;

    &.filled {
        color: #9ca3af;
        transform: scale(1.05);
        filter: drop-shadow(0 0 4px rgba(156, 163, 175, 0.3));
    }
}

/* Спин-анимация для реакций */
.spinner {
    width: 22px;
    height: 22px;
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

.action-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@keyframes dislikePulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1.05);
    }
}

.action-btn.comment-btn {
    &:hover {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;

        .comment-icon {
            color: #3b82f6;
            transform: scale(1.1);
        }
    }

    &.active {
        background-color: rgba(59, 130, 246, 0.15);
        color: #3b82f6;

        .comment-icon {
            color: #3b82f6;
            animation: commentPulse 0.3s ease-out;
        }
    }
}

.comment-icon {
    transition: all 0.3s ease;

    &.filled {
        color: #3b82f6;
        transform: scale(1.05);
        filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.3));
    }
    
    path {
        transition: fill 0.3s ease, stroke 0.3s ease;
    }
    
    &.filled path {
        stroke: none;
    }
}

@keyframes commentPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1.05);
    }
}

.action-btn.bookmark-btn {
    &:hover {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;

        .bookmark-icon {
            color: #f59e0b;
            transform: scale(1.1);
        }
    }

    &.active {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;

        .bookmark-icon {
            color: #f59e0b;
            animation: bookmarkPulse 0.3s ease-out;
        }
    }
    
    &.pulse {
        animation: bookmarkClickPulse 0.6s ease-out;
    }
}

@keyframes bookmarkClickPulse {
    0% {
        transform: scale(1);
    }
    30% {
        transform: scale(1.2);
        background-color: rgba(245, 158, 11, 0.25);
    }
    60% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.bookmark-icon {
    transition: all 0.3s ease;

    &.filled {
        color: #f59e0b;
        transform: scale(1.05);
        filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.3));
    }
}

@keyframes bookmarkPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1.05);
    }
}

.action-btn.share-btn {
    &:hover {
        background-color: rgba(34, 197, 94, 0.1);
        color: #22c55e;

        .share-icon {
            color: #22c55e;
            transform: scale(1.1);
        }
    }

    &.active {
        background-color: rgba(34, 197, 94, 0.15);
        color: #22c55e;

        .share-icon {
            color: #22c55e;
            animation: sharePulse 0.3s ease-out;
        }
    }
}

.share-icon {
    transition: all 0.3s ease;

    &.filled {
        color: #22c55e;
        transform: scale(1.05);
        filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.3));
    }
    
    circle {
        transition: fill 0.3s ease, stroke 0.3s ease;
    }
    
    path {
        transition: stroke-width 0.3s ease;
    }
    
    &.filled circle {
        stroke: none;
    }
}

@keyframes sharePulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1.05);
    }
}

/* Preview Block Styles */
.article-card-preview {
    background-color: var(--bg-primary);
    border-radius: 15px;
    overflow: hidden;
    margin: 16px 0 20px 0;
    min-height: 200px;
    position: relative;

    /* Мобильные устройства */
    @media (max-width: 768px) {
        height: 200px;
        min-height: 200px;
        margin: 12px 0 16px 0;
        border-radius: 12px;
    }

    /* Планшеты */
    @media (min-width: 769px) and (max-width: 1024px) {
        height: 240px;
        min-height: 240px;
        margin: 14px 0 18px 0;
        border-radius: 13px;
    }

    /* Десктоп */
    @media (min-width: 1025px) {
        height: 400px;
        min-height: 400px;
        margin: 16px 0 20px 0;
        border-radius: 15px;
    }
}

/* Image Preview Modal */
.image-fade-enter-active,
.image-fade-leave-active { transition: opacity 0.2s ease; }
.image-fade-enter-from,
.image-fade-leave-to { opacity: 0; }

.image-preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
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

.image-zoom-box.zoom-1 { transform: scale(1.1); }
.image-zoom-box.zoom-2 { transform: scale(1.4); }
.image-zoom-box.zoom-3 { transform: scale(1.8); }

.image-preview-img {
    max-width: 70vw;
    max-height: 70vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 16px;
    box-shadow: 0 25px 80px rgba(0,0,0,0.6);
    transition: transform 0.25s ease, cursor 0.2s ease;
    cursor: zoom-in;
    background: transparent;
    padding: 0;
}

.image-zoom-box.zoom-1 .image-preview-img { cursor: zoom-in; }
.image-zoom-box.zoom-2 .image-preview-img { cursor: zoom-in; }
.image-zoom-box.zoom-3 .image-preview-img { cursor: zoom-out; }

.image-preview-close {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 22px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-image {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    cursor: zoom-in;
    
    /* Размытый фон из того же изображения */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: var(--preview-bg);
        background-size: cover;
        background-position: center;
        filter: blur(20px);
        transform: scale(1.1);
        z-index: 1;
    }
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 2;
    transition: transform 0.25s ease, opacity 0.3s ease;
    background-color: transparent;
    display: block;
    opacity: 1;
}

.preview-img.image-loading {
    opacity: 0.3;
}

.preview-image:hover .preview-img {
    transform: scale(1.03);
}

.preview-indicator {
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 10px;
    color: var(--text-primary);
    background: rgba(0,0,0,0.35);
    backdrop-filter: saturate(140%) blur(4px);
    font-size: 14px;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.preview-image:hover .preview-indicator { opacity: 1; }

/* Индикатор загрузки */
.preview-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 4;
}

.preview-loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--text-primary, #ffffff);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.preview-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0.6;
}

.preview-icon {
    font-size: 24px;
    color: var(--text-secondary);

    /* Мобильные устройства */
    @media (max-width: 768px) {
        font-size: 20px;
    }

    /* Планшеты */
    @media (min-width: 769px) and (max-width: 1024px) {
        font-size: 22px;
    }

    /* Десктоп */
    @media (min-width: 1025px) {
        font-size: 24px;
    }
}

.preview-text {
    font-size: 14px;
    color: var(--text-secondary);
    font-family: var(--font-sans);

    /* Мобильные устройства */
    @media (max-width: 768px) {
        font-size: 12px;
    }

    /* Планшеты */
    @media (min-width: 769px) and (max-width: 1024px) {
        font-size: 13px;
    }

    /* Десктоп */
    @media (min-width: 1025px) {
        font-size: 14px;
    }

    /* фолбек если ошибка загрузки изображения*/
    .preview-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-secondary, rgba(255, 255, 255, 0.05));
        text-align: center;
        padding: 20px;
    }

    .preview-fallback-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10;
        text-align: center;
        padding: 20px;
    }

    .preview-fallback-text {
        font-size: 16px;
        color: var(--text-secondary);
        opacity: 0.8;
        line-height: 1.4;
        font-family: var(--font-sans);
        padding: 0 12px;
    }
}
</style>
