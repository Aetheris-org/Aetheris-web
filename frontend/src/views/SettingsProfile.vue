<template>
  <div class="settings-profile-container">
    <AppHeader />
    
    <!-- Проверка авторизации -->
    <div v-if="!authStore.isAuthenticated" class="unauthorized-message">
      <div class="unauthorized-content-inline">
        <h2>{{ $t('settings.display_profile.notRegistered.title') }}</h2>
        <p>{{ $t('settings.display_profile.notRegistered.subtitle') }}</p>
        <router-link to="/login" class="btn-primary-inline">{{ $t('settings.display_profile.notRegistered.loginButton') }}</router-link>
      </div>
    </div>
    
    <!-- Main Body -->
    <div v-else class="main-body">
      <!-- Sidebar -->
      <SettingsSidebar />
      
      <!-- Content -->
      <div class="content">
        <!-- Profile Information Section -->
        <div class="profile-section">
          <h1 class="section-title">{{ t('settings.display_profile.h1') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.display_profile.subtitle') }}</h2>
          
          <!-- Avatar Section -->
          <h1 class="section-title">{{ t('settings.display_profile.h2') }}</h1>
          <div class="avatar-section">
            <div class="avatar-placeholder">
              <img 
                v-if="safeAvatarUrl" 
                :src="safeAvatarUrl" 
                alt="Avatar" 
                class="avatar-image"
                @error="onAvatarError"
                @load="onAvatarLoad"
                loading="eager"
                referrerpolicy="no-referrer"
                crossorigin="anonymous"
                decoding="async"
              />
              <div v-else class="avatar-fallback">
                <svg
                  class="avatar-icon"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div class="avatar-buttons">
              <button class="avatar-button" @click="openUploadModal" :disabled="uploading">{{ uploading ? t('settings.display_profile.uploading') : t('settings.display_profile.button1') }}</button>
              <button class="avatar-button" @click="openDeleteModal" :disabled="!currentAvatar || uploading">{{ t('settings.display_profile.button2') }}</button>
            </div>
          </div>
          
          <!-- Nickname Section -->
          <h1 class="section-title">{{ t('settings.display_profile.h3') }}</h1>
          <h2 class="section-subtitle">{{ t('settings.display_profile.subtitle3') }}</h2>
          <input 
            type="text" 
            :placeholder="t('settings.display_profile.input_text1')" 
            class="nickname-input"
            :class="{ 'error': nicknameError }"
            v-model="nickname"
          />
          <p v-if="nicknameError" class="error-message">{{ nicknameError }}</p>
          
          <!-- Bio Section -->
          <div class="bio-section">
            <h1 class="section-title">{{ t('settings.display_profile.h4') }}</h1>
            <h2 class="section-subtitle">{{ t('settings.display_profile.subtitle4') }}</h2>
            <textarea 
              :placeholder="t('settings.display_profile.input_text2')" 
              class="bio-input"
              :class="{ 'error': bioError }"
              v-model="bio"
            ></textarea>
            <p v-if="bioError" class="error-message">{{ bioError }}</p>
            <p class="character-count">{{ bio.length }}/300</p>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
    
    <!-- Upload Avatar Modal -->
    <Transition name="modal">
      <div v-if="isUploadModalOpen" class="modal-overlay" @click="closeUploadModal">
        <div class="modal-content" :class="{ 'cropper-modal': showCropper }" @click.stop>
          <div class="modal-header">
          <h2 class="modal-title">{{ t('settings.display_profile.upload_panel.h1') }}</h2>
          <button class="modal-close" @click="closeUploadModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          </div>
        
        <div class="modal-body" :class="{ 'cropper-body': showCropper }">
          <!-- Cropper Section -->
          <div v-if="showCropper && previewUrl" class="cropper-section">
            <AvatarCropper :imageUrl="previewUrl" @crop="handleCrop" ref="cropperRef" />
          </div>
          
          <!-- Drag & Drop Zone (показывается только если нет изображения) -->
          <div 
            v-else
            class="dropzone" 
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="openFileExplorer"
          >
            <div class="dropzone-content">
              <svg class="upload-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 class="dropzone-title">{{ t('settings.display_profile.upload_panel.h2') }}</h3>
              <p class="dropzone-subtitle">{{ t('settings.display_profile.upload_panel.subtitle') }}</p>
              <p class="dropzone-info">{{ t('settings.display_profile.upload_panel.info') }}</p>
            </div>
          </div>
          
          <!-- Preview Area (для отображения информации о файле до обрезки) -->
          <div v-if="selectedFile && !showCropper" class="preview-area">
            <div class="preview-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-left">
            <button 
              v-if="showCropper" 
              class="modal-button secondary" 
              @click="resetToFileSelect"
            >
              ← Выбрать другое
            </button>
            <button 
              v-else
              class="modal-button secondary" 
              @click="openFileExplorer"
            >
              <svg class="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ t('settings.display_profile.upload_panel.browse_button') }}
            </button>
          </div>
          
          <div class="footer-right">
            <button 
              class="modal-button primary" 
              @click="handleUploadClick" 
              :disabled="(!selectedFile && !croppedFile) || uploading"
            >
              <svg v-if="!uploading" class="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="uploading">{{ t('settings.display_profile.uploading') || 'Загрузка...' }}</span>
              <span v-else-if="showCropper">{{ $t('settings.display_profile.uploadAvatar') }}</span>
              <span v-else>{{ t('settings.display_profile.upload_panel.upload_button') }}</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </Transition>
    
    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="isDeleteModalOpen" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content delete-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ t('settings.display_profile.remove_panel.h1') }}</h2>
            <button class="modal-close" @click="closeDeleteModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="warning-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="warning-title">{{ t('settings.display_profile.remove_panel.h1') }}</h3>
            <p class="warning-message">{{ t('settings.display_profile.remove_panel.subtitle') }}</p>
          </div>
          
          <div class="modal-footer">
            <button class="modal-button secondary" @click="closeDeleteModal">
              {{ t('settings.display_profile.remove_panel.button1') }}
            </button>
            <button class="modal-button danger" @click="confirmDeleteAvatar">
              {{ t('settings.display_profile.remove_panel.button2') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Hidden File Input -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      @change="handleFileSelect" 
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import SettingsSidebar from '@/components/SettingsSidebar.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'
import { uploadAvatar as uploadAvatarToAPI, updateProfile, getCurrentUser } from '@/api/profile'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { sanitizeAvatarUrl } from '@/utils/avatarValidation'
import { optimizeAvatar } from '@/utils/imageCompression'

const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()

const nickname = ref('')
const bio = ref('')
const currentAvatar = ref<string | null>(null)

// Обработка ошибок загрузки аватара
const avatarError = ref(false)
const safeAvatarUrl = computed(() => {
  // В режиме разработки логируем все проверки
  if (import.meta.env.DEV) {
    console.log('🔍 safeAvatarUrl computed:')
    console.log('  - avatarError:', avatarError.value)
    console.log('  - currentAvatar:', currentAvatar.value)
    console.log('  - currentAvatarType:', typeof currentAvatar.value)
  }
  
  if (avatarError.value) {
    if (import.meta.env.DEV) {
      console.warn('Avatar error flag is set, returning null')
    }
    return null
  }
  
  const sanitized = sanitizeAvatarUrl(currentAvatar.value)
  
  if (import.meta.env.DEV) {
    if (!sanitized && currentAvatar.value) {
      console.warn('❌ Avatar URL was sanitized to null:', {
        original: currentAvatar.value,
        type: typeof currentAvatar.value,
        length: currentAvatar.value?.length
      })
    } else if (sanitized) {
      console.log('✅ Avatar URL passed validation:', sanitized)
    }
  }
  
  return sanitized
})

const onAvatarError = (event?: Event) => {
  const img = event?.target as HTMLImageElement
  const expectedUrl = safeAvatarUrl.value
  
  console.error('❌ Failed to load avatar image:')
  console.error('  - URL:', currentAvatar.value)
  console.error('  - Expected URL:', expectedUrl)
  console.error('  - img.src:', img?.src)
  if (img) {
    console.error('  - img.complete:', img.complete)
    console.error('  - img.naturalWidth:', img.naturalWidth)
    console.error('  - img.naturalHeight:', img.naturalHeight)
  }
  
  // Проверяем что URL соответствует ожидаемому
  // Если URL не совпадает, это может быть старая ошибка от предыдущего изображения
  if (img && img.src !== expectedUrl && expectedUrl) {
    console.warn('⚠️ Avatar error for different URL, ignoring:', {
      imgSrc: img.src,
      expectedUrl: expectedUrl
    })
    return
  }
  
  // Проверяем что изображение действительно не загрузилось (naturalWidth/Height = 0)
  // Если complete = true но размеры = 0, это означает что изображение пустое или повреждено
  if (img && img.complete && img.naturalWidth === 0 && img.naturalHeight === 0) {
    console.error('❌ Image loaded but is empty (0x0)')
    // Даем еще одну попытку через небольшую задержку
    setTimeout(() => {
      if (img && img.naturalWidth === 0 && img.naturalHeight === 0 && img.src === expectedUrl) {
        console.error('❌ Image still empty after retry, setting error')
  avatarError.value = true
      }
    }, 500)
  } else {
    // Если изображение еще загружается, не устанавливаем ошибку сразу
    if (img && !img.complete) {
      console.warn('⚠️ Avatar error but image not complete yet, waiting...')
      return
    }
    avatarError.value = true
  }
}

const onAvatarLoad = (event?: Event) => {
  const img = event?.target as HTMLImageElement
  if (img) {
    // Проверяем что изображение действительно загрузилось (не пустое)
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.error('❌ Avatar image loaded but is empty (0x0):', {
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })
      
      // Пробуем перезагрузить с cache-busting параметром
      const url = new URL(img.src)
      url.searchParams.set('_t', Date.now().toString())
      console.log('🔄 Retrying avatar load with cache-busting:', url.toString())
      
      // Создаем новый Image объект для проверки
      const testImg = new Image()
      testImg.onload = () => {
        if (testImg.naturalWidth > 0 && testImg.naturalHeight > 0) {
          console.log('✅ Avatar loaded successfully after retry')
          img.src = url.toString()
          avatarError.value = false
        } else {
          console.error('❌ Avatar still empty after retry')
          avatarError.value = true
        }
      }
      testImg.onerror = () => {
        console.error('❌ Avatar retry failed')
        avatarError.value = true
      }
      testImg.src = url.toString()
      return
    }
    
    if (import.meta.env.DEV) {
    console.log('✅ Avatar image loaded successfully:')
    console.log('  - img.src:', img.src)
    console.log('  - img.complete:', img.complete)
    console.log('  - img.naturalWidth:', img.naturalWidth)
    console.log('  - img.naturalHeight:', img.naturalHeight)
  }
    
  // Сбрасываем ошибку при успешной загрузке
  avatarError.value = false
  }
}

watch(() => currentAvatar.value, () => {
  avatarError.value = false
})

// Состояния ошибок валидации тута гыг
const nicknameError = ref('')
const bioError = ref('')

// Upload Modal States
const isUploadModalOpen = ref(false)
const isDragOver = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const saving = ref(false)
const showCropper = ref(false)
const croppedFile = ref<File | null>(null)
const cropperRef = ref<InstanceType<typeof AvatarCropper> | null>(null)

// Исходные значения для сравнения - предотвращают автосохранение при инициализации
const initialNickname = ref('')
const initialBio = ref('')

// Delete Modal States
const isDeleteModalOpen = ref(false)

// Состояние загрузки профиля
const loadingProfile = ref(false)

// Загрузка профиля при монтировании
onMounted(async () => {
  loadingProfile.value = true
  try {
    // Добавляем таймаут для защиты от зависаний
    const user = await Promise.race([
      getCurrentUser(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ])
    
    const loadedNickname = user.nickname || ''
    const loadedBio = user.bio || ''
    
    // Сохраняем исходные значения ДО установки в reactive refs
    initialNickname.value = loadedNickname
    initialBio.value = loadedBio
    
    // Теперь устанавливаем значения - watchers не будут сохранять если значения не изменились
    nickname.value = loadedNickname
    bio.value = loadedBio
    currentAvatar.value = user.avatar || null
    
    // Логируем для отладки с детальными данными (раздельно чтобы увидеть значения)
    const safeUrl = sanitizeAvatarUrl(currentAvatar.value)
    console.log('📥 Profile loaded:')
    console.log('  - user.avatar (raw):', user.avatar)
    console.log('  - user.avatar type:', typeof user.avatar)
    console.log('  - currentAvatar.value:', currentAvatar.value)
    console.log('  - currentAvatar.value type:', typeof currentAvatar.value)
    console.log('  - safeAvatarUrl result:', safeUrl)
    console.log('  - safeAvatarUrl type:', typeof safeUrl)
    console.log('  - avatarError:', avatarError.value)
    
    // Дополнительная проверка валидации
    if (user.avatar && !safeUrl) {
      console.error('❌ Avatar URL failed validation:', user.avatar)
    }
    
    // Обновляем store
    authStore.setUser(user)
  } catch (error: any) {
    console.error('Failed to load profile:', error)
    
    // Если это не ошибка timeout, показываем сообщение
    if (error.message !== 'Request timeout') {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.response?.data?.detail || 'Не удалось загрузить профиль',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Превышено время ожидания. Попробуйте обновить страницу.',
        life: 4000
      })
    }
  } finally {
    loadingProfile.value = false
  }
})

