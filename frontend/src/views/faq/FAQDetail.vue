<template>
  <div class="faq-detail-container">
    <h2 class="page-title">Frequently Asked Questions</h2>
    <div class="content-wrapper">
      <FAQSidebar />
      <div class="detail">
        <button class="back-button" @click="goBack" aria-label="Go back">
          <span class="back-icon">←</span>
          <span>Back</span>
        </button>
        <h2 class="detail-title">{{ item?.title }}</h2>
        <p class="detail-subtitle" v-if="item?.subtitle">{{ item?.subtitle }}</p>

        <!-- Mixed content rendering (text + images) -->
        <div v-if="item?.blocks?.length" class="detail-content">
          <template v-for="(b, i) in item!.blocks" :key="i">
            <p v-if="b.type === 'text'" class="detail-paragraph">{{ (b as any).value }}</p>
            <img v-else-if="b.type === 'image'" :src="(b as any).src" :alt="(b as any).alt || 'image'" class="detail-inline-image" />
          </template>
        </div>

        <!-- Legacy content fields as fallback -->
        <div v-else class="detail-content">{{ item?.content }}</div>
        <div v-if="!item?.blocks?.length && item?.images?.length" class="detail-images">
          <img v-for="(src, i) in item?.images" :key="i" :src="src" class="detail-image" alt="faq image" />
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { getFaqItemById } from './items'
import FAQSidebar from '@/components/FAQSidebar.vue'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string
const item = getFaqItemById(id)

function goBack() {
  router.push('/faq')
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.faq-detail-container {
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

.detail {
  width: 990px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  margin-left: 12px;
  margin-top: 56px;
  padding: 24px;
  box-sizing: border-box;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text-primary);
  padding: 10px 17px; /* ~20% больше */
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background-color .15s ease, border-color .15s ease, transform .08s ease;
  font-size: 1.2rem; /* ~20% больше стандартного */
}

.back-button:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.2);
}

.back-button:active {
  transform: translateY(1px);
}

.back-icon {
  font-size: 22px; /* ~20% больше */
  line-height: 1;
}

.detail-title {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
  font-weight: 700;
  font-size: 24px;
}

.detail-subtitle {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-family: var(--font-sans-serif);
  font-size: 16px;
}

.detail-content {
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
  font-size: 16px;
  line-height: 1.6;
}

.detail-paragraph {
  margin: 0 0 12px 0;
}

.detail-inline-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  margin: 8px 0 16px 0;
}

.detail-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.detail-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
</style>


