<template>
  <div class="undo-toasts-container">
    <UndoToast
      v-for="item in items"
      :key="item.id"
      :item="item"
      @undo="handleUndo"
    />
  </div>
</template>

<script setup lang="ts">
import { useUndoableDeleteManager } from '@/composables/useUndoableDeleteManager'
import UndoToast from './UndoToast.vue'

const { items, cancelDelete } = useUndoableDeleteManager()

const handleUndo = async (id: string) => {
  await cancelDelete(id)
}
</script>

<style scoped>
.undo-toasts-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .undo-toasts-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
    align-items: stretch;
  }
}
</style>

