<template>
  <div class="create-article-container">
    <!-- Body -->
    <div class="content-wrapper">

      <!-- Warning block -->
      <div class="warning-block">
        <h2 class="warning-title">{{ $t('create-article.h1') }}</h2>
        <h2 class="warning-subtitle">{{ $t('create-article.h2') }}</h2>
        <button class="read-rules-button" type="button" @click="router.push('/legal/community-rules')">{{ $t('create-article.button1') }}</button>
      </div>

      <!-- Quick Upload Panel -->
      <section class="upload-panel">
        <div class="upload-panel-inner">
          <div class="upload-panel-text">
            <h3>{{ tt('create-article.previewPanel.title', 'Article preview') }}</h3>
            <p class="sans">{{ tt('create-article.previewPanel.subtitle', 'Upload an image or edit the current preview') }}</p>
          </div>
          <div class="action-buttons compact">
            <input ref="fileInputRef" class="hidden-file-input" type="file" accept="image/*" @change="onFileSelected" />
            <button class="create-button" type="button" @click="openFileExplorer">
              <i class="pi pi-upload button-icon"></i>
              <p class="button-text sans">{{ tt('create-article.previewPanel.upload', 'Upload') }}</p>
            </button>
            <button class="preview-button" type="button" :disabled="!localPreview" @click="openCropper">
              <i class="pi pi-pencil button-icon"></i>
              <p class="button-text sans">{{ tt('create-article.previewPanel.edit', 'Edit') }}</p>
            </button>
          </div>
        </div>
      </section>

        <!-- Upload + Preview -->
        <div v-if="localPreview" class="image-preview">
            <h3 class="preview-title">{{ tt('create-article.previewPanel.previewTitle', 'Preview:') }}</h3>
            <div 
                class="preview-image-wrapper" 
                :style="{ '--preview-bg': `url(${localPreview})` }"
                @click.prevent="openCropper()"
            >
                <img :src="localPreview" :alt="$t('create-article.previewModal.imageAlt')" class="preview-img" />
            </div>
        </div>
        <p v-if="uploadingImage" class="uploading-note">{{ tt('create-article.previewPanel.uploading', 'Uploading preview... Please wait') }}</p>


        <!-- Path block -->
      <div class="path-block">
        <h2 class="edit-title">{{ $t('create-article.h4') }}</h2>
        <h2 class="edit-subtitle">{{ $t('create-article.h5') }}</h2>
        <input type="text" placeholder="Enter title..." :class="['title-input', { invalid: fieldErrors.title }]" v-model="articleTitle">
      </div>

      <!-- Category Section -->
      <div class="category-section">
        <h2 class="category-title">{{ $t('create-article.categoryTitle') }}</h2>
        <h2 class="category-subtitle">{{ $t('create-article.categorySubtitle') }}</h2>
        
        <!-- Category Filter Panel -->
        <div class="category-filter-panel">
          <button 
            @click="selectCategory('all')"
            :class="['category-btn', { active: selectedCategory === 'all' }]"
            type="button"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            All
          </button>
          
          <button 
            @click="selectCategory('news')"
            :class="['category-btn', { active: selectedCategory === 'news' }]"
            type="button"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            News
          </button>
          
          <button 
            @click="selectCategory('development')"
            :class="['category-btn', { active: selectedCategory === 'development' }]"
            type="button"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Development
          </button>
          
          <button 
            @click="selectCategory('research')"
            :class="['category-btn', { active: selectedCategory === 'research' }]"
            type="button"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.663 17H4.337C3.6 17 3 16.4 3 15.663V8.337C3 7.6 3.6 7 4.337 7H9.663C10.4 7 11 7.6 11 8.337V15.663C11 16.4 10.4 17 9.663 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.337 17H11.663C10.926 17 10.326 16.4 10.326 15.663V8.337C10.326 7.6 10.926 7 11.663 7H16.337C17.074 7 17.674 7.6 17.674 8.337V15.663C17.674 16.4 17.074 17 16.337 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Researches
          </button>
          
          <button 
            @click="selectCategory('guides')"
            :class="['category-btn', { active: selectedCategory === 'guides' }]"
            type="button"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Guides
          </button>
        </div>
      </div>

      <!-- Edit block -->
      <div class="edit-block" :class="{ shake: isShaking }">

        <!-- Article editor block -->
        <div :class="['editor-wrapper', { invalid: fieldErrors.content }]">
          <Editor
            v-model="articleContent"
            editorStyle="height: 500px;"
          />
        </div>

        <!-- Tags Section -->
        <div class="tags-section">
          <h2 class="tags-title">{{ $t('create-article.h6') || 'Теги статьи' }}</h2>
          <h2 class="tags-subtitle">{{ $t('create-article.h7') || 'Выберите до 5 тегов для вашей статьи' }}</h2>
          
          <!-- Tag Input Block (displays selected tags) -->
          <div class="tag-input-wrapper">
            <div 
              :class="['tags-input-block', { invalid: fieldErrors.tags, disabled: selectedTags.length >= 5, 'has-tags': selectedTags.length > 0 }]"
              :key="`tags-block-${selectedTags.length}`"
            >
              <div v-if="selectedTags.length > 0" class="selected-tags-in-block">
                <div 
                  v-for="(tag, index) in selectedTags" 
                  :key="`tag-${index}-${tag}`" 
                  :class="['tag-in-block', `tag-${getTagSeverity(tag)}`]"
                >
                  <span class="tag-text">{{ tag }}</span>
                  <button 
                    @click.stop="removeTag(tag)" 
                    class="tag-remove-btn"
                    type="button"
                    :aria-label="$t('create-article.tags.removeLabel', { tag })"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>
              <span v-else class="tags-placeholder">
                {{ selectedTags.length >= 5 ? $t('create-article.tags.placeholderMax') : 'Choose your tags...' }}
              </span>
            </div>
          </div>

          <!-- Tags Display Block (copied from HomePage filters) -->
          <div class="filter-section tags-display-section">
            <h4 class="filter-title">{{ $t('articles.filters.tags') || 'Теги' }}</h4>
            
            <!-- Tag Search Input -->
            <div class="tag-search-container">
              <input
                type="text"
                class="tag-search-input"
                :placeholder="$t('articles.filters.searchTags') || 'Поиск тегов...'"
                :value="tagSearchQuery"
                @input="onTagSearchInput"
              />
              <svg class="tag-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div class="filter-tags">
              <button 
                v-for="tag in filteredTagsForDisplay" 
                :key="tag"
                @click.stop="addTag(tag)"
                type="button"
                :class="['filter-tag', { active: selectedTags.includes(tag) }]"
                :disabled="selectedTags.length >= 5 && !selectedTags.includes(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- Tags Counter -->
          <p class="tags-counter">
            {{ $t('create-article.tagsCounter', { count: selectedTags.length, max: 5 }) }}
          </p>
        </div>

        <!-- Difficulty Section -->
        <div class="difficulty-section">
          <h2 class="difficulty-title">{{ $t('create-article.h8') }}</h2>
          <h2 class="difficulty-subtitle">{{ $t('create-article.h9') }}</h2>
          
          <!-- Difficulty Circles -->
          <div class="difficulty-circles">
            <button 
              v-for="(label, level) in difficultyOptions" 
              :key="level"
              :class="['difficulty-circle', `difficulty-${level}`, { 'selected': selectedDifficulty === level }]"
              @click="selectDifficulty(level)"
              type="button"
              :title="label"
            >
              <FireIcon class="difficulty-icon" />
            </button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <button class="create-button" @click="handleCreateArticle" :disabled="loading || uploadingImage || processingImage">
            <i v-if="!loading" class="pi pi-send button-icon"></i>
            <i v-else class="pi pi-spin pi-spinner button-icon"></i>
            <p class="button-text">{{ isEditing ? $t('create-article.button5') : $t('create-article.button2') }}</p>
          </button>
          <button class="preview-button" @click="previewArticle" :disabled="loading || uploadingImage || processingImage">
            <i class="pi pi-eye button-icon"></i>
            <p class="button-text">{{ $t('create-article.button3') }}</p>
          </button>
          <button class="draft-button" @click="saveDraft" :disabled="loading || uploadingImage || processingImage">
            <i class="pi pi-save button-icon"></i>
            <p class="button-text">{{ $t('create-article.button4') }}</p>
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="api-error">
          <p class="api-error-message">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <Transition name="modal-fade">
      <div v-if="isPreviewModalOpen" class="preview-modal-overlay">
        <div class="preview-modal" @click.stop>
          <div class="preview-modal-header">
            <h2 class="preview-modal-title">{{ $t('create-article.previewModal.title') }}</h2>
            <button class="preview-modal-close" @click="closePreviewModal" type="button" :aria-label="$t('create-article.previewModal.close')">
              <i class="pi pi-times"></i>
            </button>
          </div>
          
          <div class="preview-modal-content">
            <FullArticleCard 
              :article="previewArticleData"
            />
          </div>
        </div>
      </div>
    </Transition>
    <!-- Validation Toast (bottom) -->
    <Transition name="toast-slide">
      <div v-if="showValidationModal" class="validation-toast" role="alert" aria-live="polite">
        <div class="validation-toast-header">
          <span class="validation-toast-title">{{ $t('create-article.validation.title') }}</span>
          <button class="validation-toast-close" @click="showValidationModal = false" type="button" :aria-label="$t('create-article.validation.close')">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="validation-toast-content">
          <p class="validation-intro">{{ $t('create-article.validation.intro') }}</p>
          <ul class="validation-list">
            <li v-for="(msg, idx) in validationErrors" :key="idx">{{ msg }}</li>
          </ul>
        </div>
      </div>
    </Transition>
    <div v-if="isCropperOpen" class="preview-modal-overlay cropper-overlay">
      <div class="preview-modal cropper-modal" @click.stop style="width:min(96vw, 1280px); max-height:90vh;">
        <div class="preview-modal-header">
          <h2 class="preview-modal-title">{{ $t('create-article.cropperModal.title') }}</h2>
          <button class="preview-modal-close" @click="isCropperOpen = false" type="button" :aria-label="$t('create-article.cropperModal.close')">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="preview-modal-content">
          <AvatarCropper
            v-if="sourceImageUrl"
            :imageUrl="sourceImageUrl!"
            shape="square"
            :outputSize="1024"
            outputType="image/webp"
            :maxBytes="500000"
            :maintainAspect="false"
            @crop="onAvatarCrop"
            ref="articleCropperRef"
          />
        </div>
        <div class="cropper-footer-actions">
          <button class="btn ghost" type="button" @click="articleCropperRef?.selectFull?.()">
            <i class="pi pi-expand"></i>
            <span>{{ $t('create-article.cropperModal.selectAll') }}</span>
          </button>
          <div class="grow"></div>
          <button class="btn subtle" @click="isCropperOpen = false" type="button">
            <i class="pi pi-times"></i>
            <span>{{ $t('create-article.cropperModal.cancel') }}</span>
          </button>
          <button class="btn primary" @click="confirmAvatarCrop" type="button">
            <i class="pi pi-check"></i>
            <span>{{ $t('create-article.cropperModal.apply') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Editor from 'primevue/editor'
import Tag from 'primevue/tag'
import FireIcon from '@/assets/svgs/fire_ico.svg'
import { useToast } from 'primevue/usetoast'
import FullArticleCard from '@/components/FullArticleCard.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'
import type { Article } from '@/types/article'

const { t } = useI18n()
const tt = (key: string, fallback: string) => {
  const v = t(key) as unknown as string
  return v === key ? fallback : v
}
const toast = useToast()

import { useArticles } from '@/composables/useArticles'
import { useTags } from '@/composables/useTags'
import { useAuthStore } from '@/stores/auth'
import type { CreateArticleRequest } from '@/types/article'
import { uploadPreviewImage } from '@/api/articles'

// Article data
const articleTitle = ref('')
const articleContent = ref('')
const router = useRouter()
const selectedFile = ref<File | null>(null)
const localPreview = ref<string | null>(null) //URL.createObjectURL
const uploadingImage = ref(false) //это для индикации загрузки изображения на imgBB. Надо потом накидать стилей под это
const isPreviewModalOpen = ref(false)
const processingImage = ref(false) // Для анимации при выборе файла
// Cropper state
const isCropperOpen = ref(false)
const sourceImageUrl = ref<string | null>(null)
const croppedBlob = ref<Blob | null>(null)
const croppedFileName = ref<string>('preview.webp')
const articleCropperRef = ref<any>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Validation state
const validationErrors = ref<string[]>([])
const showValidationModal = ref(false)
const isShaking = ref(false)
const fieldErrors = ref<{ title: boolean; content: boolean; tags: boolean }>({ title: false, content: false, tags: false })

// Tags grouped by colors for scalability
// ============================================
// КАК ДОБАВИТЬ НОВЫЙ ТЕГ:
// 1. Добавьте новый тег в нужную цветовую группу ниже
// 2. Тег автоматически появится в автодополнении
// 3. Тег будет иметь цвет своей группы
// 
// ГРУППЫ ЦВЕТОВ:
// - success (зеленый): Frontend технологии, обучение
// - info (синий): Backend технологии, базы данных
// - warning (желтый): Дизайн, игры, креатив
// - danger (красный): Безопасность, тестирование, DevOps
// - secondary (серый): Инструменты, платформы, прочее
// ============================================
const { allTags, getTagSeverity, filterTags } = useTags()

const selectedTags = ref<string[]>([])
const tagSearchQuery = ref('')

// Difficulty selection
const selectedDifficulty = ref<string>('medium') // Default to medium
const difficultyOptions = computed(() => ({
  easy: t('create-article.difficulty.easy'),
  medium: t('create-article.difficulty.medium'),
  hard: t('create-article.difficulty.hard')
} as Record<string, string>))

// Category selection
const selectedCategory = ref<string>('all') // Default to all

// Filtered tags for the display block (all tags except selected)
const filteredTagsForDisplay = computed(() => {
  const result = filterTags(tagSearchQuery.value, selectedTags.value)
  console.log('filteredTagsForDisplay computed:', {
    tagSearchQuery: tagSearchQuery.value,
    selectedTags: selectedTags.value,
    result: result,
    resultLength: result.length
  })
  return result
})

const onTagSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  tagSearchQuery.value = target.value
}

// API integration
const { createArticle, updateArticle, loading, error } = useArticles()
const auth = useAuthStore()
const isEditing = ref(false)
const editingArticleId = ref<number | null>(null)

// Computed для создания объекта Article для предпросмотра
const previewArticleData = computed<Article>(() => {
  const authorUsername = auth.user?.username || 'Anonymous'
  const previewUrl = localPreview.value || null
  
  // Логируем для отладки
  if (previewUrl) {
    console.log('Preview URL в computed:', previewUrl, typeof previewUrl)
  }
  
  return {
    id: editingArticleId.value || 0,
    title: articleTitle.value.trim() || 'Заголовок статьи',
    content: articleContent.value || `<p>${t('create-article.content.placeholder')}</p>`,
    excerpt: generateExcerpt(articleContent.value),
    tags: selectedTags.value || [],
    difficulty: selectedDifficulty.value || 'medium',
    status: 'published',
    previewImage: previewUrl,
    preview_image: previewUrl,
    author: {
      id: auth.user?.id || 0,
      username: authorUsername,
      avatar: auth.user?.avatar
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    views: 0,
    commentsCount: 0
  }
})

// Reactive variables for checkboxes
// const publicationTimeEnabled = ref(false)
const rank1Enabled = ref(false)
const rank2Enabled = ref(false)
const disableCommenting = ref(false)
const doNotNotify = ref(false)
const hideContacts = ref(false)
const hideCommentatorsInfo = ref(false)
const disableReplying = ref(false)

//debug
console.log('VITE_IMGBB_API_KEY =', import.meta.env.VITE_IMGBB_API_KEY)

// Tags functions
const tagColors = ['success', 'info', 'warning', 'danger', 'secondary'] as const


const addTag = (tag: string) => {
  console.log('addTag called with:', tag)
  console.log('Current selectedTags:', selectedTags.value)
  console.log('selectedTags.value.length:', selectedTags.value.length)
  
  if (selectedTags.value.length >= 5) {
    console.log('Limit reached, showing toast')
    toast.add({ severity: 'warn', summary: t('create-article.tags.limitTitle'), detail: t('create-article.tags.limitToast'), life: 3000 })
    return
  }
  
  if (!selectedTags.value.includes(tag)) {
    console.log('Adding tag:', tag)
    selectedTags.value.push(tag)
    console.log('Tag added. New selectedTags:', selectedTags.value)
    console.log('selectedTags.value after push:', [...selectedTags.value])
  } else {
    console.log('Tag already exists:', tag)
  }
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

// Difficulty selection function
const selectDifficulty = (level: string) => {
  selectedDifficulty.value = level
}

// Category selection function
const selectCategory = (category: string) => {
  selectedCategory.value = category
  console.log('Selected category:', category)
}

// Functions
const exportToJSON = () => {
  // Parse HTML content to extract formatted text
  const parser = new DOMParser()
  const doc = parser.parseFromString(articleContent.value, 'text/html')

  const extractFormattedContent = (element: Element): any[] => {
    const result: any[] = []

    element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          result.push({
            type: 'text',
            content: node.textContent
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        const tagName = el.tagName.toLowerCase()
        const textContent = el.textContent || ''

        switch (tagName) {
          case 'strong':
          case 'b':
            result.push({ type: 'bold', content: textContent })
            break
          case 'em':
          case 'i':
            result.push({ type: 'italic', content: textContent })
            break
          case 'u':
            result.push({ type: 'underline', content: textContent })
            break
          case 'code':
            result.push({ type: 'code', content: textContent })
            break
          case 'a':
            result.push({
              type: 'link',
              content: textContent,
              href: el.getAttribute('href') || ''
            })
            break
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            result.push({
              type: 'heading',
              content: textContent,
              level: parseInt(tagName.charAt(1))
            })
            break
          case 'blockquote':
            result.push({ type: 'quote', content: textContent })
            break
          case 'ul':
          case 'ol':
            result.push({
              type: 'list',
              ordered: tagName === 'ol',
              items: Array.from(el.querySelectorAll('li')).map(li => li.textContent || '')
            })
            break
          default:
            result.push(...extractFormattedContent(el))
            break
        }
      }
    })

    return result
  }

  const formattedContent = extractFormattedContent(doc.body)

  const articleData = {
    title: articleTitle.value,
    content: {
      html: articleContent.value,
      formatted: formattedContent
    },
      tags: selectedTags.value, // используем selectedTags
      difficulty: selectedDifficulty.value,
      settings: {
        // publicationTime: publicationTimeEnabled.value,
        ranks: {
        rank1: rank1Enabled.value,
        rank2: rank2Enabled.value
      },
      disableCommenting: disableCommenting.value,
      doNotNotify: doNotNotify.value,
      hideContacts: hideContacts.value,
      hideCommentatorsInfo: hideCommentatorsInfo.value,
      disableReplying: disableReplying.value
    },
    createdAt: new Date().toISOString()
  }

  return articleData
}

const handleCreateArticle = async () => {
    // Build validation
    validationErrors.value = []
    fieldErrors.value = { title: false, content: false, tags: false }
    if (!articleTitle.value.trim()) {
        fieldErrors.value.title = true
        validationErrors.value.push('Введите заголовок статьи')
    }
    if (!articleContent.value.trim()) {
        fieldErrors.value.content = true
        validationErrors.value.push('Добавьте содержание статьи')
    }
    if (selectedTags.value.length === 0) {
        fieldErrors.value.tags = true
        validationErrors.value.push('Выберите хотя бы один тег')
    }
    if (validationErrors.value.length > 0) {
        isShaking.value = true
        showValidationModal.value = true
        setTimeout(() => { isShaking.value = false }, 600)
        toast.add({ severity: 'warn', summary: 'Заполните поля', detail: 'Исправьте отмеченные поля', life: 3000 })
        return
    }

    try {
        // ВАЖНО: previewUrl теперь NUMBER (ID файла), а не string (URL)
        let previewUrl: number | undefined = undefined
        if (croppedBlob.value || selectedFile.value) {
            uploadingImage.value = true
            try {
                // Загружаем через backend (безопасно)
                const fileToSend = croppedBlob.value
                  ? new File([croppedBlob.value], croppedFileName.value, { type: 'image/webp' })
                  : (selectedFile.value as File)
                previewUrl = await uploadPreviewImage(fileToSend)
            } catch (err) {
                console.error(err)
                toast.add({ severity: 'warn', summary: 'Превью не загружено', detail: 'Продолжаем без превью', life: 4000 })
            } finally {
                uploadingImage.value = false
            }
        }

        const articleData: CreateArticleRequest = {
            title: articleTitle.value.trim(),
            content: articleContent.value,
            excerpt: generateExcerpt(articleContent.value),
            tags: selectedTags.value,
            status: 'published',
            preview_image: previewUrl,
            difficulty: selectedDifficulty.value
            // SECURITY: author НЕ отправляется - бэкенд автоматически устанавливает его из токена
        }

        const result = isEditing.value && editingArticleId.value
            ? await updateArticle(editingArticleId.value, articleData)
            : await createArticle(articleData)

        console.log('ArticleData перед API:', articleData)
        console.log('Созданная статья:', result)
        console.log('✅ Article created successfully:', result)
        
        toast.add({
          severity: 'success',
          summary: 'Статья опубликована',
          detail: 'Ваша статья успешно опубликована и доступна на главной странице',
          life: 4000
        })
        
        // Небольшая задержка для индексации в Strapi перед обновлением списка
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Отправляем событие для обновления статей на главной странице
        window.dispatchEvent(new CustomEvent('articles:refresh'))
        
        // Переходим на главную с принудительным обновлением
        await router.push({ path: '/', query: { refresh: Date.now() } })
    } catch (err) {
        console.error(err)
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось создать статью. Попробуйте ещё раз',
          life: 5000
        })
    }

}