// Валидация никнейма
const validateNickname = (value: string): string => {
  if (!value.trim()) {
    return 'Nickname is required'
  }
  
  if (value.length > 50) {
    return 'Nickname must be no more than 50 characters'
  }
  
  // Разрешение применимо только к латинице и кириллице
  const allowedPattern = /^[a-zA-Zа-яА-ЯёЁ\s]+$/
  if (!allowedPattern.test(value)) {
    return 'Nickname can only contain Latin letters, Cyrillic letters and spaces'
  }
  
  return ''
}

const validateBio = (value: string): string => {
  if (value.length > 300) {
    return 'Bio must be no more than 300 characters'
  }
  
  return ''
}


watch(nickname, (newValue) => {
  const sanitized = newValue.replace(/[^a-zA-Zа-яА-ЯёЁ\s]/g, '')
  if (sanitized !== newValue) {
    nickname.value = sanitized
    return // Выходим, чтобы не триггерить автосохранение при санитизации
  }
  nicknameError.value = validateNickname(nickname.value)
  
  // Автосохранение nickname (с debounce) - только если значение реально изменилось
  const trimmedValue = nickname.value.trim()
  if (trimmedValue !== initialNickname.value && !nicknameError.value && trimmedValue) {
    debouncedSaveNickname()
  }
})

