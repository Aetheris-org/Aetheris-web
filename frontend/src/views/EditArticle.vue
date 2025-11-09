<template>
  <div class="create-article-container">
    <div class="header-spacer"></div>
    <!-- Body -->
    <div class="content-wrapper">

      <!-- Warning block -->
      <div class="warning-block">
        <h2 class="warning-title">{{ $t('create-article.h1') }}</h2>
        <h2 class="warning-subtitle">{{ $t('create-article.h2') }}</h2>
        <button class="read-rules-button" type="button" @click="router.push('/legal/community-rules')">{{ $t('create-article.button1') }}</button>
      </div>

      <!-- Pretty Uploader -->
      <section class="nice-uploader">
        <div 
          class="uploader-dropzone" 
          :class="{ 'is-drag': isDragOver }"
          @click="openFileExplorer"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <input ref="fileInputRef" type="file" class="hidden-file-input" accept="image/*" @change="onFileSelected" />
          <div v-if="!localPreview" class="uploader-empty">
            <i class="pi pi-image"></i>
            <h3>Загрузите превью статьи</h3>
            <p>Перетащите изображение сюда или нажмите, чтобы выбрать файл</p>
            <span class="hint">WebP/JPEG/PNG до 10MB</span>
          </div>

          <div v-else class="uploader-preview">
            <img :src="localPreview" alt="Article preview" />
            <div class="uploader-actions">
              <button type="button" class="btn subtle" @click.stop="openCropper">
                <i class="pi pi-pencil"></i><span>{{ $t('create-article.imageButtons.crop') }}</span>
              </button>
              <button type="button" class="btn ghost" @click.stop="openFileExplorer">
                <i class="pi pi-refresh"></i><span>{{ $t('create-article.imageButtons.replace') }}</span>
              </button>
              <button type="button" class="btn danger" @click.stop="removePreview">
                <i class="pi pi-trash"></i><span>{{ $t('create-article.imageButtons.remove') }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

        <!-- Preview Image Upload Section -->
        <div class="preview-upload-section">
          <div class="preview-upload-header">
            <h3 class="preview-upload-title">{{ $t('create-article.imageUpload.title') }}</h3>
            <p class="preview-upload-subtitle">{{ $t('create-article.imageUpload.subtitle') }}</p>
          </div>
          
          <div class="preview-upload-wrapper">
            <label class="file-upload-label" :class="{ 'uploading': uploadingImage || processingImage, 'has-preview': localPreview }">
              <input 
                type="file" 
                @change="onFileSelected" 
                accept="image/*" 
                class="file-input"
                :disabled="uploadingImage"
              />
              <div class="file-upload-content">
                <Transition name="fade" mode="out-in">
                  <div v-if="uploadingImage || processingImage" key="loading" class="upload-loading">
                    <div class="spinner"></div>
                    <p class="upload-text">{{ uploadingImage ? $t('notifications.editArticle.upload.loading') : $t('notifications.editArticle.upload.processing') }}</p>
                  </div>
                  <div v-else-if="localPreview" key="preview" class="upload-preview" @click.prevent="openCropper()">
                    <img :src="localPreview" alt="Preview" class="upload-preview-img" />
                    <div class="upload-preview-overlay">
                      <i class="pi pi-image"></i>
                      <p>{{ $t('create-article.imageUpload.clickToChange') }}</p>
                    </div>
                  </div>
                  <div v-else key="empty" class="upload-empty">
                    <i class="pi pi-image"></i>
                    <p class="upload-text">{{ $t('create-article.imageUpload.clickToUpload') }}</p>
                    <span class="upload-hint">{{ $t('create-article.imageUpload.formats') }}</span>
                  </div>
                </Transition>
              </div>
            </label>
            
            <button 
              v-if="localPreview && !uploadingImage && !processingImage" 
              @click="removePreview"
              class="remove-preview-btn"
              type="button"
            >
              <i class="pi pi-times"></i>
              <span>{{ $t('create-article.imageButtons.remove') }}</span>
            </button>
          </div>
        </div>


        <!-- Path block -->
      <div class="path-block">
        <h2 class="edit-title">{{ $t('create-article.h4') }}</h2>
        <h2 class="edit-subtitle">{{ $t('create-article.h5') }}</h2>
        <input type="text" placeholder="Enter title..." :class="['title-input', { invalid: fieldErrors.title }]" v-model="articleTitle">

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
          
          <!-- Selected Tags Display -->
          <div v-if="selectedTags.length > 0" class="selected-tags">
            <div 
              v-for="tag in selectedTags" 
              :key="tag" 
              :class="['custom-tag-wrapper', `tag-${getTagSeverity(tag)}`]"
            >
              <span class="tag-text">{{ tag }}</span>
              <button 
                @click="removeTag(tag)" 
                class="tag-remove-btn"
                type="button"
                :aria-label="$t('notifications.editArticle.removeTag', { tag })"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Tag Input with Autocomplete -->
          <div class="tag-input-wrapper">
            <input 
              type="text" 
              v-model="tagInput"
              @input="onTagInput"
              @focus="showSuggestions = true"
              @keydown.enter.prevent="addTagFromInput"
              :placeholder="selectedTags.length >= 5 ? $t('create-article.tags.placeholderMax') : $t('create-article.tags.placeholder')"
              :disabled="selectedTags.length >= 5"
              :class="['tags-input-field', { invalid: fieldErrors.tags }]"
            />
            
            <!-- Suggestions Dropdown -->
            <div 
              v-if="showSuggestions && filteredTags.length > 0 && selectedTags.length < 5" 
              class="tags-suggestions"
            >
              <div 
                v-for="tag in filteredTags" 
                :key="tag"
                @click="addTag(tag)"
                class="suggestion-item"
              >
                {{ tag }}
              </div>
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
      <div v-if="isPreviewModalOpen" class="preview-modal-overlay article-preview-overlay">
        <div class="preview-modal article-preview-modal">
          <div class="preview-modal-header">
            <h2 class="preview-modal-title">{{ $t('create-article.previewModal.title') }}</h2>
            <button class="preview-modal-close" @click="closePreviewModal" type="button">
              <i class="pi pi-times"></i>
            </button>
          </div>
          
          <div class="preview-modal-content" @click.capture.stop @mousedown.capture.stop>
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
          <span class="validation-toast-title">{{ $t('notifications.editArticle.validation.title') }}</span>
          <button class="validation-toast-close" @click="showValidationModal = false" type="button" :aria-label="$t('common.close')">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="validation-toast-content">
          <p class="validation-intro">{{ $t('notifications.editArticle.validation.intro') }}</p>
          <ul class="validation-list">
            <li v-for="(msg, idx) in validationErrors" :key="idx">{{ msg }}</li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
  <!-- Cropper Modal -->
  <div v-if="isCropperOpen" class="preview-modal-overlay cropper-overlay">
    <div class="preview-modal cropper-modal" @click.stop @mousedown.stop @mouseup.stop style="width:min(96vw, 1280px); max-height:90vh;">
      <div class="preview-modal-header">
        <h2 class="preview-modal-title">{{ $t('create-article.cropperModal.title') }}</h2>
        <button class="preview-modal-close" @click="closeCropper" type="button">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="preview-modal-content" @click.stop @mousedown.stop @mouseup.stop>
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
          <span>Вся область</span>
        </button>
        <div class="grow"></div>
        <button class="btn subtle" @click="closeCropper" type="button">
          <i class="pi pi-times"></i>
          <span>Отмена</span>
        </button>
        <button class="btn primary" @click="confirmAvatarCrop" type="button">
          <i class="pi pi-check"></i>
          <span>Применить</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Editor from 'primevue/editor'
import Tag from 'primevue/tag'
import FireIcon from '@/assets/svgs/fire_ico.svg'
import { useToast } from 'primevue/usetoast'
import FullArticleCard from '@/components/FullArticleCard.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'
import type { Article } from '@/types/article'

const { t } = useI18n()
const toast = useToast()

import { useArticles } from '@/composables/useArticles'
import { getArticleForEdit, updateArticle as apiUpdateArticle, uploadPreviewImage } from '@/api/articles'
import { useTags } from '@/composables/useTags'
import { useAuthStore } from '@/stores/auth'
import type { CreateArticleRequest } from '@/types/article'

// Article data
const articleTitle = ref('')
const articleContent = ref('')
const router = useRouter()
const route = useRoute()
const selectedFile = ref<File | null>(null)
const localPreview = ref<string | null>(null) //URL.createObjectURL
const uploadingImage = ref(false) //это для индикации загрузки изображения на imgBB. Надо потом накидать стилей под это
const isPreviewModalOpen = ref(false)
const previewData = ref<any>({})
const processingImage = ref(false) // Для анимации при выборе файла
// Cropper state
const isCropperOpen = ref(false)
const sourceImageUrl = ref<string | null>(null)
const croppedBlob = ref<Blob | null>(null)
const croppedFileName = ref<string>('preview.webp')
const articleCropperRef = ref<any>(null)
// Uploader state
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Validation state
const validationErrors = ref<string[]>([])
const showValidationModal = ref(false)
const isShaking = ref(false)
const fieldErrors = ref<{ title: boolean; content: boolean; tags: boolean }>({ title: false, content: false, tags: false })

// Computed для создания объекта Article для предпросмотра
const previewArticleData = computed<Article>(() => {
  const authorUsername = (auth.user as any)?.nickname || (auth.user as any)?.username || 'Anonymous'
  const previewUrl = localPreview.value || undefined
  
  // Логируем для отладки
  if (previewUrl) {
    console.log('Preview URL в computed:', previewUrl, typeof previewUrl)
  }
  
  return {
    id: editingArticleId.value || 0,
    title: articleTitle.value.trim() || t('notifications.editArticle.defaultTitle'),
    content: articleContent.value || '<p>Содержание статьи еще не добавлено...</p>',
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
const tagInput = ref('')
const showSuggestions = ref(false)

// Difficulty selection
const selectedDifficulty = ref<string>('medium') // Default to medium
const difficultyOptions = computed(() => ({
  easy: t('create-article.difficulty.easy'),
  medium: t('create-article.difficulty.medium'),
  hard: t('create-article.difficulty.hard')
} as Record<string, string>))

const filteredTags = computed(() => {
  return filterTags(tagInput.value, selectedTags.value).slice(0, 10)
})

// API integration
const { createArticle, updateArticle, loading, error } = useArticles()
const auth = useAuthStore()
const isEditing = ref(true)
const editingArticleId = ref<number | null>(null)

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
  if (selectedTags.value.length >= 5) {
    toast.add({ severity: 'warn', summary: t('create-article.tags.limitTitle'), detail: t('create-article.tags.limitToast'), life: 3000 })
    return
  }
  
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    tagInput.value = ''
    showSuggestions.value = false
  }
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const onTagInput = () => {
  showSuggestions.value = true
}

const addTagFromInput = () => {
  const inputValue = tagInput.value.trim()
  
  if (!inputValue) return
  
  if (selectedTags.value.length >= 5) {
    toast.add({ severity: 'warn', summary: t('create-article.tags.limitTitle'), detail: t('create-article.tags.limitToast'), life: 3000 })
    return
  }
  
  // Проверяем, есть ли точное совпадение в отфильтрованных тегах
  const exactMatch = filteredTags.value.find(
    tag => tag.toLowerCase() === inputValue.toLowerCase()
  )
  
  if (exactMatch) {
    addTag(exactMatch)
  } else if (filteredTags.value.length > 0) {
    // Если есть предложения, берём первое
    addTag(filteredTags.value[0])
  }
  // Кастомные теги больше не создаются
}

// Difficulty selection function
const selectDifficulty = (level: string) => {
  selectedDifficulty.value = level
}

// Закрытие предложений при клике вне компонента
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.tag-input-wrapper')) {
    showSuggestions.value = false
  }
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
    validationErrors.value = []
    fieldErrors.value = { title: false, content: false, tags: false }
    if (!articleTitle.value.trim()) {
        fieldErrors.value.title = true
        validationErrors.value.push(t('notifications.editArticle.validation.titleRequired'))
    }
    if (!articleContent.value.trim()) {
        fieldErrors.value.content = true
        validationErrors.value.push(t('notifications.editArticle.validation.contentRequired'))
    }
    if (selectedTags.value.length === 0) {
        fieldErrors.value.tags = true
        validationErrors.value.push(t('notifications.editArticle.validation.tagsRequired'))
    }
    if (validationErrors.value.length > 0) {
        isShaking.value = true
        showValidationModal.value = true
        setTimeout(() => { isShaking.value = false }, 600)
        toast.add({ 
            severity: 'warn', 
            summary: t('notifications.editArticle.validation.fillFields.summary'), 
            detail: t('notifications.editArticle.validation.fillFields.detail'), 
            life: 3000 
        })
        return
    }

    try {
        let previewUrl: string | undefined = undefined
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
                toast.add({ 
                    severity: 'warn', 
                    summary: t('notifications.editArticle.upload.previewNotLoaded.summary'), 
                    detail: t('notifications.editArticle.upload.previewNotLoaded.detail'), 
                    life: 4000 
                })
            } finally {
                uploadingImage.value = false
            }
        }

        const articleData: CreateArticleRequest = {
            title: articleTitle.value.trim(),
            content: articleContent.value,
            excerpt: generateExcerpt(articleContent.value),
            tags: selectedTags.value, // используем selectedTags вместо articleTags
            status: 'published',
            preview_image: previewUrl, // <--- вместо previewImage
            difficulty: selectedDifficulty.value,
            author: (auth.user as any)?.nickname || (auth.user as any)?.username || 'Anonymous'
        }

        const result = isEditing.value && editingArticleId.value && auth.user?.id
            ? await apiUpdateArticle(editingArticleId.value, auth.user.id, articleData)
            : await createArticle(articleData)

        console.log('ArticleData перед API:', articleData)
        console.log('Созданная статья:', result)
        toast.add({
          severity: 'success',
          summary: t('notifications.editArticle.publish.success.summary'),
          detail: t('notifications.editArticle.publish.success.detail'),
          life: 4000
        })
        await router.push('/your-articles')
    } catch (err) {
        console.error(err)
        toast.add({
          severity: 'error',
          summary: t('notifications.editArticle.publish.error.summary'),
          detail: t('notifications.editArticle.publish.error.detail'),
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

// Глобальный обработчик для блокировки всех кликов вне модального окна
const handleGlobalClick = (event: MouseEvent) => {
  if (!isPreviewModalOpen.value) return
  
  const target = event.target as HTMLElement
  const modal = document.querySelector('.article-preview-modal')
  
  // Если клик вне модального окна - блокируем
  if (modal && !modal.contains(target)) {
    console.log('🚫 Click blocked outside modal!', target)
    event.stopPropagation()
    event.preventDefault()
    return false
  }
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
  
  // Добавляем глобальный обработчик кликов
  setTimeout(() => {
    document.addEventListener('click', handleGlobalClick, true)
    document.addEventListener('mousedown', handleGlobalClick, true)
  }, 100)
}

const closePreviewModal = () => {
  console.log('🔴 closePreviewModal called!', new Error().stack)
  isPreviewModalOpen.value = false
  // Восстанавливаем скролл фона
  document.body.style.overflow = ''
  // Удаляем глобальный обработчик
  document.removeEventListener('click', handleGlobalClick, true)
  document.removeEventListener('mousedown', handleGlobalClick, true)
}

const removePreview = () => {
  if (localPreview.value) {
    // Проверяем, является ли это blob URL перед revoke
    if (localPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview.value)
    }
    localPreview.value = null
  }
  if (sourceImageUrl.value) {
    // Проверяем, является ли это blob URL перед revoke
    if (sourceImageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(sourceImageUrl.value)
    }
    sourceImageUrl.value = null
  }
  selectedFile.value = null
  croppedBlob.value = null
}

const saveDraft = async () => {
  if (!articleTitle.value.trim()) {
    fieldErrors.value.title = true
    isShaking.value = true
    setTimeout(() => { isShaking.value = false }, 600)
    toast.add({ 
      severity: 'warn', 
      summary: t('notifications.editArticle.draft.noTitle.summary'), 
      detail: t('notifications.editArticle.draft.noTitle.detail'), 
      life: 3000 
    })
    return
  }

  try {
    let previewUrl: string | undefined = undefined
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
      difficulty: selectedDifficulty.value,
      author: (auth.user as any)?.nickname || (auth.user as any)?.username || 'Anonymous'
    }

    const result = isEditing.value && editingArticleId.value && auth.user?.id
      ? await apiUpdateArticle(editingArticleId.value, auth.user.id, articleData)
      : await createArticle(articleData)

    console.log('Черновик сохранен:', result)
    toast.add({
      severity: 'success',
      summary: t('notifications.editArticle.draft.saved.summary'),
      detail: t('notifications.editArticle.draft.saved.detail'),
      life: 4000
    })
    await router.push('/your-articles')
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: t('notifications.editArticle.draft.error.summary'),
      detail: t('notifications.editArticle.draft.error.detail'),
      life: 5000
    })
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  // Отключено: Preview Modal закрывается только по кнопке
  // if (event.key === 'Escape' && isPreviewModalOpen.value) {
  //   closePreviewModal()
  // }
}