// Генерация краткого описания из контента
const generateExcerpt = (content: string): string => {
  // Удаляем HTML теги
  const textContent = content.replace(/<[^>]*>/g, '')
  // Берем первые 200 символов
  return textContent.length > 200
    ? textContent.substring(0, 200) + '...'
    : textContent
}

const previewArticle = () => {
  // Проверяем, что не идет загрузка
  if (loading.value || uploadingImage.value || processingImage.value) {
    return
  }
  
  // Открываем модальное окно с полноценным предпросмотром
  isPreviewModalOpen.value = true
  
  // Предотвращаем скролл фона
  document.body.style.overflow = 'hidden'
}

const closePreviewModal = () => {
  isPreviewModalOpen.value = false
  // Восстанавливаем скролл фона
  document.body.style.overflow = ''
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isPreviewModalOpen.value) {
    closePreviewModal()
  }
}

const saveDraft = async () => {
  if (!articleTitle.value.trim()) {
    fieldErrors.value.title = true
    isShaking.value = true
    setTimeout(() => { isShaking.value = false }, 600)
    toast.add({ severity: 'warn', summary: 'Нет заголовка', detail: 'Введите заголовок для сохранения черновика', life: 3000 })
    return
  }

  try {
    // ВАЖНО: previewUrl теперь NUMBER (ID файла), а не string (URL)
    let previewUrl: number | undefined = undefined
    if (croppedBlob.value || selectedFile.value) {
      uploadingImage.value = true
      try {
        // Загружаем через backend (безопасно)
        const fileToSend = croppedBlob.value
          ? new File([croppedBlob.value], croppedFileName.value, { type: 'image/webp' })
          : (selectedFile.value as File)
        previewUrl = await uploadPreviewImage(fileToSend)
      } catch (err) {
        console.error(err)
        // Продолжаем без превью для черновика
      } finally {
        uploadingImage.value = false
      }
    }

    const articleData: CreateArticleRequest = {
      title: articleTitle.value.trim(),
      content: articleContent.value,
      excerpt: generateExcerpt(articleContent.value),
      tags: selectedTags.value,
      status: 'draft',
      preview_image: previewUrl,
      difficulty: selectedDifficulty.value
      // SECURITY: author НЕ отправляется - бэкенд автоматически устанавливает его из токена
    }

    const result = isEditing.value && editingArticleId.value
      ? await updateArticle(editingArticleId.value, articleData)
      : await createArticle(articleData)

    console.log('Черновик сохранен:', result)
    toast.add({
      severity: 'success',
      summary: 'Черновик сохранен',
      detail: 'Статья сохранена как черновик. Вы можете продолжить работу над ней позже',
      life: 4000
    })
    
    // Небольшая задержка для сохранения в БД
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Переходим на страницу черновиков
    await router.push('/draft-articles')
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось сохранить черновик. Попробуйте ещё раз',
      life: 5000
    })
  }
}

