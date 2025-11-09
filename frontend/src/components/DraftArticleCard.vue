<template>
  <div class="draft-card" @click.stop>
    <div class="draft-header">
      <div class="draft-meta">
        <h2 class="draft-title" @click.stop="onOpen">{{ article.title }}</h2>
        <div class="draft-sub">
          <span class="draft-author">{{ article.author.username }}</span>
          <span class="dot">•</span>
          <span class="draft-date">{{ formatDate(article.createdAt) }}</span>
          <span class="dot" v-if="article.difficulty">•</span>
          <span class="draft-difficulty" v-if="article.difficulty">{{ getDifficultyText(article.difficulty) }}</span>
        </div>
      </div>
    </div>

    <div class="draft-body">
      <div class="tags" v-if="article.tags?.length">
        <Tag v-for="tag in article.tags" :key="tag" class="tag" :value="tag" />
      </div>
      <div class="excerpt">{{ safeExcerpt }}</div>
    </div>

    <div class="draft-footer">
      <div class="spacer" />
      <div class="actions">
        <button type="button" class="btn secondary" @click.stop="onEdit">Edit</button>
        <button type="button" class="btn danger" @click.stop="onDelete">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import type { Article } from '@/types/article'

const props = defineProps<{ article: Article }>()
const emit = defineEmits<{ (e: 'edit', id: number): void; (e: 'delete', id: number): void; (e: 'open', id: number): void }>()

const onEdit = () => emit('edit', props.article.id)
const onDelete = () => emit('delete', props.article.id)
const onOpen = () => emit('open', props.article.id)

const safeExcerpt = computed(() => {
  const text = props.article.excerpt || props.article.content || ''
  const div = document.createElement('div')
  div.innerHTML = text
  return (div.textContent || div.innerText || '').slice(0, 300)
})

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDifficultyText(d?: string) {
  if (d === 'easy') return 'Easy'
  if (d === 'hard') return 'Hard'
  return 'Medium'
}
</script>

<style scoped>
.draft-card {
  background-color: var(--bg-secondary);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 12px;
}

.draft-header { display: flex; align-items: center; }
.draft-meta { display: flex; flex-direction: column; gap: 6px; }
.draft-title { color: var(--text-primary); font-family: var(--font-sans); font-weight: 700; font-size: 22px; margin: 0; cursor: pointer; }
.draft-sub { color: var(--text-secondary); display: flex; gap: 8px; align-items: center; font-weight: 600; }
.dot { opacity: 0.5 }

.draft-body { display: flex; flex-direction: column; gap: 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
::deep(.tag) { font-weight: 700; border-radius: 10px; }
.excerpt { color: var(--text-primary); font-family: var(--font-sans); font-size: 16px; line-height: 1.5; opacity: 0.9; }

.draft-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
.actions { display: flex; gap: 10px; }
.btn { padding: 10px 16px; border: none; border-radius: 10px; font-family: var(--font-sans); font-weight: 700; cursor: pointer; transition: all .2s ease; }
.btn.secondary { background: var(--btn-primary); color: var(--text-primary); }
.btn.secondary:hover { filter: brightness(0.95); transform: translateY(-1px); }
.btn.danger { background: #ef4444; color: white; }
.btn.danger:hover { filter: brightness(0.95); transform: translateY(-1px); }
</style>