onMounted(async () => {
  // Add click outside handler
  document.addEventListener('click', handleClickOutside)
  // Add escape key handler
  document.addEventListener('keydown', handleEscapeKey)
  
  // Load existing article for edit
  const idParam = route.params.id
  const id = typeof idParam === 'string' ? parseInt(idParam, 10) : Array.isArray(idParam) ? parseInt(idParam[0], 10) : NaN
  if (!isNaN(id)) {
    try {
      const a = await getArticleForEdit(id)
      editingArticleId.value = a.id
      articleTitle.value = a.title || ''
      articleContent.value = a.content || ''
      selectedTags.value = Array.isArray((a as any).tags) ? (a as any).tags : ((a as any).tags ? String((a as any).tags).split(',').map(t => t.trim()).filter(Boolean) : [])
      selectedDifficulty.value = (a as any).difficulty || 'medium'
      const previewUrl = (a as any).previewImage || (a as any).preview_image || null
      localPreview.value = previewUrl
      // Устанавливаем sourceImageUrl для возможности редактирования
      if (previewUrl) {
        sourceImageUrl.value = previewUrl
      }
    } catch (e) {
      toast.add({ 
        severity: 'error', 
        summary: t('notifications.editArticle.loadError.summary'), 
        detail: t('notifications.editArticle.loadError.detail'), 
        life: 4000 
      })
    }
  }
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  // Cleanup preview URL if exists
  if (localPreview.value) {
    URL.revokeObjectURL(localPreview.value)
  }
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value)
  }
})