onMounted(() => {
  console.log('🔵 CreateArticle mounted')
  console.log('selectedTags on mount:', selectedTags.value)
  console.log('filteredTagsForDisplay on mount:', filteredTagsForDisplay.value)
  console.log('allTags on mount:', allTags.value)
  
  // SECURITY: Проверяем авторизацию
  auth.loadFromStorage()
  if (!auth.isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /auth')
    router.replace({ path: '/auth', query: { redirect: '/create-article' } })
    return
  }
  
  console.log('✅ User authenticated:', { id: auth.user?.id, username: auth.user?.username })
  
  // Add escape key handler
  document.addEventListener('keydown', handleEscapeKey)
  
  // Load draft if exists
  const draft = localStorage.getItem('article_draft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      articleTitle.value = draftData.title || ''
      selectedTags.value = [] // не загружаем теги из черновика, чтобы они не устанавливались по умолчанию
      selectedDifficulty.value = draftData.difficulty || 'medium' // загружаем сложность
      articleContent.value = draftData.content?.html || ''

        if (draftData.settings) {
          // publicationTimeEnabled.value = draftData.settings.publicationTime || false
          rank1Enabled.value = draftData.settings.ranks?.rank1 || false
        rank2Enabled.value = draftData.settings.ranks?.rank2 || false
        disableCommenting.value = draftData.settings.disableCommenting || false
        doNotNotify.value = draftData.settings.doNotNotify || false
        hideContacts.value = draftData.settings.hideContacts || false
        hideCommentatorsInfo.value = draftData.settings.hideCommentatorsInfo || false
        disableReplying.value = draftData.settings.disableReplying || false
      }
    } catch (error) {
      console.warn('Не удалось загрузить черновик:', error)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  // Cleanup preview URL if exists
  if (localPreview.value) {
    URL.revokeObjectURL(localPreview.value)
  }
  // Восстанавливаем скролл если модальное окно было открыто
  document.body.style.overflow = ''
})

async function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        
        // Проверка размера файла (до 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.add({
                severity: 'warn',
                summary: 'Файл слишком большой',
                detail: 'Максимальный размер файла: 10MB',
                life: 4000
            })
            input.value = ''
            return
        }
        
        // Показываем анимацию обработки
        processingImage.value = true
        
        try {
            // Небольшая задержка для плавного UX
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Если была другая локал ссылка то удаляем ее
            if (localPreview.value) {
                URL.revokeObjectURL(localPreview.value)
                localPreview.value = null
            }
            
            selectedFile.value = file
            if (sourceImageUrl.value) {
              URL.revokeObjectURL(sourceImageUrl.value)
            }
            const reader = new FileReader()
            reader.onload = (e) => {
              sourceImageUrl.value = e.target?.result as string
              isCropperOpen.value = true
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Ошибка при обработке файла:', error)
            toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Не удалось обработать изображение',
                life: 4000
            })
            input.value = ''
        } finally {
            // Завершаем обработку
            processingImage.value = false
        }
    } else {
        if (localPreview.value) {
            URL.revokeObjectURL(localPreview.value)
            localPreview.value = null
        }
        selectedFile.value = null
        processingImage.value = false
    }
}

