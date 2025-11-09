<template>
  <div class="admin-section">
    <div class="section-header">
      <h2>Reported articles</h2>
      <span class="badge" v-if="items.length">{{ items.length }}</span>
      
      <!-- View Mode Switcher -->
      <div class="view-mode-switcher">
        <button 
          class="view-mode-btn" 
          :class="{ active: viewMode === 'default' }"
          @click="setViewMode('default')"
          :title="$t('header.additional.title4')"
        >
          <svg class="view-mode-icon" width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.375 13.5669V22.6025C23.375 23.2872 23.1204 23.9439 22.6672 24.428C22.214 24.9121 21.5993 25.1841 20.9583 25.1841H4.04167C3.40073 25.1841 2.78604 24.9121 2.33283 24.428C1.87961 23.9439 1.625 23.2872 1.625 22.6025V13.5669M23.375 13.5669V4.53131C23.375 3.84663 23.1204 3.18999 22.6672 2.70584C22.214 2.2217 21.5993 1.94971 20.9583 1.94971H4.04167C3.40073 1.94971 2.78604 2.2217 2.33283 2.70584C1.87961 3.18999 1.625 3.84663 1.625 4.53131V13.5669M23.375 13.5669H1.625" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          class="view-mode-btn" 
          :class="{ active: viewMode === 'line' }"
          @click="setViewMode('line')"
          :title="$t('header.additional.title2')"
        >
          <svg class="view-mode-icon" width="25" height="18" viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.625 8.83026H23.375M1.625 1.08545H23.375M1.625 16.5751H23.375" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          class="view-mode-btn" 
          :class="{ active: viewMode === 'square' }"
          @click="setViewMode('square')"
          :title="$t('header.additional.title3')"
        >
          <svg class="view-mode-icon" width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0833 3.87256H3.625V12.9082H12.0833V3.87256Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M25.375 3.87256H16.9167V12.9082H25.375V3.87256Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M25.375 18.0714H16.9167V27.107H25.375V18.0714Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.0833 18.0714H3.625V27.107H12.0833V18.0714Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!items.length" class="empty">No reports</div>
    <div 
      v-else 
      :class="{
        'articles-list-vertical': viewMode === 'default' || viewMode === 'line',
        'articles-grid': viewMode === 'square',
      }"
    >
      <div class="article-wrapper" v-for="item in items" :key="item.id">
        <template v-if="viewMode === 'default'">
          <ArticleCard 
            :article="toArticle(item)" 
            @article-click="navigateToArticle(item.id)" 
            class="admin-article-card"
            style="cursor: pointer;" 
          />
        </template>
        <template v-else-if="viewMode === 'line'">
          <ArticleCardLine 
            :article="toArticle(item)" 
            @article-click="navigateToArticle(item.id)" 
            class="admin-article-card"
            style="cursor: pointer;" 
          />
        </template>
        <template v-else>
          <ArticleCardSquare 
            :article="toArticle(item)" 
            @article-click="navigateToArticle(item.id)" 
            class="admin-article-card"
            style="cursor: pointer;" 
          />
        </template>
        <div class="reason">
          <div class="reason-label">Reason:</div>
          <div class="reason-text">{{ item.reportReason }}</div>
          <div class="actions">
            <button class="btn" @click="openHide(item)">Hide</button>
            <button class="btn danger" @click="openDelete(item)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <AdminDeleteDialog v-if="showDelete" v-model="showDelete" @confirm="confirmDelete" @cancel="cancelDelete" />
    <AdminHideDialog v-if="showHide" v-model="showHide" @confirm="confirmHide" @cancel="cancelHide" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { fetchReportedArticles } from '@/api/articles'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleCardLine from '@/components/ArticleCardLine.vue'
import ArticleCardSquare from '@/components/ArticleCardSquare.vue'
import AdminDeleteDialog from '@/components/AdminDeleteDialog.vue'
import AdminHideDialog from '@/components/AdminHideDialog.vue'
import { useViewModeStore } from '@/stores/viewMode'
import type { Article } from '@/types/article'

interface ReportedArticleItem {
  id: number
  title: string
  reportReason: string
}

const items = ref<ReportedArticleItem[]>([])
const loading = ref<boolean>(true)
const showDelete = ref<boolean>(false)
const pendingDeleteId = ref<number | null>(null)
const showHide = ref<boolean>(false)
const pendingHideId = ref<number | null>(null)

// View mode store
const viewModeStore = useViewModeStore()
const viewMode = computed(() => viewModeStore.mode)

function setViewMode(mode: 'default' | 'line' | 'square') {
  viewModeStore.setMode(mode)
}