watch(bio, (newValue) => {
  bioError.value = validateBio(newValue)
  
  // Автосохранение bio (с debounce) - только если значение реально изменилось
  const trimmedValue = bio.value.trim()
  if (trimmedValue !== initialBio.value && !bioError.value) {
    debouncedSaveBio()
  }
})

// Debounce для автосохранения
let nicknameSaveTimeout: ReturnType<typeof setTimeout> | null = null
let bioSaveTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSaveNickname = () => {
  if (nicknameSaveTimeout) clearTimeout(nicknameSaveTimeout)
  nicknameSaveTimeout = setTimeout(async () => {
    if (!nicknameError.value && nickname.value.trim() && !saving.value) {
      await saveNickname()
    }
  }, 1000)
}

const debouncedSaveBio = () => {
  if (bioSaveTimeout) clearTimeout(bioSaveTimeout)
  bioSaveTimeout = setTimeout(async () => {
    if (!bioError.value && !saving.value) {
      await saveBio()
    }
  }, 1000)
}

const saveNickname = async () => {
  const trimmedValue = nickname.value.trim()
  
  // Проверяем что значение реально изменилось
  if (trimmedValue === initialNickname.value) return
  
  if (nicknameError.value || !trimmedValue || saving.value) return
  
  saving.value = true
  try {
    // Backend использует username, но адаптер преобразует его в nickname
    const updatedUser = await updateProfile({ username: trimmedValue })
    authStore.setUser(updatedUser)
    // Обновляем исходное значение после успешного сохранения
    initialNickname.value = trimmedValue
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Никнейм обновлен',
      life: 2000
    })
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Не удалось обновить никнейм'
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMsg,
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const saveBio = async () => {
  const trimmedValue = bio.value.trim()
  
  // Проверяем что значение реально изменилось
  if (trimmedValue === initialBio.value) return
  
  if (bioError.value || saving.value) return
  
  saving.value = true
  try {
    const updatedUser = await updateProfile({ bio: trimmedValue || null })
    authStore.setUser(updatedUser)
    // Обновляем исходное значение после успешного сохранения
    initialBio.value = trimmedValue
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Биография обновлена',
      life: 2000
    })
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Не удалось обновить биографию'
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMsg,
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