function openCropper() {
  if (sourceImageUrl.value) {
    isCropperOpen.value = true
  }
}

function openFileExplorer() {
  fileInputRef.value?.click()
}

let tempCroppedFile: File | null = null
function onAvatarCrop(file: File) {
  tempCroppedFile = file
}
async function confirmAvatarCrop() {
  if (!articleCropperRef.value) return
  try {
    // Если пользователь не нажал в самом кроппере, запросим файл программно
    if (!tempCroppedFile && articleCropperRef.value.getCroppedImage) {
      tempCroppedFile = await articleCropperRef.value.getCroppedImage()
    }
    if (tempCroppedFile) {
      croppedBlob.value = tempCroppedFile
      if (localPreview.value) URL.revokeObjectURL(localPreview.value)
      localPreview.value = URL.createObjectURL(tempCroppedFile)
      isCropperOpen.value = false
    }
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обрезать изображение', life: 4000 })
  } finally {
    tempCroppedFile = null
  }
}

function resizeToSquareWebP(srcBlob: Blob, size: number, initialQuality: number, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      const srcW = img.naturalWidth
      const srcH = img.naturalHeight
      const side = Math.min(srcW, srcH)
      const sx = (srcW - side) / 2
      const sy = (srcH - side) / 2
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      let quality = initialQuality
      let out: Blob | null = await new Promise(r => canvas.toBlob(r as any, 'image/webp', quality))
      let steps = 8
      while (out && out.size > maxBytes && steps-- > 0) {
        quality = Math.max(0.5, quality - 0.1)
        out = await new Promise(r => canvas.toBlob(r as any, 'image/webp', quality))
      }
      if (out) resolve(out)
      else reject(new Error('Не удалось сжать изображение'))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(srcBlob)
  })
}