onMounted(async () => {
  try {
    const data = await fetchReportedArticles()
    items.value = data
  } finally {
    loading.value = false
  }
})

function toArticle(item: ReportedArticleItem): Article {
  return {
    id: item.id,
    title: item.title,
    content: '',
    excerpt: item.title,
    author: { id: 0, username: 'Reported' },
    tags: [],
    createdAt: new Date().toISOString(),
    status: 'published',
    likes: 0,
    dislikes: 0,
    commentsCount: 0,
  }
}

function openDelete(item: ReportedArticleItem) {
  pendingDeleteId.value = item.id
  showDelete.value = true
}

function confirmDelete(reason: string) {
  if (pendingDeleteId.value != null) {
    items.value = items.value.filter(i => i.id !== pendingDeleteId.value)
  }
  pendingDeleteId.value = null
  try {
    document.dispatchEvent(new CustomEvent('app-toast', { detail: {
      severity: 'success',
      summary: 'Article deleted',
      detail: reason ? `Reason: ${reason}` : 'Deleted successfully',
      life: 3500
    } }))
  } catch {}
}

function cancelDelete() {
  pendingDeleteId.value = null
}

function navigateToArticle(articleId: number) {
  // Navigate to full article view
  window.open(`/article/${articleId}`, '_blank')
}

function openHide(item: ReportedArticleItem) {
  pendingHideId.value = item.id
  showHide.value = true
}

function confirmHide() {
  if (pendingHideId.value != null) {
    items.value = items.value.filter(i => i.id !== pendingHideId.value)
  }
  pendingHideId.value = null
  try {
    document.dispatchEvent(new CustomEvent('app-toast', { detail: {
      severity: 'success',
      summary: 'Article hidden',
      detail: 'Hidden successfully',
      life: 3500
    } }))
  } catch {}
}

function cancelHide() {
  pendingHideId.value = null
}
</script>

<style lang="scss" scoped>
.admin-section { display: flex; flex-direction: column; gap: 21px; width: 100%; }
.section-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.section-header h2 { margin: 0; font-size: 29px; }
.badge { background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 10px; padding: 6px 12px; font-weight: 700; font-size: 16px; }

// View Mode Switcher
.view-mode-switcher {
  display: flex;
  gap: 8px;
  margin-left: auto;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 6px;
}

.view-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  &.active {
    background: var(--btn-primary);
    color: var(--text-primary);
  }
}

.view-mode-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

// Articles container styles (matching HomePage)
.articles-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 31px;
  align-items: center;
  width: 100%;

  .article-wrapper {
    width: 100%;
    max-width: 1055px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  // Force article cards to stretch to full width
  .admin-article-card {
    width: 100%;
    max-width: 100%;
    flex: 1;

    :deep(.article-card) {
      width: 100% !important;
      max-width: 100% !important;
    }

    :deep(.article-card-line) {
      width: 100%;
      max-width: 100%;
    }

    :deep(.article-card-square) {
      width: 100%;
      max-width: 100%;
    }
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

  .article-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  // Force article cards to stretch to full width
  .admin-article-card {
    width: 100%;
    max-width: 100%;
    flex: 1;

    :deep(.article-card) {
      width: 100% !important;
      max-width: 100% !important;
    }

    :deep(.article-card-line) {
      width: 100%;
      max-width: 100%;
    }

    :deep(.article-card-square) {
      width: 100%;
      max-width: 100%;
    }
  }

  .reason {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (min-width: 1025px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.reason { 
  width: 100%; 
  max-width: 1055px; 
  background: var(--bg-secondary); 
  border-radius: 26px; 
  padding: 26px; 
  font-family: var(--font-sans); 
  min-height: 80px; 
  display: flex; 
  flex-direction: row; 
  align-items: center; 
  justify-content: space-between; 
  gap: 20px; 
}
.reason-label { font-size: 21px; opacity: 0.7; font-family: var(--font-sans); margin: 0; }
.reason-text { font-size: 22px; text-align: left; margin: 0; flex: 1; }
.actions { display: flex; gap: 16px; flex-shrink: 0; }
.btn { padding: 13px 21px; border-radius: 13px; border: 1px solid var(--text-secondary); background: transparent; color: var(--text-primary); font-weight: 700; cursor: pointer; font-size: 17px; transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, transform .15s ease; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
.btn:active { transform: translateY(0) scale(0.98); box-shadow: 0 3px 10px rgba(0,0,0,0.16); }
.btn:focus-visible { outline: 2px solid var(--btn-primary); outline-offset: 2px; }
.btn.primary { background: var(--btn-primary); }
.btn.danger { border-color: #ef4444; color: #ef4444; }
.loading, .empty { opacity: 0.8; }
</style>