// Upload Modal Functions
const openUploadModal = () => {
  isUploadModalOpen.value = true
  resetUploadState()
}

const closeUploadModal = () => {
  isUploadModalOpen.value = false
  resetUploadState()
}

const resetUploadState = () => {
  selectedFile.value = null
  previewUrl.value = ''
  isDragOver.value = false
  showCropper.value = false
  croppedFile.value = null
}

const resetToFileSelect = () => {
  showCropper.value = false
  croppedFile.value = null
  previewUrl.value = ''
}

const openFileExplorer = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пожалуйста, выберите файл изображения',
      life: 3000
    })
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Размер файла должен быть менее 5MB',
      life: 3000
    })
    return
  }
  
  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    // Показываем cropper после загрузки изображения
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

const handleCrop = (file: File) => {
  croppedFile.value = file
}

const handleUploadClick = async () => {
  if (showCropper.value && cropperRef.value) {
    // Если показывается cropper, сначала обрезаем изображение
    try {
      const croppedImage = await cropperRef.value.getCroppedImage()
      croppedFile.value = croppedImage
    } catch (error) {
      console.error('Crop error:', error)
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось обрезать изображение',
        life: 3000
      })
      return
    }
  }
  
  // Затем загружаем
  await uploadAvatar()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadAvatar = async () => {
  const fileToUpload = croppedFile.value || selectedFile.value
  if (!fileToUpload || uploading.value) return
  
  uploading.value = true
  let avatarFileId: string | null = null
  
  try {
    // ВРЕМЕННО: Отключаем оптимизацию для диагностики проблемы с отображением
    // TODO: Вернуть оптимизацию после исправления проблемы
    console.log('🔄 Preparing avatar for upload...')
    const originalSizeKB = fileToUpload.size / 1024
    console.log(`  - Original size: ${originalSizeKB.toFixed(2)}KB`)
    
    // ВАЖНО: Используем оригинальный файл БЕЗ оптимизации для проверки
    // Если это работает, значит проблема в optimizeAvatar
    let fileToSend = fileToUpload
    
    // Если файл слишком большой (>500KB), все же применяем оптимизацию
    if (fileToUpload.size > 500 * 1024) {
      console.log('⚠️  File too large, applying optimization...')
      try {
        fileToSend = await optimizeAvatar(fileToUpload)
        const optimizedSizeKB = fileToSend.size / 1024
        console.log(`✅ Avatar optimized: ${optimizedSizeKB.toFixed(2)}KB (saved ${(originalSizeKB - optimizedSizeKB).toFixed(2)}KB)`)
      } catch (optError) {
        console.error('❌ Optimization failed, using original file:', optError)
        fileToSend = fileToUpload
      }
    } else {
      console.log(`✅ Using original file (${originalSizeKB.toFixed(2)}KB, no optimization needed)`)
    }
    
    console.log('✅ CSRF token fetched')
    
    // Загружаем файл в Strapi Media Library (возвращает ID файла)
    console.log('📤 Uploading avatar to Strapi...')
    avatarFileId = await Promise.race([
      uploadAvatarToAPI(fileToSend),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 120000) // 2 минуты таймаут
      )
    ])
    
    console.log('✅ Avatar uploaded, file ID:', avatarFileId, 'Type:', typeof avatarFileId)
    
    if (!avatarFileId) {
      throw new Error('No avatar file ID returned')
    }
    
    // Обновляем профиль с ID файла (Strapi свяжет файл с пользователем)
    console.log('📝 Updating profile with avatar file ID:', avatarFileId)
    const updatedUser = await Promise.race([
      updateProfile({ avatar: avatarFileId }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      )
    ])
    
    // Обновляем аватар и сбрасываем ошибку
    avatarError.value = false
    
    // ВАЖНО: используем avatar из ответа сервера (это URL после связывания файла)
    // Сервер возвращает полный URL аватара после обновления профиля
    const finalAvatarUrl = updatedUser.avatar
    
    // Логируем для отладки перед обновлением с детальными данными
    const sanitizedBefore = sanitizeAvatarUrl(finalAvatarUrl)
    console.log('✅ Avatar upload complete:')
    console.log('  - avatarFileId (from upload):', avatarFileId)
    console.log('  - avatarFileId type:', typeof avatarFileId)
    console.log('  - updatedUser.avatar (from server response):', updatedUser.avatar)
    console.log('  - updatedUser.avatar type:', typeof updatedUser.avatar)
    console.log('  - finalAvatarUrl (chosen):', finalAvatarUrl)
    console.log('  - finalAvatarUrl type:', typeof finalAvatarUrl)
    console.log('  - sanitized result:', sanitizedBefore)
    console.log('  - sanitized type:', typeof sanitizedBefore)
    console.log('  - currentAvatar.value (before update):', currentAvatar.value)
    
    if (!sanitizedBefore && finalAvatarUrl) {
      console.error('❌ Final avatar URL failed validation:', finalAvatarUrl)
    }
    
    // Обновляем локальное состояние с URL из ответа сервера
    // Добавляем cache-busting параметр чтобы избежать проблем с кэшированием
    if (finalAvatarUrl) {
      try {
        const urlObj = new URL(finalAvatarUrl)
        urlObj.searchParams.set('_t', Date.now().toString())
        currentAvatar.value = urlObj.toString()
        console.log('✅ Avatar URL updated with cache-busting:', currentAvatar.value)
      } catch (e) {
        // Если URL не валидный, используем как есть
        console.warn('⚠️ Could not parse avatar URL, using as-is:', finalAvatarUrl)
    currentAvatar.value = finalAvatarUrl
      }
    } else {
      console.warn('⚠️ No avatar URL in server response, keeping current avatar')
    }
    
    // Обновляем store - это обновит только компоненты, которые используют authStore.user
    // Данные статей/комментариев не должны меняться, т.к. они используют props.article.author.avatar
    authStore.setUser(updatedUser)
    
    // Принудительно обновляем через nextTick чтобы убедиться что Vue обновил DOM
    await nextTick()
    
    // Дополнительная проверка - если после nextTick значение не установилось, устанавливаем принудительно
    if (!currentAvatar.value || (!currentAvatar.value.includes(finalAvatarUrl) && finalAvatarUrl)) {
      console.log('⚠️ Forcing avatar update after nextTick')
      try {
        const urlObj = new URL(finalAvatarUrl)
        urlObj.searchParams.set('_t', Date.now().toString())
        currentAvatar.value = urlObj.toString()
      } catch (e) {
      currentAvatar.value = finalAvatarUrl
      }
    }
    
    // Логируем после обновления с детальной информацией
    await nextTick() // Еще один nextTick для полного обновления DOM
    const imgElement = document.querySelector('.avatar-image') as HTMLImageElement
    console.log('✅ Avatar state after update:')
    console.log('  - currentAvatar.value:', currentAvatar.value)
    console.log('  - currentAvatar.type:', typeof currentAvatar.value)
    console.log('  - safeAvatarUrl.value:', safeAvatarUrl.value)
    console.log('  - safeAvatarUrl.type:', typeof safeAvatarUrl.value)
    console.log('  - avatarError:', avatarError.value)
    console.log('  - DOM image element:', imgElement ? 'FOUND' : 'NOT FOUND')
    if (imgElement) {
      console.log('  - img.src:', imgElement.src)
      console.log('  - img.complete:', imgElement.complete)
      console.log('  - img.naturalWidth:', imgElement.naturalWidth)
      console.log('  - img.naturalHeight:', imgElement.naturalHeight)
    }
    
    // Финальная проверка - если safeAvatarUrl все еще null, но currentAvatar есть
    if (!safeAvatarUrl.value && currentAvatar.value) {
      console.error('❌ CRITICAL: Avatar exists but safeAvatarUrl is null!')
      console.error('  - currentAvatar:', currentAvatar.value)
      console.error('  - validationResult:', sanitizeAvatarUrl(currentAvatar.value))
    }
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Аватар успешно загружен',
      life: 3000
    })
    
    // Сбрасываем состояние загрузки перед закрытием модального окна
    uploading.value = false
    // Даем время для отображения тоста перед закрытием модального окна
    setTimeout(() => {
      closeUploadModal()
    }, 100)
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    
    let errorMsg = 'Не удалось загрузить аватар'
    
    if (error.message === 'Upload timeout') {
      errorMsg = 'Превышено время ожидания загрузки. Проверьте подключение к интернету и попробуйте снова.'
    } else if (error.message === 'Update timeout') {
      errorMsg = 'Загрузка завершена, но не удалось обновить профиль. Попробуйте обновить страницу.'
    } else if (error.response?.data?.detail) {
      errorMsg = error.response.data.detail
    } else if (error.message) {
      errorMsg = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMsg,
      life: 5000
    })
  } finally {
    // Убеждаемся что uploading всегда сбрасывается
    uploading.value = false
  }
}