// Функция uploadToImgBB удалена - теперь используем безопасный backend endpoint

</script>

<style scoped>
.cropper-footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--line-color, rgba(255,255,255,0.06));
  background: var(--bg-secondary, #111215);
}
.grow { flex: 1 1 auto; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 18px;
  transition: all 0.2s ease-in-out;
}

.btn i { 
  font-size: 18px; 
}

.btn.primary { 
  background-color: var(--btn-primary); 
  color: var(--text-primary); 
  font-weight: 700;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
}

.btn.subtle { 
  background-color: var(--btn-primary); 
  border: 2px solid #ef4444;
  color: #ef4444; 
  font-weight: 700;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }
  
  &:active {
    transform: translateY(1px);
  }
}

.btn.ghost { 
  background-color: transparent; 
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary); 
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--text-primary);
  }
  
  &:active {
    transform: translateY(1px);
  }
}

.upload-panel {
  width: 1500px;
  display: flex;
  justify-content: center;
}
.upload-panel-inner {
  width: 1400px;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.upload-panel-text { margin-left: 32px; }
.upload-panel-text h3 { color: var(--text-primary); font-family: var(--font-sans); margin: 0 0 2px; font-size: 24px; font-weight: bold; }
.upload-panel-text p { color: var(--text-secondary); margin: 0; font-size: 18px; opacity: .9; font-family: var(--font-sans); font-weight: bold; }
.upload-panel-actions { display: flex; align-items: center; gap: 10px; margin-left: 24px; }
.hidden-file-input { display: none; }
.button-text.sans { font-family: var(--font-sans); }

/* Компактный мод для стандартных action-кнопок */
.action-buttons.compact { 
  gap: 10px !important; 
  margin-top: 0 !important; 
  align-items: center; 
  margin-left: auto; 
  margin-right: 0 !important;
  margin-bottom: 0 !important;
}
.action-buttons.compact .create-button,
.action-buttons.compact .preview-button,
.action-buttons.compact .draft-button {
  height: 60px !important;
  padding: 0 14px !important;
  border-radius: 18px !important;
  min-width: auto !important;
  align-items: center !important;
  margin: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.action-buttons.compact .button-icon { font-size: 22px !important; }
.action-buttons.compact .button-text { font-size: 22px !important; line-height: 1; }
</style>

<style lang="scss" scoped>
.create-article-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding: 140px 16px 100px;
  box-sizing: border-box;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: 90px 12px 100px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 120px 20px 100px;
    max-width: 1000px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    padding: 140px 24px 100px;
    max-width: 1400px;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

// Path block
.path-block {
  background-color: var(--bg-secondary);
  width: 1400px;
  height: 190px;
  border-radius: 25px;
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.path-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 35px;
  margin-left: 48px;
  align-items: center;
}

.path-link {
  color: var(--primary-violet);
  text-decoration: none;
}

// Warning block
.warning-block {
  background-color: var(--bg-secondary);
  width: 1400px;
  height: 209px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
}

.warning-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 24px;
  margin-left: 48px;
}

.warning-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 4px;
  margin-left: 48px;
  width: 440px;
}

.read-rules-button {
  width: 269px;
  height: 56px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 22px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 48px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0s ease-in-out;

}

// Edit block
.edit-block {
  background-color: var(--bg-secondary);
  width: 1400px;
  min-height: auto;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
}

.edit-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 24px;
  margin-left: 48px;
}

.edit-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 48px;
  width: 400px;
}

