<template>
  <div>
    <h1 class="development-text">{{ $t('common.in_development') }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.development-text {
  color: var(--text-secondary);
  font-size: 30px;
  font-family: var(--font-sans);
  margin-top: 350px;
  margin-bottom: 650px;
  text-align: center;
  font-weight: bold;
}
</style>