// Delete Modal Functions
const openDeleteModal = () => {
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
}

const confirmDeleteAvatar = async () => {
  if (uploading.value || saving.value) return
  
  uploading.value = true
  try {
    // Удаляем аватар (передаем null)
    const updatedUser = await updateProfile({ avatar: null })
    
    currentAvatar.value = null
    authStore.setUser(updatedUser)
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Аватар удален',
      life: 3000
    })
    
    closeDeleteModal()
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    const errorMsg = error.response?.data?.detail || 'Не удалось удалить аватар'
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMsg,
      life: 4000
    })
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.settings-profile-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  min-height: 100vh;
  padding: 0 16px;
  padding-top: calc(var(--header-height, 80px) + 10px);
  box-sizing: border-box;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: calc(var(--header-height, 60px) + 10px) 12px 0 12px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: calc(var(--header-height, 70px) + 10px) 20px 0 20px;
  }
  
  /* Десктоп */
  @media (min-width: 1025px) {
    padding: calc(var(--header-height, 80px) + 10px) 24px 0 24px;
  }
}

.main-body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 48px;
  gap: 12px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}


// Content Styles
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.profile-section {
  background-color: var(--bg-secondary);
width: 980px;
height: 949px;
border-radius: 25px;
margin-bottom: 200px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
}