.title-input {
  width: 1300px;
  height: 68px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  margin-top: 8px;
  margin-left: 48px;
  font-weight: bold;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 22px;
  color: var(--text-primary);
  transition: all 0s ease-in-out;

  &::placeholder {
    color: var(--text-third);
  }

  &:focus {
    outline: none;
    border: 2px solid white;
    border-radius: 20px;
  }
}

// Validation helpers
.title-input.invalid {
  border: 3px solid #ef4444 !important;
}


.editor-wrapper.invalid {
  :deep(.ql-container.ql-snow) {
    border: 3px solid #ef4444 !important;
  }
}

:deep(.ql-toolbar) {
  background: var(--bg-primary) !important;
  border-radius: 25px !important;
  padding: 24px 20px;
  width: 1300px;
  margin-left: 48px;
  margin-top: 56px;
  min-height: 80px;
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
}

  :deep(.ql-toolbar button) {
    width: 50px !important;
    height: 46px !important;
    padding: 10px !important;
    margin: 4px !important;
    border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: var(--primary-violet) !important;
  }

  &.ql-active {
    background: var(--btn-primary) !important;
    border-color: var(--text-primary) !important;
    color: var(--text-primary) !important;
  }
}

:deep(.ql-toolbar button svg) {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  color: var(--text-primary);
  object-fit: contain;
}

:deep(.ql-toolbar button.ql-active svg) {
  color: var(--text-primary) !important;
}

:deep(.ql-toolbar button.ql-active .ql-fill) {
  fill: var(--text-primary) !important;
}

:deep(.ql-toolbar button.ql-active .ql-stroke) {
  stroke: var(--text-primary) !important;
}

:deep(.ql-toolbar .ql-formats) {
  display: flex !important;
  align-items: center !important;
  margin-right: 15px !important;
}

:deep(.ql-toolbar .ql-picker) {
  height: 46px !important;
  font-size: 18px !important;
  margin: 4px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.ql-toolbar .ql-picker-label) {
  height: 46px !important;
  line-height: 44px !important;
  padding: 0 16px !important;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--text-primary);
  display: flex !important;
  align-items: center !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: var(--primary-violet) !important;
  }
}


:deep(.ql-toolbar .ql-color-picker) {
  width: 50px !important;
  height: 46px !important;
  margin: 4px !important;
}

:deep(.ql-toolbar .ql-color-picker .ql-picker-label) {
  width: 50px !important;
  height: 46px !important;
  padding: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.ql-toolbar .ql-color-picker .ql-picker-label svg) {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
}

:deep(.ql-toolbar .ql-icon-picker) {
  width: 50px !important;
  height: 46px !important;
  margin: 4px !important;
}

:deep(.ql-toolbar .ql-icon-picker .ql-picker-label) {
  width: 50px !important;
  height: 46px !important;
  padding: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.ql-toolbar .ql-icon-picker .ql-picker-label svg) {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
}

:deep(.ql-toolbar .ql-header.ql-picker .ql-picker-label svg) {
  width: 20px !important;
  height: 20px !important;
  position: absolute !important;
  right: 15px !important;
  top: 70% !important;
  transform: translateY(-50%) !important;
  color: var(--text-primary) !important;
}

// Элементы в выпадающих меню
:deep(.ql-toolbar .ql-picker-options .ql-picker-item) {
  padding: 12px 16px !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  font-size: 15px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

:deep(.ql-toolbar .ql-color-picker .ql-picker-item) {
  width: 20px !important;
  height: 20px !important;
  margin: 4px !important;
}

:deep(.ql-toolbar .ql-icon-picker .ql-picker-item) {
  width: 32px !important;
  height: 32px !important;
  padding: 4px !important;
}




:deep(.ql-toolbar .ql-header.ql-picker) {
  width: 160px !important;
}

:deep(.ql-toolbar .ql-font.ql-picker) {
  width: 160px !important;
}

:deep(.ql-toolbar .ql-header.ql-picker .ql-picker-label) {
  width: 160px !important;
  padding: 0 45px 0 20px !important;
  font-size: 16px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  position: relative !important;
  justify-content: flex-start !important;
}

:deep(.ql-toolbar .ql-font.ql-picker .ql-picker-label) {
  width: 160px !important;
  padding: 0 20px !important;
  font-size: 16px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

// Выпадающие меню
:deep(.ql-toolbar .ql-header.ql-picker .ql-picker-options) {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 200px !important;
}

:deep(.ql-toolbar .ql-font.ql-picker .ql-picker-options) {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 200px !important;
}


:deep(.ql-snow .ql-picker.ql-expanded .ql-picker-options) {
  left: 0px !important;
  top: 70px !important;
}

:deep(.ql-container) {
  background: var(--bg-primary) !important;  // Меняем на bg-primary (было btn-primary)
  background-color: var(--bg-primary) !important;  // Дублируем для надежности
  border: none;
  border-radius: 0 0 50px 50px;
  width: 1300px;
  margin-left: 48px;
}

:deep(.ql-editor) {
  min-height: 500px;
  padding: 24px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
}

:deep(.ql-container.ql-snow) {
  margin-top: 20px;
  border-radius: 25px !important;
  background: var(--bg-primary) !important;
}

:deep(.p-editor-content.ql-container.ql-snow) {
  border-radius: 25px !important;
  overflow: hidden !important;
  border-color: none !important;
  background-color: var(--bg-primary) !important;
}

:deep(.ql-container.ql-snow) {
  background-color: var(--bg-primary) !important;
}

:deep(.p-editor .ql-container) {
  background-color: var(--bg-primary) !important;
}

:deep(.p-editor-content) {
  background-color: var(--bg-primary) !important;
}

// Tags Section
.tags-section {
  width: 100%;
  margin-top: 48px;
  padding: 0 48px;
}

// Difficulty Section
.difficulty-section {
  width: 100%;
  margin-top: 48px;
  padding: 0 48px;
}

.difficulty-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.difficulty-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  width: 460px;
  margin-top: 8px;
  margin-bottom: 24px;
}

.difficulty-circles {
  display: flex;
  gap: 16px;
  align-items: center;
}

.difficulty-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-violet);
  }
  
  // Color variants for different difficulties
  &.difficulty-easy {
    &:hover {
      border-color: var(--difficulty-easy-hover-border);
      background-color: var(--difficulty-easy-hover-bg);
      color: var(--difficulty-easy-color);
    }
    
    &.selected {
      border-color: var(--difficulty-easy-selected-border);
      background-color: var(--difficulty-easy-selected-bg);
      color: var(--difficulty-easy-color);
    }
  }
  
  &.difficulty-medium {
    &:hover {
      border-color: var(--difficulty-medium-hover-border);
      background-color: var(--difficulty-medium-hover-bg);
      color: var(--difficulty-medium-color);
    }
    
    &.selected {
      border-color: var(--difficulty-medium-selected-border);
      background-color: var(--difficulty-medium-selected-bg);
      color: var(--difficulty-medium-color);
    }
  }
  
  &.difficulty-hard {
    &:hover {
      border-color: var(--difficulty-hard-hover-border);
      background-color: var(--difficulty-hard-hover-bg);
      color: var(--difficulty-hard-color);
    }
    
    &.selected {
      border-color: var(--difficulty-hard-selected-border);
      background-color: var(--difficulty-hard-selected-bg);
      color: var(--difficulty-hard-color);
    }
  }
}

