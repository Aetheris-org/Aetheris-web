<template>
  <Transition name="preloader">
    <div v-if="isVisible" class="preloader-overlay">
      <div class="preloader-container">
        <!-- Название сообщества -->
        <div class="preloader-brand">
          <div class="brand-text">Aetheris</div>
        </div>
        
        <!-- Полосочка загрузки -->
        <div class="loader-bar">
          <div class="loader-progress"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isVisible = ref(true)

const hide = () => {
  isVisible.value = false
}

defineExpose({
  hide
})
</script>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.preloader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.preloader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.preloader-brand {
  .brand-text {
    font-family: var(--font-heading);
    font-size: 3rem;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin-bottom: 2rem;
  }
}

.loader-bar {
  width: 200px;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.loader-progress {
  height: 100%;
  width: 30%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
  border-radius: 2px;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(300%);
  }
  100% {
    transform: translateX(-100%);
  }
}

// Плавное исчезновение прелоадера
.preloader-leave-active {
  transition: opacity 0.6s ease-out, visibility 0.6s ease-out;
  pointer-events: none;
}

.preloader-leave-to {
  opacity: 0;
  visibility: hidden;
}

.preloader-enter-active {
  transition: opacity 0.3s ease-in;
}

.preloader-enter-from {
  opacity: 0;
}

.preloader-enter-to {
  opacity: 1;
}

// Мобильные устройства
@media (max-width: 768px) {
  .preloader-brand .brand-text {
    font-size: 2rem;
  }
  
  .loader-bar {
    width: 160px;
  }
}
</style>

