<template>
  <div class="draft-page">
    <div class="container">
      <h1 class="title">Drafts</h1>
      <div v-if="loading" class="loading">Loading…</div>
      <div v-else-if="drafts.length === 0" class="empty">No drafts yet</div>
      <div v-else class="list">
        <DraftArticleCard
          v-for="a in drafts"
          :key="a.id"
          :article="a"
          @edit="editDraft"
          @delete="deleteDraft"
          @open="openDraft"
        />
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DraftArticleCard from '@/components/DraftArticleCard.vue'
import type { Article } from '@/types/article'
import { useUserArticles } from '@/composables/useUserArticles'

const router = useRouter()
const { articles, loading, fetchUserArticles } = useUserArticles()

// Фильтруем только черновики (статьи с publishedAt === null или status === 'draft')
const drafts = computed(() => 
  articles.value.filter(a => a.status === 'draft' || !a.publishedAt)
)

onMounted(async () => {
  console.log('🔵 DraftArticles mounted')
  await fetchUserArticles()
  console.log('📝 User articles loaded:', articles.value.length)
  console.log('📝 Drafts found:', drafts.value.length)
})

function editDraft(id: number) {
  // Переходим на страницу редактирования
  router.push(`/edit-article/${id}`)
}

function deleteDraft(id: number) {
  // TODO: Реализовать удаление черновика
  console.log('delete draft', id)
}

function openDraft(id: number) {
  // Открываем просмотр статьи
  router.push(`/article/${id}`)
}
</script>

<style scoped>
.draft-page { 
  background: var(--bg-primary); 
  min-height: 100vh;
  padding-top: calc(var(--header-height, 80px) + 60px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.container { 
  width: 100%; 
  max-width: 1060px; 
  margin: 0 auto; 
  padding: 24px; 
  box-sizing: border-box; 
}
.title { 
  color: var(--text-primary); 
  font-family: var(--font-sans); 
  font-size: 28px; 
  font-weight: 700; 
  margin: 16px 0 24px; 
}
.loading, .empty { 
  color: var(--text-secondary); 
  font-weight: 700; 
  font-family: var(--font-sans); 
}
.list { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}
</style>
