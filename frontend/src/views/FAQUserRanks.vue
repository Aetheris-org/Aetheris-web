<template>
  <div class="faq-user-ranks-container">
    <!-- Body -->
    <h2 class="page-title">{{ pageTitle }}</h2>
    <div class="content-wrapper">
      <!-- Sidebar -->
      <FAQSidebar />
      
      <!-- Content -->
      <div class="content">
        <h1 class="development-text">{{ $t('common.in_development') }}</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FAQSidebar from '@/components/FAQSidebar.vue'

const pageTitle = 'User ranks'
</script>

<style scoped lang="scss">
// Import responsive mixins
@import '@/assets/main.scss';

.faq-user-ranks-container {
  width: 100%; max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
  background-color: var(--bg-primary);
  padding-top: calc(var(--header-height, 80px) + 60px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans-serif);
  font-weight: bold;
  margin-top: 20px;
  text-align: center;


}

.content-wrapper {
  display: flex;
  flex-direction: row;
}

/* Sidebar styles moved to reusable component */

.content {
  width: 990px;
  background-color: transparent;
  border-radius: 20px;
  margin-left: 12px;
  margin-top: 56px;
}

.development-text {
  color: var(--text-secondary);
  font-size: 30px;
  font-family: var(--font-sans);
  margin: 80px 0;
  text-align: center;
  font-weight: bold;
}
</style>