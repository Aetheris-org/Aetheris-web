<template>
  <div class="faq-container">
    <!-- Body -->
    <h2 class="page-title">Frequently Asked Questions</h2>
    <div class="content-wrapper">
      <!-- Sidebar -->
      <FAQSidebar />
      
      <!-- Tiles -->
      <div class="tiles">
        <InfoBlock
          v-for="it in items"
          :key="it.id"
          :title="it.title"
          :subtitle="it.subtitle"
          class="tile"
          @click="openItem(it.id)"
        >
          <p>{{ it.content }}</p>
        </InfoBlock>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import InfoBlock from '@/components/InfoBlock.vue'
import FAQSidebar from '@/components/FAQSidebar.vue'
import { faqItems as items } from './faq/items'

const router = useRouter()
function openItem(id: string) {
  router.push({ name: 'FAQDetail', params: { id } })
}
</script>

<style scoped lang="scss">
// Import responsive mixins
@import '@/assets/main.scss';

.faq-container {
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

.tiles {
  display: flex;
  justify-content: center;
  flex-direction: row;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 1100px;
  margin-left: 12px;
  margin-top: 56px;
  box-sizing: border-box;

  /* Не выходим за пределы app-wrapper: контейнер уже ограничен max-width,
     поэтому плитки занимают доступную ширину и сжимаются при нехватке места */

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    margin-left: 0;
  }
}

.tile {
  cursor: pointer;
}
</style>