.section-title {
  margin-top: 40px;
  margin-left: 48px; 
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
  position: relative;
  z-index: 1;
  
  // Убираем любые псевдоэлементы которые могут перекрывать
  &::before,
  &::after {
    display: none;
    content: none;
  }
}

.section-subtitle {
  color: var(--text-secondary);
font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
margin-top: 4px;
margin-left: 48px;
width: 700px;
}

// Avatar Section
.avatar-section {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-left: 48px;
  margin-top: 16px;
  position: relative;
  z-index: 5;
  
  // Убираем любые псевдоэлементы
  &::before,
  &::after {
    display: none;
    content: none;
  }
}

.avatar-placeholder {
  background-color: var(--btn-primary);
  border-radius: 50%;
  width: 150px;
  height: 150px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  isolation: isolate;
  
  // Убираем любые псевдоэлементы которые могут перекрывать
  &::before,
  &::after {
    display: none;
    content: none;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  background-color: transparent;
  
  // Гарантируем что изображение всегда поверх фона
  will-change: opacity;
  
  // Убираем любые псевдоэлементы
  &::before,
  &::after {
    display: none;
    content: none;
  }
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background-color: var(--btn-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  
  // Убираем любые псевдоэлементы
  &::before,
  &::after {
    display: none;
    content: none;
  }
}

.avatar-icon {
  color: var(--text-secondary);
  opacity: 0.6;
}

.avatar-buttons {
  display: flex;
  flex-direction: column;
gap: 8px;
}

.avatar-button {
width: 230px;
height: 56px;
  background-color: rgba(67, 73, 86, 0);
border-radius: 15px;
  color: var(--text-primary);
font-size: 23px;
  font-family: var(--font-sans);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: var(--ui-hover-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:first-child {
margin-top: 16px;
  }
}

// Input Fields
.nickname-input {
width: 360px;
height: 65px;
  background-color: var(--btn-primary);
border-radius: 15px;
margin-left: 48px;
margin-top: 16px;
  font-weight: bold;
  padding: 0 16px;
  
  @include responsive-2k {
    padding: 0 22.4px;
  }
  
  @include responsive-4k {
    padding: 0 28.8px;
  }
font-size: 22px;
  color: var(--text-primary);
  border: none;
  font-family: var(--font-sans);

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
    border: 2px solid var(--primary-blue);
  }
  
  &.error {
    border: 2px solid #FF3B3B;
  }
}

.bio-input {
width: 520px;
height: 167px;
  background-color: var(--btn-primary);
border-radius: 15px;
margin-left: 48px;
margin-top: 16px;
  font-weight: bold;
padding: 16px;
font-size: 22px;
  color: var(--text-primary);
  border: none;
  font-family: var(--font-sans);
  resize: vertical;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
    border: 2px solid var(--primary-blue);
  }
  
  &.error {
    border: 2px solid #FF3B3B;
  }
}

.error-message {
  color: #FF3B3B;
font-size: 14px;
  font-family: var(--font-sans);
margin-top: 4px;
margin-left: 48px;
  margin-bottom: 0;
}

.character-count {
  color: var(--text-secondary);
font-size: 14px;
  font-family: var(--font-sans);
margin-top: 4px;
margin-left: 48px;
  margin-bottom: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-content {
  background-color: var(--bg-secondary);
border-radius: 30px;
width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: modalContentAppear 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both;
  
  &.cropper-modal {
    width: 700px;
    max-width: 90vw;
    max-height: 95vh; // Увеличиваем для cropper модального окна
  }
}

@keyframes modalContentAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; // Header всегда виден, не сжимается
}

.modal-title {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--btn-primary);
  }
}