.difficulty-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
  fill: currentColor;
  
  .difficulty-circle:hover & {
    transform: scale(1.1);
  }
  
  .difficulty-circle.selected & {
    transform: scale(1.1);
  }
}

/* Цвета для иконок в зависимости от сложности */
.difficulty-circle.difficulty-easy .difficulty-icon {
  fill: var(--difficulty-easy-color) !important;
}

.difficulty-circle.difficulty-medium .difficulty-icon {
  fill: var(--difficulty-medium-color) !important;
}

.difficulty-circle.difficulty-hard .difficulty-icon {
  fill: var(--difficulty-hard-color) !important;
}

/* Hover эффекты для иконок */
.difficulty-circle:hover .difficulty-icon {
  transform: scale(1.1);
}

/* ЗАПОЛНЕНИЕ иконки цветом при выборе */
.difficulty-circle.selected.difficulty-easy .difficulty-icon {
  fill: var(--difficulty-easy-selected-fill) !important;
}

.difficulty-circle.selected.difficulty-medium .difficulty-icon {
  fill: var(--difficulty-medium-selected-fill) !important;
}

.difficulty-circle.selected.difficulty-hard .difficulty-icon {
  fill: var(--difficulty-hard-selected-fill) !important;
}

/* Category Section */
.category-section {
  width: 1400px;
  margin-top: 12px;
  margin-bottom: 16px;
  background-color: var(--bg-secondary);
  border-radius: 25px;
  padding: 32px 48px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.category-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.category-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin-top: 6px;
  margin-bottom: 20px;
}

.category-filter-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: var(--bg-primary);
  border-radius: 32px;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: var(--bg-primary);
  border: 2px solid transparent;
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.category-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transition: left 0.5s ease;
}

.category-btn:hover::before {
  left: 100%;
}

.category-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.category-btn.active {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
  color: var(--text-primary);
}

.category-btn.active::before {
  display: none;
}

.category-btn.active:hover {
  background-color: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

.category-icon {
  flex-shrink: 0;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.category-btn:hover .category-icon {
  opacity: 1;
  transform: scale(1.1);
}

.category-btn.active .category-icon {
  opacity: 1;
  color: white;
}

.tags-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.tags-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  width: 460px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

// Wrapper для тега с кнопкой удаления
.custom-tag-wrapper {
  display: inline-flex;
  align-items: center;
  padding: 13px 20px;
  font-size: 20.8px;
  font-family: var(--font-sans);
  font-weight: bold;
  border-radius: 15.6px;
  transition: all 0.3s ease;
  gap: 12px;
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  // Цвета для разных типов тегов
  &.tag-success {
    background-color: var(--tag-success-bg);
  }
  
  &.tag-info {
    background-color: var(--tag-info-bg);
  }
  
  &.tag-warning {
    background-color: var(--tag-warning-bg);
  }
  
  &.tag-danger {
    background-color: var(--tag-danger-bg);
  }
  
  &.tag-secondary {
    background-color: var(--tag-secondary-bg);
  }
}

.tag-text {
  font-weight: bold;
  color: var(--tag-text);
}

// Кнопка удаления тега (крестик внутри тега)
.tag-remove-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.2);
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  i {
    font-size: 11px;
    font-weight: bold;
  }
}

.tag-input-wrapper {
  position: relative;
  width: 100%;
}

.tags-input-block {
  width: 100%;
  min-height: 68px;
  background-color: var(--btn-primary);
  border: 2px solid transparent;
  border-radius: 20px;
  font-weight: bold;
  padding: 12px 16px;
  font-size: 22px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  user-select: none;

  &.has-tags {
    padding: 8px 12px;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.invalid {
    border: 3px solid #ef4444 !important;
  }
}

.selected-tags-in-block {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.tag-in-block {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.3s ease;
  gap: 8px;
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  // Цвета для разных типов тегов
  &.tag-success {
    background-color: var(--tag-success-bg);
  }
  
  &.tag-info {
    background-color: var(--tag-info-bg);
  }
  
  &.tag-warning {
    background-color: var(--tag-warning-bg);
  }
  
  &.tag-danger {
    background-color: var(--tag-danger-bg);
  }
  
  &.tag-secondary {
    background-color: var(--tag-secondary-bg);
  }
}

.tag-in-block .tag-text {
  font-weight: bold;
  color: var(--tag-text);
}

.tag-in-block .tag-remove-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.2);
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  i {
    font-size: 10px;
    font-weight: bold;
  }
}

.tags-placeholder {
  color: var(--text-third);
  pointer-events: none;
  font-family: var(--font-sans);
  font-weight: bold;
}

.tags-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: var(--btn-primary);
  border-radius: 20px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-violet);
    border-radius: 4px;
  }
}

.suggestion-item {
  padding: 14px 20px;
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:first-child {
    border-radius: 20px 20px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 20px 20px;
  }
  
  &:only-child {
    border-radius: 20px;
  }
  
  &:hover {
    background: rgba(139, 92, 246, 0.3);
  }
}

.tags-counter {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  margin-top: 12px;
  font-weight: bold;
  margin-bottom: 0;
}

// Tags Display Block Styles (copied from HomePage)
.tags-display-section {
  margin-top: 24px;
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-primary);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-title {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 12px 0;
}

.tag-search-container {
  position: relative;
  margin-bottom: 12px;
}

.tag-search-input {
  width: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px 12px 10px 40px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}

.tag-search-input:focus {
  border-color: var(--primary-violet);
  background-color: var(--bg-primary);
}

.tag-search-input::placeholder {
  color: var(--text-third);
  opacity: 0.6;
}

