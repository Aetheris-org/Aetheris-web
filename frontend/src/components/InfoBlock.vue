<template>
  <div class="info-block">
    <div class="info-block__header" v-if="title || subtitle">
      <h3 class="info-block__title" v-if="title">{{ title }}</h3>
      <p class="info-block__subtitle" v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="info-block__body">
      <slot>
        <p class="info-block__text" v-if="text">{{ text }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  text?: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.info-block__body{
  font-family: var(--font-sans);
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-primary);
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  width: 450px;
  height: 400px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 20px 24px;
  border: 1px solid rgba(255,255,255,0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
}

.info-block__title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
  font-weight: 700;
  font-size: 24px;
}

.info-block__subtitle {
  margin: 6px 0 0 0;
  color: var(--text-secondary);
  font-family: var(--font-sans-serif);
  font-size: 16px;
}

.info-block__text {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
  font-size: 16px;
  line-height: 1.6;
}
</style>



