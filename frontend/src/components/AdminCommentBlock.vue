<template>
  <div class="comment-block">
    <div class="comment-header">
      <div class="user-avatar" @click="onUserClick">
        <div class="avatar-placeholder"></div>
      </div>
      <div class="user-info">
        <div class="user-name-row">
          <h3 class="username" @click="onUserClick">{{ comment.author.username }}</h3>
          <span class="comment-time">{{ formattedTime }}</span>
        </div>
      </div>
    </div>

    <div class="comment-content">
      <p class="comment-text">{{ comment.text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CommentAuthor {
  id: number
  username: string
  avatar?: string
}

interface AdminComment {
  id: number
  author: CommentAuthor
  text: string
  createdAt: string | Date
}

const props = defineProps<{ comment: AdminComment }>()

const formattedTime = computed(() => {
  const dateObj = typeof props.comment.createdAt === 'string' ? new Date(props.comment.createdAt) : props.comment.createdAt
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  if (diffInHours < 24) return `${diffInHours} h ago`
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  return dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
})

const emit = defineEmits<{
  (e: 'userClick', userId: number): void
}>()

function onUserClick() {
  emit('userClick', props.comment.author.id)
}
</script>

<style scoped>
.comment-block {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 20px 24px;
  width: 100%;
  font-family: var(--font-sans);
}

.comment-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.user-avatar { width: 48px; height: 48px; border-radius: 50%; background-color: var(--btn-primary); flex-shrink: 0; }
.avatar-placeholder { width: 100%; height: 100%; }
.user-info { flex: 1; margin-top: 11px; min-width: 0; }
.user-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.username { color: var(--text-primary); font-size: 18px; font-family: var(--font-sans); font-weight: 600; margin: 0; cursor: pointer; }
.comment-time { color: var(--text-secondary); font-size: 14px; font-family: var(--font-sans); }
.comment-content { margin-bottom: 4px; padding-left: 60px; }
.comment-text { color: var(--text-primary); font-size: 18px; font-family: var(--font-sans); line-height: 1.6; margin: 0; white-space: pre-line; }

@media (max-width: 768px) {
  .comment-block { padding: 16px 18px; border-radius: 16px; }
  .user-avatar { width: 40px; height: 40px; }
  .username { font-size: 16px; }
  .comment-time { font-size: 12px; }
  .comment-content { padding-left: 52px; }
  .comment-text { font-size: 16px; }
}
</style>


