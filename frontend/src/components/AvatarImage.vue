<template>
  <div class="avatar-container">
    <!-- Изображение загружается -->
    <img
      v-if="validSrc"
      ref="imageRef"
      :src="validSrc"
      :alt="alt || 'Avatar'"
      class="avatar-image"
      :class="{ 'image-hidden': showLoader }"
      @load="handleLoad"
      @error="handleError"
      crossorigin="anonymous"
      decoding="async"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
    
    <!-- Индикатор загрузки (только если есть валидный src и идет загрузка) -->
    <div v-if="showLoader" class="avatar-loader">
      <div class="spinner"></div>
    </div>
    
    <!-- Placeholder если нет src или ошибка (и не идет внешняя загрузка) -->
    <div v-else-if="!validSrc && !externalLoading" class="avatar-placeholder">
      <slot name="placeholder">
        <svg
          class="question-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 17H12.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

interface Props {
  src?: string | null
  alt?: string
  size?: number
  externalLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'Avatar',
  size: 40,
  externalLoading: false
})

const imageRef = ref<HTMLImageElement | null>(null)
const imageLoaded = ref(false)
const imageError = ref(false)

// Валидация и нормализация URL
const validSrc = computed(() => {
  if (!props.src || typeof props.src !== 'string') return null
  const trimmed = props.src.trim()
  if (trimmed === '') return null
  
  // ВАЖНО: Разрешаем относительные URL (например /uploads/...)
  // Strapi возвращает относительные URL, которые нужно конвертировать в абсолютные
  if (trimmed.startsWith('/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
    return `${baseURL}${trimmed}`
  }
  
  // Проверяем что это валидный абсолютный URL
  try {
    const url = new URL(trimmed)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return trimmed
    }
  } catch {
    // Не валидный URL
  }
  return null
})

// Показываем loader только если:
// 1. Есть валидный src
// 2. И (внешняя загрузка ИЛИ изображение еще не загружено и нет ошибки)
const showLoader = computed(() => {
  if (!validSrc.value) return false
  if (props.externalLoading) return true
  if (imageError.value) return false
  return !imageLoaded.value
})

const handleLoad = (event?: Event) => {
  const img = event?.target as HTMLImageElement || imageRef.value
  if (img) {
    // Проверяем что изображение не пустое (0x0)
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.error('❌ [AvatarImage] Image loaded but is empty (0x0):', {
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })
      
      // Пробуем перезагрузить с cache-busting параметром
      if (validSrc.value) {
        try {
          const url = new URL(img.src)
          url.searchParams.set('_t', Date.now().toString())
          img.src = url.toString()
          return // Не устанавливаем loaded/error, ждем результат перезагрузки
        } catch (e) {
          // Если не удалось создать URL, считаем это ошибкой
          handleError(event)
          return
        }
      } else {
        handleError(event)
        return
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ [AvatarImage] Image loaded successfully:', {
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })
    }
    
  imageLoaded.value = true
  imageError.value = false
}
}

const handleError = (event?: Event) => {
  const img = event?.target as HTMLImageElement || imageRef.value
  const expectedUrl = validSrc.value
  
  if (img && expectedUrl) {
    // Проверяем что ошибка для правильного URL (не для старого кэшированного)
    if (img.src !== expectedUrl) {
      console.warn('⚠️ [AvatarImage] Error for different URL, ignoring:', {
        imgSrc: img.src,
        expectedUrl: expectedUrl
      })
      return
    }
    
    // Проверяем что изображение действительно не загрузилось (не просто 0x0 из кэша)
    if (img.complete && img.naturalWidth === 0 && img.naturalHeight === 0) {
      console.error('❌ [AvatarImage] Image failed to load (0x0):', {
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })
    } else {
      console.error('❌ [AvatarImage] Image failed to load:', {
        src: img.src,
        complete: img.complete
      })
    }
  }
  
  imageLoaded.value = false
  imageError.value = true
}

// Проверяем загружено ли изображение из кэша браузера
const checkCachedImage = () => {
  if (!imageRef.value || !validSrc.value) {
    return
  }
  
  const img = imageRef.value
  
  // Если изображение уже загружено (из кэша)
  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    handleLoad()
    return
  }
  
  // Если изображение завершило загрузку, но размеры 0x0 = пустое изображение
  if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
    // Пробуем перезагрузить с cache-busting
    if (validSrc.value) {
      try {
        const url = new URL(img.src)
        url.searchParams.set('_t', Date.now().toString())
        img.src = url.toString()
        return // Не вызываем handleError, ждем результат перезагрузки
      } catch (e) {
        // Если не удалось создать URL, считаем это ошибкой
        handleError()
        return
      }
    } else {
    handleError()
    return
    }
  }
}

// Сбрасываем состояние при изменении src
watch(() => props.src, () => {
  imageLoaded.value = false
  imageError.value = false
  
  if (validSrc.value) {
    // Даем время элементу обновиться
    nextTick(() => {
      checkCachedImage()
    })
  }
}, { immediate: true })

onMounted(() => {
  if (validSrc.value) {
    nextTick(() => {
      checkCachedImage()
    })
  }
})
</script>

<style scoped lang="scss">
.avatar-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--btn-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: opacity 0.15s ease;
}

.avatar-image.image-hidden {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.avatar-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--btn-primary);
  z-index: 1;
}

.spinner {
  width: 50%;
  height: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--btn-primary);
  color: var(--text-primary);
}

.question-icon {
  color: var(--text-primary);
  transition: all 0.2s ease-in-out;
}

.avatar-container:hover .question-icon {
  color: #FFFFFF;
  transform: scale(1.1);
}
</style>
