<template>
  <Transition name="toast">
    <div v-if="item" class="undo-toast">
      <div class="toast-content">
        <div class="toast-message">
          <span class="toast-text">{{ item.message }}</span>
        </div>
        <button @click="handleUndo" class="undo-button">Отменить</button>
      </div>
      
      <!-- Анимированный бордер-прогресс -->
      <svg 
        class="progress-border-svg" 
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          class="border-path"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference - (item.progress / 100 * circumference)"
          fill="none"
          stroke="#ef4444"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M 11.5,1.5 
             L 88.5,1.5 
             A 11,11 0 0,1 99.5,12.5 
             L 99.5,87.5 
             A 11,11 0 0,1 88.5,98.5 
             L 11.5,98.5 
             A 11,11 0 0,1 1.5,87.5 
             L 1.5,12.5 
             A 11,11 0 0,1 11.5,1.5 Z"
        />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UndoableDeleteItem } from '@/composables/useUndoableDeleteManager'

interface Props {
  item: UndoableDeleteItem
}

interface Emits {
  (e: 'undo', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Вычисляем длину периметра прямоугольника со скругленными углами
// Периметр = 2*(width + height) - 8*radius + 2*π*radius
const circumference = computed(() => {
  const width = 100
  const height = 100
  const radius = 11
  // Прямые части: верх, низ, лево, право (каждая сторона минус два радиуса)
  const straightParts = 2 * (width - 2 * radius) + 2 * (height - 2 * radius)
  // Угловые дуги: полный круг из 4 четвертей = 2πr
  const cornerArcs = 2 * Math.PI * radius
  return straightParts + cornerArcs
})

const handleUndo = () => {
  emit('undo', props.item.id)
}
</script>

<style scoped>
.undo-toast {
  position: relative;
  background-color: var(--bg-secondary);
  border: 3px solid var(--text-secondary);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  pointer-events: all;
  animation: slideIn 0.3s ease-out;
  overflow: visible;
}

.progress-border-svg {
  position: absolute;
  top: -3px;
  left: -3px;
  width: calc(100% + 6px);
  height: calc(100% + 6px);
  pointer-events: none;
  z-index: 2;
}

.border-path {
  transition: stroke-dashoffset 0.05s linear;
}

.toast-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toast-message {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-text {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans-serif);
  line-height: 1.4;
}

.undo-button {
  background-color: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: var(--font-sans-serif);
  position: relative;
  z-index: 2;
}

.undo-button:hover {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.undo-button:active {
  transform: translateY(0);
}

/* Анимации */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.25s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .undo-toast {
    min-width: auto;
    max-width: none;
    padding: 14px 18px;
  }

  .toast-content {
    gap: 12px;
  }

  .toast-message {
    gap: 8px;
  }

  .toast-text {
    font-size: 13px;
  }

  .undo-button {
    padding: 6px 14px;
    font-size: 12px;
  }
}
</style>

