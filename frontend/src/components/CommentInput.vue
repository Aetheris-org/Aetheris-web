<template>
  <div class="comment-input-wrapper" :class="{ 'reply-input': isReply }">
    <!-- Reply to indicator -->
    <div v-if="replyToUser" class="reply-indicator">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 14L4 9L9 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="reply-to-text">Replying to <span class="reply-username">@{{ replyToUser }}</span></span>
      <button class="cancel-reply-btn" @click="cancelReply">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="comment-input-container">
      <div class="user-avatar-small">
        <svg
          class="question-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 17H12.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <textarea
        ref="textareaRef"
        v-model="commentText"
        class="comment-input"
        :placeholder="placeholder"
        :rows="rows"
        @keydown.enter="handleKeydown"
        @input="autoResize"
        :disabled="isLoading"
      ></textarea>
      <button 
        class="submit-comment-btn" 
        @click="submitComment" 
        :disabled="!commentText.trim() || isLoading"
      >
        <span v-if="isLoading" class="loading-indicator">
          <span class="spinner"></span>
          {{ isReply ? 'Posting...' : submitButtonText }}
        </span>
        <span v-else>{{ submitButtonText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface CommentInputProps {
  isReply?: boolean
  replyToUser?: string
  replyToId?: number
  placeholder?: string
  rows?: number
  submitButtonText?: string
  isLoading?: boolean
}

interface CommentInputEmits {
  (e: 'submit', data: { text: string, replyToId?: number, replyToUser?: string }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<CommentInputProps>(), {
  isReply: false,
  placeholder: 'Write a comment...',
  rows: 3,
  submitButtonText: 'Submit'
})

const emit = defineEmits<CommentInputEmits>()

const commentText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Auto-add @username when replying
watch(() => props.replyToUser, (newUser) => {
  if (newUser && !commentText.value.startsWith(`@${newUser}`)) {
    commentText.value = `@${newUser}, `
    nextTick(() => {
      // Focus and move cursor to end
      if (textareaRef.value) {
        textareaRef.value.focus()
        const length = commentText.value.length
        textareaRef.value.setSelectionRange(length, length)
      }
    })
  }
}, { immediate: true })

const handleKeydown = (event: KeyboardEvent) => {
  // Если нажат Shift+Enter - разрешаем новую строку (обычное поведение)
  if (event.shiftKey) {
    return
  }
  
  // Если нажат просто Enter - отправляем комментарий
  event.preventDefault()
  submitComment()
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  emit('submit', {
    text: commentText.value.trim(),
    replyToId: props.replyToId,
    replyToUser: props.replyToUser
  })
  
  commentText.value = ''
}

const cancelReply = () => {
  commentText.value = ''
  emit('cancel')
}

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

onMounted(() => {
  if (props.isReply && textareaRef.value) {
    textareaRef.value.focus()
  }
})
</script>

<style scoped>
.comment-input-wrapper {
  margin-bottom: 24px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reply-input {
  margin-left: 60px;
  margin-bottom: 16px;
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(140, 0, 255, 0.1);
  border-radius: 12px 12px 0 0;
  margin-bottom: -1px;
  
  svg {
    color: var(--primary-violet);
    flex-shrink: 0;
  }
}

.reply-to-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 400;
}

.reply-username {
  color: var(--primary-violet);
  font-weight: 600;
}

.cancel-reply-btn {
  margin-left: auto;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.comment-input-container {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-input .comment-input-container {
  border-radius: 0 0 20px 20px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--btn-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  flex-shrink: 0;
}

.comment-input {
  width: 100%;
  background-color: var(--bg-primary);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  resize: none;
  min-height: 60px;
  max-height: 300px;
  overflow-y: auto;
  transition: all 0.2s ease;
  
  &:focus {
    outline: 2px solid var(--btn-primary);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
}

.reply-input .comment-input {
  min-height: 50px;
  font-size: 18px;
}

.submit-comment-btn {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 90px;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: var(--btn-primary-hover, #2563eb);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile adaptation */
@media (max-width: 768px) {
  .reply-input {
    margin-left: 40px;
  }
  
  .comment-input-container {
    padding: 14px;
    border-radius: 16px;
  }
  
  .comment-input {
    font-size: 14px;
    min-height: 50px;
  }
  
  .submit-comment-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .reply-to-text {
    font-size: 13px;
  }
}
</style>

