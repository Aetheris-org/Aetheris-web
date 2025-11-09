<template>
  <div class="avatar-cropper">
    <div 
      class="cropper-container" 
      ref="containerRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <canvas ref="canvasRef" class="cropper-canvas"></canvas>
      <div class="cropper-overlay">
        <div class="crop-box" :style="cropBoxStyle" @mousedown.stop.prevent="startCropDrag">
          <span class="handle handle-nw" @mousedown.stop.prevent="startResize('nw')"></span>
          <span class="handle handle-ne" @mousedown.stop.prevent="startResize('ne')"></span>
          <span class="handle handle-sw" @mousedown.stop.prevent="startResize('sw')"></span>
          <span class="handle handle-se" @mousedown.stop.prevent="startResize('se')"></span>
        </div>
      </div>
    </div>
    
    <div class="cropper-controls">
      <div class="control-group">
        <label class="control-label">
          {{ $t('cropper.scale') }}
          <span class="hint-text">{{ $t('cropper.scaleHint') }}</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="8"
          step="0.1"
          v-model.number="scale"
          @input="updateCanvas"
          class="zoom-slider"
        />
        <span class="zoom-value">{{ Math.round(scale * 100) }}%</span>
      </div>
      
      <div class="control-group">
        <label class="control-label">
          {{ $t('cropper.control') }}
          <span class="hint-text">{{ $t('cropper.controlHint') }}</span>
        </label>
      </div>
      
      <div class="control-group">
        <button @click="resetTransform" class="control-btn secondary">{{ $t('cropper.reset') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  imageUrl: string
  shape?: 'circle' | 'square'
  outputSize?: number
  outputType?: 'image/webp' | 'image/jpeg'
  maxBytes?: number
  maintainAspect?: boolean // true: квадрат (аватар), false: свободная форма (статья)
}>()

const emit = defineEmits<{
  (e: 'crop', file: File): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

// Drag states
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

// Touch/Pinch zoom states
const touchStartDistance = ref(0)
const touchStartScale = ref(1)
const isPinching = ref(false)

const containerWidth = 1000 // широкий вьюпорт
const containerHeight = 560 // ниже по высоте
const initialCropSize = 480 // стартовая область
const finalAvatarSize = 120 // Для аватаров по умолчанию

const minCropSize = 60
const cropBoxWidth = ref(initialCropSize)
const cropBoxHeight = ref(initialCropSize)
const cropBoxX = ref((containerWidth - initialCropSize) / 2)
const cropBoxY = ref((containerHeight - initialCropSize) / 2)

const cropBoxStyle = computed(() => {
  const isCircle = (props.shape ?? 'circle') === 'circle'
  return {
    width: `${cropBoxWidth.value}px`,
    height: `${cropBoxHeight.value}px`,
    left: `${cropBoxX.value}px`,
    top: `${cropBoxY.value}px`,
    border: '3px dashed #ffffff',
    borderRadius: isCircle ? '50%' : '8px',
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    boxSizing: 'border-box' as const,
  }
})

let image: HTMLImageElement | null = null
const imageBounds = { x: 0, y: 0, w: 0, h: 0 }

const loadImage = () => {
  if (!canvasRef.value) return
  
  image = new Image()
  image.crossOrigin = 'anonymous'
  
  image.onload = () => {
    updateCanvas()
    // Центрируем и подгоняем кроп-бокс по изображению
    const size = Math.min(initialCropSize, imageBounds.w, imageBounds.h)
    const finalSize = Math.max(minCropSize, size)
    // Для квадратного/круглого кропа используем одинаковые размеры
    cropBoxWidth.value = finalSize
    cropBoxHeight.value = finalSize
    cropBoxX.value = imageBounds.x + (imageBounds.w - finalSize) / 2
    cropBoxY.value = imageBounds.y + (imageBounds.h - finalSize) / 2
  }
  
  image.onerror = () => {
    console.error('Failed to load image')
  }
  
  image.src = props.imageUrl
}

const updateCanvas = () => {
  if (!canvasRef.value || !image) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = containerWidth
  canvas.height = containerHeight
  
  // Очищаем canvas
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Вычисляем размеры изображения с учетом масштаба
  const scaledWidth = image.width * scale.value
  const scaledHeight = image.height * scale.value
  
  // Вычисляем позицию (центрируем + смещение)
  const centerX = (containerWidth - scaledWidth) / 2 + offsetX.value
  const centerY = (containerHeight - scaledHeight) / 2 + offsetY.value
  
  // Сохраняем границы изображения для ограничений кроп-бокса
  imageBounds.x = centerX
  imageBounds.y = centerY
  imageBounds.w = scaledWidth
  imageBounds.h = scaledHeight
  
  // Рисуем изображение
  ctx.drawImage(image, centerX, centerY, scaledWidth, scaledHeight)
}

type Corner = 'nw' | 'ne' | 'sw' | 'se'
const isResizing = ref<false | Corner>(false)
const resizeStart = { x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 }
let lastMouseX = 0
let lastMouseY = 0

const startResize = (corner: Corner) => {
  isResizing.value = corner
  resizeStart.x = lastMouseX
  resizeStart.y = lastMouseY
  resizeStart.boxX = cropBoxX.value
  resizeStart.boxY = cropBoxY.value
  resizeStart.boxW = cropBoxWidth.value
  resizeStart.boxH = cropBoxHeight.value
}

// Drag entire crop box
const isDraggingCrop = ref(false)
const cropDragStart = { x: 0, y: 0, boxX: 0, boxY: 0 }
const startCropDrag = (e: MouseEvent) => {
  isDraggingCrop.value = true
  cropDragStart.x = e.clientX
  cropDragStart.y = e.clientY
  cropDragStart.boxX = cropBoxX.value
  cropDragStart.boxY = cropBoxY.value
}

const handleMouseDown = (e: MouseEvent) => {
  if (!containerRef.value) return
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartOffsetX.value = offsetX.value
  dragStartOffsetY.value = offsetY.value
  containerRef.value.style.cursor = 'grabbing'
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const handleMouseMove = (e: MouseEvent) => {
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  if (isDraggingCrop.value) {
    const dx = e.clientX - cropDragStart.x
    const dy = e.clientY - cropDragStart.y
    let newX = cropDragStart.boxX + dx
    let newY = cropDragStart.boxY + dy
    newX = Math.max(imageBounds.x, Math.min(newX, imageBounds.x + imageBounds.w - cropBoxWidth.value))
    newY = Math.max(imageBounds.y, Math.min(newY, imageBounds.y + imageBounds.h - cropBoxHeight.value))
    cropBoxX.value = newX
    cropBoxY.value = newY
    return
  }
  if (isResizing.value) {
    const dx = e.clientX - resizeStart.x
    const dy = e.clientY - resizeStart.y
    let newW = resizeStart.boxW
    let newH = resizeStart.boxH
    let newX = resizeStart.boxX
    let newY = resizeStart.boxY
    const keepSquare = props.maintainAspect ?? ((props.shape ?? 'circle') === 'circle')
    switch (isResizing.value) {
      case 'se':
        newW = resizeStart.boxW + dx
        newH = keepSquare ? newW : (resizeStart.boxH + dy)
        break
      case 'ne':
        newW = resizeStart.boxW + dx
        newH = keepSquare ? newW : (resizeStart.boxH - dy)
        newY = resizeStart.boxY + resizeStart.boxH - newH
        break
      case 'sw':
        newW = resizeStart.boxW - dx
        newH = keepSquare ? newW : (resizeStart.boxH + dy)
        newX = resizeStart.boxX + resizeStart.boxW - newW
        break
      case 'nw':
        newW = resizeStart.boxW - dx
        newH = keepSquare ? newW : (resizeStart.boxH - dy)
        newX = resizeStart.boxX + resizeStart.boxW - newW
        newY = resizeStart.boxY + resizeStart.boxH - newH
        break
    }
    // Ограничения минимум/границы изображения
    newW = Math.max(minCropSize, newW)
    newH = Math.max(minCropSize, newH)
    // Правые/нижние границы
    if (newX + newW > imageBounds.x + imageBounds.w) newW = imageBounds.x + imageBounds.w - newX
    if (newY + newH > imageBounds.y + imageBounds.h) newH = imageBounds.y + imageBounds.h - newY
    // Левые/верхние границы
    if (newX < imageBounds.x) { newW -= (imageBounds.x - newX); newX = imageBounds.x }
    if (newY < imageBounds.y) { newH -= (imageBounds.y - newY); newY = imageBounds.y }

    if (keepSquare) {
      const s = Math.min(newW, newH)
      // корректируем по наименьшей стороне
      if (isResizing.value === 'ne' || isResizing.value === 'nw') newY = newY + (newH - s)
      if (isResizing.value === 'sw' || isResizing.value === 'nw') newX = newX + (newW - s)
      newW = s; newH = s
    }
    cropBoxWidth.value = newW
    cropBoxHeight.value = newH
    cropBoxX.value = newX
    cropBoxY.value = newY
    return
  }
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  offsetX.value = dragStartOffsetX.value + dx
  offsetY.value = dragStartOffsetY.value + dy
  updateCanvas()
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
    }
  }
  isResizing.value = false
  isDraggingCrop.value = false
}

// Wheel zoom
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.5, Math.min(8, scale.value + delta))
  
  if (newScale !== scale.value) {
    scale.value = newScale
    updateCanvas()
  }
}