.modal-body {
  padding: 40px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; // Важно для flex-контейнера
  
  &.cropper-body {
    padding: 20px 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-height: 0; // Важно для flex-контейнера
  }
}

.cropper-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100%;
}

.dropzone {
  border: 3px dashed var(--text-secondary);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: var(--btn-primary);
  animation: dropzoneAppear 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s both;
  
  &:hover {
    border-color: var(--primary-violet);
    background-color: rgba(139, 92, 246, 0.1);
    transform: translateY(-2px);
  }
  
  &.drag-over {
    border-color: var(--primary-violet);
    background-color: rgba(139, 92, 246, 0.2);
    transform: scale(1.02) translateY(-2px);
  }
}

@keyframes dropzoneAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.upload-icon {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.dropzone:hover .upload-icon {
  opacity: 1;
}

.dropzone-title {
  color: var(--text-primary);
  font-size: 24px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

.dropzone-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  margin: 0;
}

.dropzone-info {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  margin: 0;
  opacity: 0.8;
}

.preview-area {
  margin-top: 30px;
  padding: 20px;
  background-color: var(--btn-primary);
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  animation: previewAppear 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.4s both;
}

@keyframes previewAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--text-secondary);
}

.preview-info {
  flex: 1;
}

.file-name {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 5px 0;
}