async function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        
        // Проверка размера файла (до 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.add({
                severity: 'warn',
                summary: t('notifications.editArticle.upload.fileTooLarge.summary'),
                detail: t('notifications.editArticle.upload.fileTooLarge.detail'),
                life: 4000
            })
            input.value = ''
            processingImage.value = false
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
                summary: t('notifications.editArticle.upload.error.summary'),
                detail: t('notifications.editArticle.upload.error.detail'),
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
  console.log('openCropper called:', { 
    hasLocalPreview: !!localPreview.value, 
    hasSourceImageUrl: !!sourceImageUrl.value,
    localPreview: localPreview.value,
    sourceImageUrl: sourceImageUrl.value 
  })
  
  // Если есть локальный превью, всегда используем его для sourceImageUrl
  if (localPreview.value) {
    // Если sourceImageUrl не установлен или отличается от localPreview, обновляем его
    if (!sourceImageUrl.value || sourceImageUrl.value !== localPreview.value) {
      // Если localPreview это blob URL или data URL, используем его напрямую
      if (localPreview.value.startsWith('blob:') || localPreview.value.startsWith('data:')) {
        sourceImageUrl.value = localPreview.value
        isCropperOpen.value = true
      } else {
        // Если это внешний URL, используем его напрямую
        sourceImageUrl.value = localPreview.value
        isCropperOpen.value = true
      }
    } else {
      // Если sourceImageUrl уже установлен и совпадает с localPreview, просто открываем
      isCropperOpen.value = true
    }
  } else if (sourceImageUrl.value) {
    // Если нет localPreview, но есть sourceImageUrl, используем его
    isCropperOpen.value = true
  } else {
    console.warn('openCropper: нет изображения для редактирования')
  }
}