// Touch/Pinch zoom
const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    isPinching.value = true
    touchStartDistance.value = getTouchDistance(e.touches[0], e.touches[1])
    touchStartScale.value = scale.value
    e.preventDefault()
  } else if (e.touches.length === 1) {
    isDragging.value = true
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
    dragStartOffsetX.value = offsetX.value
    dragStartOffsetY.value = offsetY.value
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grabbing'
    }
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (isPinching.value && e.touches.length === 2) {
    const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
    const ratio = currentDistance / touchStartDistance.value
    const newScale = Math.max(0.5, Math.min(8, touchStartScale.value * ratio))
    scale.value = newScale
    updateCanvas()
    e.preventDefault()
  } else if (isDragging.value && e.touches.length === 1) {
    const dx = e.touches[0].clientX - dragStartX.value
    const dy = e.touches[0].clientY - dragStartY.value
    offsetX.value = dragStartOffsetX.value + dx
    offsetY.value = dragStartOffsetY.value + dy
    updateCanvas()
    e.preventDefault()
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (e.touches.length === 0) {
    isPinching.value = false
    isDragging.value = false
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
    }
  } else if (e.touches.length === 1) {
    isPinching.value = false
    isDragging.value = true
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
    dragStartOffsetX.value = offsetX.value
    dragStartOffsetY.value = offsetY.value
  }
}