.tag-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.filter-tag {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background-color: var(--btn-primary);
    color: var(--text-primary);
  }
  
  &.active {
    background-color: var(--primary-violet);
    color: white;
    border-color: var(--primary-violet);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.action-buttons {
  width: 100%;
  display: flex;
  gap: 24px;
  margin-top: 25px;
  justify-content: flex-start;
  align-items: center;
  padding-left: 48px;
  
  &.compact {
    width: auto;
    margin-top: 0;
    padding-left: 0;
    margin-left: auto;
  }
}

.create-button {
  width: 230px;
  height: 60px;
  background: linear-gradient(to right, var(--primary-violet) 0%, var(--primary-pink) 100%);
  border: none;
  border-radius: 20px;
  font-size: 30px;
  display: flex;
  margin-left: 0;
  margin-top: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0 24px;

  &:hover {
    opacity: 0.8;
  }
}

.preview-button {
  width: 230px;
  height: 60px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-size: 28px;
  display: flex;
  margin-left: 0;
  margin-top: 0;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding-left: 32px;

  &:hover {
    opacity: 0.8;
  }
}

.draft-button {
  width: 290px;
  height: 60px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-size: 25px;
  display: flex;
  margin-left: 0;
  margin-top: 0;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding-left: 32px;

  &:hover {
    opacity: 0.8;
  }
}

.button-icon {
  font-size: 24px;
  margin-right: 12px;

  .preview-button & {
    font-size: 24px;
  }

  .draft-button & {
    font-size: 24px;
  }
}

/* Increase icon size for create/preview buttons (slightly) */
.create-button .button-icon,
.preview-button .button-icon {
  font-size: 24px;
}

.button-text {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 20px;
}

/* Increase text size for create/preview buttons (slightly) */
.create-button .button-text,
.preview-button .button-text,
.draft-button .button-text {
  font-size: 24px;
}

// Publication time section
/* .publication-time-section {
  width: 100%;
  margin-top: 48px;
}

.publication-time-header {
  display: flex;
  align-items: center;
} */

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.p-editor .p-editor-content .ql-editor) {
  background-color: var(--bg-primary) !important;
}

// Custom checkbox styling
.checkbox {
  width: 40px;
  height: 40px;
  border: 2px solid #6b7280;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 48px;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #9CA3AF;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &.checked {
    background-color: #8B5CF6;
    border: 2px solid white;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;
    }

  }
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 60px;
    height: 60px;
    opacity: 0;
  }
}

@keyframes checkmark {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.checkmark-icon {
  font-size: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: checkmark 0.4s ease-out 0.1s both;
  color: white;
  font-weight: bold;
}

.checkbox-label {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 8px;
}

/* .publication-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 10px;
  margin-left: 48px;
  width: 460px;
}

.time-inputs {
  display: flex;
  margin-top: 16px;
  margin-left: 48px;
  gap: 24px;
}

.date-input {
  width: 400px;
  height: 65px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-weight: bold;
  font-size: 25px;
  text-align: center;
  color: var(--text-primary);
  cursor: text;
  transition: all 0s ease-in-out;
  padding: 0 20px;

  &::placeholder {
    color: var(--text-third);
  }

  &:focus {
    outline: none;
    border: 2px solid white;
    border-radius: 20px;
  }

}

.time-input {
  width: 300px;
  height: 65px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-weight: bold;
  font-size: 25px;
  text-align: center;
  color: var(--text-primary);
  cursor: text;
  transition: all 0s ease-in-out;
  padding: 0 20px;

  &::placeholder {
    color: var(--text-third);
  }

  &:focus {
    outline: none;
    border: 2px solid white;
    border-radius: 20px;
  }

}

.publication-label {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 32px;
  margin-left: 48px;
} */

// Ranks section
.ranks-section {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

// Additional settings
.additional-settings-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 32px;
  margin-left: 48px;
}

.additional-settings {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

// API Error styles
.api-error {
  margin: 16px 48px;
  padding: 12px;
  background-color: rgba(255, 59, 59, 0.1);
  border: 1px solid #FF3B3B;
  border-radius: 8px;
}

.api-error-message {
  color: #FF3B3B;
  font-size: 16px;
  font-family: var(--font-sans);
  margin: 0;
  text-align: center;
}

// Disabled button states
.create-button:disabled,
.preview-button:disabled,
.draft-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-button:hover:not(:disabled) {
  opacity: 0.8;
}

.preview-button:hover:not(:disabled) {
  opacity: 0.8;
}

.draft-button:hover:not(:disabled) {
  opacity: 0.8;
}

.image-preview {
    background-color: var(--bg-secondary);
    width: 1400px;
    border-radius: 25px;
    padding: 32px 48px;
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    @media (max-width: 768px) {
        width: 100%;
        padding: 24px 16px;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
        width: 100%;
        max-width: 1000px;
        padding: 28px 32px;
    }
}

.preview-image-wrapper {
    width: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 20px;
    
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
    height: auto;
    max-height: 800px;
    max-width: 100%;
    object-fit: contain;
    position: relative;
    z-index: 2;
    display: block;
    border-radius: 15px;
    transition: transform 0.25s ease;
    margin: 0 auto;
    
    &:hover {
        transform: scale(1.02);
    }
}
.uploading-note {
    margin-top: 8px;
    color: var(--text-secondary);
    font-style: italic;
}
.preview-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 30px;
    font-family: var(--font-sans);
    font-weight: bold;
}

// Preview Modal Styles
.preview-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 24px;
  backdrop-filter: blur(4px);
  /* Отключаем pointer events для overlay, чтобы клики не обрабатывались */
  pointer-events: none;
}

.preview-modal {
  /* Включаем pointer events обратно для модального окна */
  pointer-events: auto;
}

/* Cropper overlay - не закрывается при клике вне модального окна */
.cropper-overlay {
  pointer-events: none !important;
}

.cropper-modal {
  pointer-events: auto !important;
}

// Validation modal (reuses overlay styles)
.validation-intro {
  color: var(--text-primary);
  font-weight: bold;
  margin: 0 0 8px 0;
  font-family: var(--font-sans);
  font-size: 16px;
}

.validation-list {
  margin: 0 0 0 18px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  li { margin-bottom: 6px; }
}

// Bottom toast styles
.validation-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 640px;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  z-index: 10050;
  overflow: hidden;
}

.validation-toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.validation-toast-title {
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.validation-toast-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.validation-toast-content {
  padding: 10px 16px 14px 16px;
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-secondary);
}

// Slide-in transition
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s ease, opacity 0.25s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, 16px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

// Shake animation on error
@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-12px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(6px); }
}

.shake {
  animation: shakeX 0.45s ease;
}

.preview-modal {
  background: var(--bg-secondary);
  border-radius: 25px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 20px;
    margin: 12px;
  }
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
}

.preview-modal-title {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.preview-modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
  
  i {
    font-size: 20px;
  }
}

.preview-modal-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-violet);
    border-radius: 4px;
  }
}

// Transitions
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .preview-modal,
.modal-fade-leave-active .preview-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
  
  .preview-modal {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
}

.modal-fade-leave-to {
  opacity: 0;
  
  .preview-modal {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
}

</style>
