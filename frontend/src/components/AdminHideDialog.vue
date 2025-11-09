<template>
  <div class="overlay" @click.self="onCancel">
    <div class="dialog">
      <h3 class="title">Confirm hiding</h3>
      <p class="subtitle">Are you sure you want to hide this item?</p>
      <div class="actions">
        <button class="btn danger" @click="handleConfirm">Hide</button>
        <button class="btn subtle" @click="onCancel">Cancel</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog {
  background: var(--bg-secondary);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  width: min(672px, 92vw);
  padding: 24px;
  font-family: var(--font-sans);
}
.title { margin: 0 0 6px 0; font-size: 24px; }
.subtitle { margin: 0 0 20px 0; opacity: 0.8; }
.actions { display: flex; gap: 14px; justify-content: flex-end; }
.btn { padding: 12px 20px; border-radius: 12px; border: 1px solid var(--text-secondary); background: transparent; color: var(--text-primary); font-weight: 700; cursor: pointer; font-size: 16px; transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, transform .15s ease; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
.btn:active { transform: translateY(0) scale(0.98); box-shadow: 0 3px 10px rgba(0,0,0,0.16); }
.btn:focus-visible { outline: 2px solid var(--btn-primary); outline-offset: 2px; }
.btn.danger { border-color: #ef4444; color: #ef4444; }
.btn.subtle { background: rgba(255,255,255,0.04); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