const resetTransform = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  updateCanvas()
}

const selectFull = () => {
  // Выбрать максимально возможный квадрат внутри изображения, центрированно
  const keepSquare = props.maintainAspect ?? ((props.shape ?? 'circle') === 'circle')
  if (keepSquare) {
    const size = Math.max(minCropSize, Math.min(imageBounds.w, imageBounds.h))
    cropBoxWidth.value = size
    cropBoxHeight.value = size
    cropBoxX.value = imageBounds.x + (imageBounds.w - size) / 2
    cropBoxY.value = imageBounds.y + (imageBounds.h - size) / 2
  } else {
    cropBoxWidth.value = Math.max(minCropSize, imageBounds.w)
    cropBoxHeight.value = Math.max(minCropSize, imageBounds.h)
    cropBoxX.value = imageBounds.x
    cropBoxY.value = imageBounds.y
  }
}

const getCroppedImage = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!canvasRef.value || !image) {
      reject(new Error('Canvas or image not available'))
      return
    }
    
    // Создаем canvas для первичной вырезки
    const cropCanvas = document.createElement('canvas')
    const cropW = cropBoxWidth.value
    const cropH = cropBoxHeight.value
    cropCanvas.width = cropW
    cropCanvas.height = cropH
    const cropCtx = cropCanvas.getContext('2d')
    
    if (!cropCtx) {
      reject(new Error('Failed to get context'))
      return
    }
    
    // Вычисляем область для обрезки (центр контейнера, круг)
    const cropX = cropBoxX.value
    const cropY = cropBoxY.value
    
    // Если круг — клиппируем, иначе — квадрат
    const isCircle = (props.shape ?? 'circle') === 'circle'
    cropCtx.save()
    if (isCircle) {
      cropCtx.beginPath()
      const r = Math.min(cropW, cropH) / 2
      cropCtx.arc(cropW / 2, cropH / 2, r, 0, 2 * Math.PI)
      cropCtx.clip()
    }
    
    // Копируем квадратную область из исходного canvas в crop canvas
    cropCtx.drawImage(canvasRef.value, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
    
    cropCtx.restore()
    
    // Теперь создаем финальный canvas требуемого размера/типа
    const finalCanvas = document.createElement('canvas')
    const keepSquare = props.maintainAspect ?? ((props.shape ?? 'circle') === 'circle')
    let targetW: number
    let targetH: number
    if (keepSquare) {
      const size = typeof props.outputSize === 'number' ? props.outputSize : Math.min(1024, Math.max(cropW, cropH))
      targetW = size
      targetH = size
    } else {
      const maxDim = typeof props.outputSize === 'number' ? props.outputSize : Math.min(1024, Math.max(cropW, cropH))
      const scale = maxDim / Math.max(cropW, cropH)
      targetW = Math.max(1, Math.round(cropW * scale))
      targetH = Math.max(1, Math.round(cropH * scale))
    }
    finalCanvas.width = targetW
    finalCanvas.height = targetH
    const finalCtx = finalCanvas.getContext('2d')
    
    if (!finalCtx) {
      reject(new Error('Failed to get final context'))
      return
    }
    
    // Если круг — клиппируем, иначе оставляем квадрат
    finalCtx.save()
    if ((props.shape ?? 'circle') === 'circle') {
      finalCtx.beginPath()
      const r2 = Math.min(finalCanvas.width, finalCanvas.height) / 2
      finalCtx.arc(finalCanvas.width / 2, finalCanvas.height / 2, r2, 0, 2 * Math.PI)
      finalCtx.clip()
    }
    
    // Рисуем обрезанное изображение с уменьшенным/увеличенным размером
    finalCtx.drawImage(cropCanvas, 0, 0, targetW, targetH)
    finalCtx.restore()
    
    // Итеративная компрессия под целевой размер
    const mime = props.outputType ?? 'image/jpeg'
    const targetBytes = props.maxBytes ?? ((props.shape ?? 'circle') === 'circle' ? 10 * 1024 : 500 * 1024)
    const startQuality = (props.shape ?? 'circle') === 'circle' ? 0.65 : 0.92

    const compressToTargetSize = (quality: number): void => {
      finalCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        if (blob.size > targetBytes && quality > 0.5) {
          compressToTargetSize(quality - 0.1)
        } else {
          const name = (props.shape ?? 'circle') === 'circle' ? 'avatar' : 'preview'
          const file = new File([blob], `${name}.${mime === 'image/webp' ? 'webp' : 'jpg'}`, { type: mime })
          resolve(file)
        }
      }, mime, quality)
    }
    compressToTargetSize(startQuality)
  })
}