.file-size {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  gap: 20px;
  animation: footerAppear 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; // Footer всегда виден, не сжимается
  margin-top: auto; // Прижимаем footer к низу
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
}

@keyframes footerAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 160px;
  justify-content: center;
  
  &.secondary {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    border: 2px solid var(--text-secondary);
    
    &:hover {
      background-color: var(--text-secondary);
      color: var(--bg-primary);
    }
  }
  
  &.primary {
    background-color: var(--primary-violet);
    color: white;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    
    &:hover:not(:disabled) {
      background-color: var(--primary-blue);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}

.button-icon {
  flex-shrink: 0;
}

.delete-modal {
  width: 500px;
  text-align: center;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.warning-title {
  color: var(--text-primary);
  font-size: 24px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 20px 0;
}

.warning-message {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  line-height: 1.5;
  margin: 0 0 30px 0;
}

.modal-button.danger {
  background-color: #FF6B6B;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #FF5252;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.unauthorized-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height, 80px));
  padding: 40px 20px;
}

.unauthorized-content-inline {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  
  h2 {
    color: var(--text-primary);
    font-size: 32px;
    font-family: var(--font-sans-serif);
    font-weight: 700;
    margin: 0 0 16px 0;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 16px;
    font-family: var(--font-sans-serif);
    margin: 0 0 24px 0;
  }
}

.btn-primary-inline {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--primary-violet);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-family: var(--font-sans-serif);
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-blue);
    transform: translateY(-2px);
  }
}
</style>