// Uploader handlers
function openFileExplorer() {
  fileInputRef.value?.click()
}
function handleDragOver() { isDragOver.value = true }
function handleDragLeave() { isDragOver.value = false }
function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const fakeEvent = { target: { files } } as unknown as Event
    onFileSelected(fakeEvent)
  }
}

let tempCroppedFile: File | null = null
function onAvatarCrop(file: File) {
  tempCroppedFile = file
}
function closeCropper() {
  // Закрываем редактор, но сохраняем sourceImageUrl для возможности повторного открытия
  isCropperOpen.value = false
  console.log('closeCropper: редактор закрыт, sourceImageUrl сохранен:', sourceImageUrl.value)
}

async function confirmAvatarCrop() {
  try {
    if (!tempCroppedFile && (articleCropperRef as any)?.value?.getCroppedImage) {
      tempCroppedFile = await (articleCropperRef as any).value.getCroppedImage()
    }
    if (tempCroppedFile) {
      croppedBlob.value = tempCroppedFile
      if (localPreview.value && localPreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview.value)
      }
      const newPreviewUrl = URL.createObjectURL(tempCroppedFile)
      localPreview.value = newPreviewUrl
      // Обновляем sourceImageUrl на новое обрезанное изображение
      sourceImageUrl.value = newPreviewUrl
      isCropperOpen.value = false
    }
  } catch (e) {
    console.error(e)
    toast.add({ 
      severity: 'error', 
      summary: t('notifications.editArticle.upload.cropError.summary'), 
      detail: t('notifications.editArticle.upload.cropError.detail'), 
      life: 4000 
    })
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
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: var(--font-sans);
  color: var(--text-primary);
}
.btn i { font-size: 16px; }
.btn.primary { background: var(--btn-primary, #6d28d9); color: #fff; }
.btn.subtle { background: #1f1f22; border-color: #2b2b2e; color: #eaeaea; }
.btn.ghost { background: transparent; border-color: #2b2b2e; color: #eaeaea; }
.btn:hover { filter: brightness(1.05); }
.btn:active { transform: translateY(1px); }
</style>

<style lang="scss" scoped>
.create-article-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding: 200px 16px; // extra top offset from fixed header (increased)
  box-sizing: border-box;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: 140px 12px 100px; // more top space on mobile (increased)
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 160px 20px 100px; // more top space on tablet (increased)
    max-width: 1000px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    padding: 200px 24px 100px; // more top space on desktop (increased)
    max-width: 1400px;
  }
}

.header-spacer {
  height: 220px;

  @media (max-width: 768px) {
    height: 160px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    height: 190px;
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
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 48px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0s ease-in-out;

}

// Pretty uploader styles
.nice-uploader {
  width: 1400px;
  margin-top: 16px;
}
.uploader-dropzone {
  position: relative;
  background: var(--bg-secondary);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.uploader-dropzone.is-drag { border-color: var(--primary-violet); background: rgba(109,40,217,0.1); }
.hidden-file-input { display: none; }
.uploader-empty { text-align: center; color: var(--text-secondary); }
.uploader-empty i { font-size: 36px; color: var(--primary-violet); }
.uploader-empty h3 { color: var(--text-primary); margin: 8px 0 4px; font-family: var(--font-sans); }
.uploader-empty p { margin: 0; }
.uploader-empty .hint { display:block; margin-top: 6px; font-size: 12px; opacity: .7; }
.uploader-preview { position: relative; width: 100%; display: flex; justify-content: center; }
.uploader-preview img { max-width: 100%; max-height: 420px; border-radius: 14px; display:block; }
.uploader-actions { position: absolute; bottom: 16px; right: 16px; display: flex; gap: 10px; }
.uploader-actions .btn { height: 40px; padding: 0 12px; border-radius: 12px; border:1px solid #2b2b2e; background:#1f1f22; color:#eaeaea; display:inline-flex; align-items:center; gap:8px; }
.uploader-actions .btn.ghost { background: transparent; }
.uploader-actions .btn.danger { background:#2b1f1f; border-color:#3a2a2a; color:#ffb3b3; }

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
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-top: 24px;
  margin-left: 48px;
}

.edit-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
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

.tags-input-field.invalid {
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
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.difficulty-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
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

.tags-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.tags-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
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

.tags-input-field {
  width: 100%;
  height: 68px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-weight: bold;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 22px;
  color: var(--text-primary);
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-third);
  }

  &:focus {
    outline: none;
    border: 2px solid var(--primary-violet);
    border-radius: 20px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

.action-buttons {
  width: 100%;
  display: flex;
  gap: 4px;
  margin-top: 25px;
  justify-content: flex-end;
  align-items: center;
}

.create-button {
  width: 269px;
  height: 56px;
  background: linear-gradient(to right, var(--primary-violet) 0%, var(--primary-pink) 100%);
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

.preview-button {
  width: 280px;
  height: 56px;
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

.draft-button {
  width: 290px;
  height: 56px;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 20px;
  font-size: 25px;
  display: flex;
  margin-left: 16px;
  margin-top: 16px;
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
    font-size: 32px;
  }

  .draft-button & {
    font-size: 24px;
  }
}

/* Increase icon size specifically for create/preview buttons */
.create-button .button-icon,
.preview-button .button-icon {
  font-size: 32px;
}

.button-text {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-left: 20px;
}

/* Increase text size specifically for create/preview buttons */
.create-button .button-text,
.preview-button .button-text,
.draft-button .button-text {
  font-size: 32px;
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

// Preview Upload Section
.preview-upload-section {
  background-color: var(--bg-secondary);
  width: 1400px;
  border-radius: 25px;
  padding: 32px 48px;
  margin-top: 24px;
  
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

.preview-upload-header {
  margin-bottom: 24px;
}

.preview-upload-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 8px 0;
}

.preview-upload-subtitle {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.preview-upload-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.file-upload-label {
  flex: 1;
  position: relative;
  display: block;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.uploading {
    pointer-events: none;
  }
  
  &.has-preview {
    .file-upload-content {
      border: 2px dashed transparent;
      border-radius: 20px;
      overflow: hidden;
    }
  }
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-upload-content {
  min-height: 300px;
  background-color: var(--btn-primary);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-height: 200px;
    border-radius: 16px;
  }
  
  .file-upload-label:hover & {
    border-color: var(--primary-violet);
    background-color: rgba(139, 92, 246, 0.1);
  }
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  text-align: center;
  
  i {
    font-size: 64px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
}

.upload-text {
  color: var(--text-primary);
  font-size: 22px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.upload-hint {
  color: var(--text-third);
  font-size: 16px;
  font-family: var(--font-sans);
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top-color: var(--primary-violet);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.upload-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  i {
    font-size: 48px;
    color: white;
  }
  
  p {
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }
  
  .file-upload-label:hover & {
    opacity: 1;
  }
}

.remove-preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.5);
  border-radius: 20px;
  color: #ef4444;
  font-size: 18px;
  font-weight: bold;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
    transform: translateY(-2px);
  }
  
  i {
    font-size: 18px;
  }
}

// Preview Modal
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
}

/* Article Preview overlay - не закрывается при клике вне модального окна */
.article-preview-overlay {
  /* Отключаем pointer events для overlay, чтобы клики не обрабатывались */
  pointer-events: none !important;
  /* Убираем курсор pointer */
  cursor: default !important;
}

.article-preview-modal {
  /* Включаем pointer events обратно для модального окна */
  pointer-events: auto !important;
  /* Возвращаем обычный курсор */
  cursor: default !important;
}

/* Cropper overlay - не закрывается при клике вне модального окна */
.cropper-overlay {
  /* Отключаем pointer events для overlay, чтобы клики не обрабатывались */
  pointer-events: none;
}

.cropper-modal {
  /* Включаем pointer events обратно для модального окна */
  pointer-events: auto;
  position: relative;
  z-index: 10001;
}

// Validation text
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

.preview-article {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-article-image {
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 250px;
    border-radius: 16px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-article-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-article-title {
  color: var(--text-primary);
  font-size: 36px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.preview-article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-tag {
  padding: 10px 20px;
  border-radius: 15px;
  font-size: 16px;
  font-weight: bold;
  font-family: var(--font-sans);
  color: white;
  
  &.tag-success {
    background-color: rgba(34, 197, 94, 0.3);
  }
  
  &.tag-info {
    background-color: rgba(59, 130, 246, 0.3);
  }
  
  &.tag-warning {
    background-color: rgba(245, 158, 11, 0.3);
  }
  
  &.tag-danger {
    background-color: rgba(239, 68, 68, 0.3);
  }
  
  &.tag-secondary {
    background-color: rgba(100, 116, 139, 0.3);
  }
}

.preview-article-difficulty {
  display: flex;
  align-items: center;
  gap: 12px;
}

.difficulty-label {
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: bold;
}

.difficulty-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: bold;
}

.preview-article-content {
  color: var(--text-primary);
  font-size: 18px;
  line-height: 1.8;
  font-family: var(--font-sans);
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    color: var(--text-primary);
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  :deep(p) {
    margin-bottom: 16px;
  }
  
  :deep(ul), :deep(ol) {
    margin-left: 24px;
    margin-bottom: 16px;
  }
  
  :deep(li) {
    margin-bottom: 8px;
  }
  
  :deep(code) {
    background: rgba(139, 92, 246, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }
  
  :deep(pre) {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 16px;
  }
  
  :deep(blockquote) {
    border-left: 4px solid var(--primary-violet);
    padding-left: 16px;
    margin: 16px 0;
    font-style: italic;
    opacity: 0.8;
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 16px 0;
  }
  
  :deep(a) {
    color: var(--primary-violet);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// Transitions
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

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