const handleCrop = async () => {
  try {
    const file = await getCroppedImage()
    emit('crop', file)
  } catch (error) {
    console.error('Crop error:', error)
  }
}

watch(() => props.imageUrl, () => {
  if (props.imageUrl) {
    loadImage()
  }
})

onMounted(() => {
  if (props.imageUrl) {
    loadImage()
  }
})

defineExpose({
  crop: handleCrop,
  getCroppedImage,
  selectFull
})
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.avatar-cropper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cropper-container {
  position: relative;
  width: 1000px;
  height: 560px;
  background-color: var(--bg-secondary);
  border-radius: 15px;
  overflow: hidden;
  margin: 0 auto;
  cursor: grab;
  user-select: none;
  
  &:active {
    cursor: grabbing;
  }
}


.cropper-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.cropper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 3px dashed var(--primary-violet);
  border-radius: 50%;
  pointer-events: none;
  box-sizing: border-box;
}

.handle {
  position: absolute;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  border: 2px solid rgba(0,0,0,0.25);
}
.handle-nw { left: -14px; top: -14px; cursor: nwse-resize; }
.handle-ne { right: -14px; top: -14px; cursor: nesw-resize; }
.handle-sw { left: -14px; bottom: -14px; cursor: nesw-resize; }
.handle-se { right: -14px; bottom: -14px; cursor: nwse-resize; }

.cropper-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: var(--bg-secondary);
  border-radius: 15px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-label {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-text {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  opacity: 0.7;
  font-style: italic;
}

.zoom-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--btn-primary);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-violet);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
    }
  }
  
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-violet);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
    }
  }
}

.zoom-value {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  text-align: center;
}

.control-btn {
  padding: 16px 32px;
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  
  &:hover {
    background-color: var(--primary-violet);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &.secondary {
    background-color: transparent;
    border: 2px solid var(--text-secondary);
    
    &:hover {
      background-color: var(--text-secondary);
      color: var(--bg-primary);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
  }
}

@media (max-width: 768px) {
  .cropper-container {
    width: 100%;
    max-width: 400px;
    height: 400px;
  }
}
</style>

