<template>
  <div class="comment-block" :class="{ 'highlighted': highlighted }" :style="{ marginLeft: `${(depth || 0) * 40}px` }">
    <!-- User Info -->
    <div class="comment-header">
      <div class="user-avatar" @click="onUserClick">
        <AvatarImage :src="safeAvatarUrl || null" :alt="comment.author.username" />
      </div>

      <div class="user-info">
        <div class="user-name-row">
          <div class="username-with-badge">
            <h3 class="username" @click="onUserClick">{{ comment.author.username }}</h3>
            <span v-if="isOwner" class="self-badge">{{ t('labels.you') }}</span>
          </div>
          <div class="comment-meta">
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
            <span v-if="isEdited" class="edited-indicator" title="Edited">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="comment-id">#{{ comment.id }}</span>
          </div>
          <div class="more-options-wrapper">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              class="more-options-icon"
              :class="{ 'active': showOptionsMenu }"
              @click="toggleOptionsMenu"
            >
              <path d="M24 26C25.1046 26 26 25.1046 26 24C26 22.8954 25.1046 22 24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M24 12C25.1046 12 26 11.1046 26 10C26 8.89543 25.1046 8 24 8C22.8954 8 22 8.89543 22 10C22 11.1046 22.8954 12 24 12Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M24 40C25.1046 40 26 39.1046 26 38C26 36.8954 25.1046 36 24 36C22.8954 36 22 36.8954 22 38C22 39.1046 22.8954 40 24 40Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            
            <!-- Dropdown Menu -->
            <Transition name="dropdown-fade">
              <div v-if="showOptionsMenu" class="options-dropdown" @click.stop>
                <button v-if="isOwner" class="dropdown-item" @click="handleEdit">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Edit</span> <!-- Only visible to comment CREATOR, don't forget to implement in logic -->
                </button>
                
                <button v-if="isOwner" class="dropdown-item danger" @click="handleDelete">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Delete</span> <!-- Only visible to comment creator -->
                </button>
                
                <button class="dropdown-item" @click="handleInfo">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Info</span> <!-- Visible to everyone -->
                </button>
                
                <button v-if="!isOwner" class="dropdown-item" @click="handleReport">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Report</span> <!-- Visible to everyone -->
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Content -->
    <div class="comment-content">
      <textarea 
        v-if="isEditing"
        v-model="editText"
        class="comment-edit-textarea"
        rows="3"
        @keydown="handleTextareaKeydown"
      ></textarea>
      <p v-else class="comment-text" v-html="formattedText" @click="handleTextClick"></p>
      
      <!-- Edit Actions -->
      <div v-if="isEditing" class="edit-actions">
        <button class="edit-action-btn save-btn" @click="saveEdit" :disabled="isSaving">
          <span v-if="isSaving" class="loading-indicator">
            <span class="spinner"></span>
            Saving...
          </span>
          <span v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Save</span>
          </span>
        </button>
        <button class="edit-action-btn cancel-btn" @click="cancelEdit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Cancel</span>
        </button>
      </div>
    </div>

    <!-- Comment Actions -->
    <div class="comment-actions">
      <button class="action-btn reply-btn" @click="onReply">
        <svg class="reply-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 14L4 9L9 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="action-text">Reply</span>
      </button>
      
      <div 
        class="rating-system"
        @mouseenter="showRatingTooltip = true"
        @mouseleave="showRatingTooltip = false"
      >
        <button 
          class="rating-btn plus-btn"
          :class="{ 'active': userVote === 'up' }"
          @click="handleVote('up')"
          type="button"
        >
          <span class="rating-btn-text">+</span>
        </button>
        <p class="rating-text" :class="{ 'positive': rating > 0, 'negative': rating < 0 }">{{ rating }}</p>
        <button 
          class="rating-btn minus-btn"
          :class="{ 'active': userVote === 'down' }"
          @click="handleVote('down')"
          type="button"
        >
          <span class="rating-btn-text">−</span>
        </button>
        
        <!-- Rating Tooltip -->
        <Transition name="tooltip-fade">
          <div v-if="showRatingTooltip" class="rating-tooltip">
            <div class="tooltip-row likes">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ likes }}</span>
            </div>
            <div class="tooltip-row dislikes">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13L12 18L7 13M12 6V17" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ dislikes }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Delete Confirmation Panel -->
    <div v-if="isDeletePanelOpen" class="delete-panel-overlay" @click="closeDeletePanel">
      <div class="delete-panel" @click.stop>
        <div class="delete-panel-content">
          <p class="delete-panel-text">Are you sure you want to delete this comment?</p>
          <div class="delete-panel-buttons">
            <button class="delete-panel-button cancel" @click="closeDeletePanel">Cancel</button>
            <button class="delete-panel-button confirm" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div v-if="isInfoPanelOpen" class="info-panel-overlay" @click="closeInfoPanel">
      <div class="info-panel" @click.stop>
        <div class="info-panel-content">
          <h3 class="info-panel-title">Comment Information</h3>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Comment ID:</span>
              <span class="info-value">{{ comment.id }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Author:</span>
              <span class="info-value">{{ comment.author.username }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Published:</span>
              <span class="info-value">{{ formatFullDate(comment.createdAt) }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Rating:</span>
              <span class="info-value">{{ rating > 0 ? '+' : '' }}{{ rating }} ({{ likes }} ↑ / {{ dislikes }} ↓)</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Text Length:</span>
              <span class="info-value">{{ comment.text.length }} characters</span>
            </div>
          </div>
          
          <div class="info-panel-buttons">
            <button class="info-panel-button close" @click="closeInfoPanel">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Panel -->
    <div v-if="isReportPanelOpen" class="report-panel-overlay" @click="closeReportPanel">
      <div class="report-panel" @click.stop>
        <div class="report-panel-content">
          <h3 class="report-panel-title">Report Comment</h3>
          <p class="report-panel-subtitle">Select the reason for reporting:</p>
          
          <div class="report-reasons">
            <label 
              v-for="reason in reportReasons" 
              :key="reason.id" 
              class="reason-item"
              :class="{ 'selected': selectedReasons.includes(reason.id) }"
            >
              <input 
                type="checkbox" 
                :value="reason.id" 
                v-model="selectedReasons"
                class="reason-checkbox"
              />
              <span class="reason-checkmark"></span>
              <span class="reason-title">{{ reason.title }}</span>
            </label>
          </div>
          
          <div class="report-panel-buttons">
            <button class="report-panel-button cancel" @click="closeReportPanel">Cancel</button>
            <button 
              class="report-panel-button confirm" 
              @click="confirmReport"
              :disabled="selectedReasons.length === 0"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast for notifications -->
  <Toast />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { deleteComment, updateComment } from '@/api/articles'
import { useUndoableDeleteManager } from '@/composables/useUndoableDeleteManager'
import { sanitizeAvatarUrl } from '@/utils/avatarValidation'
import AvatarImage from './AvatarImage.vue'

interface CommentAuthor {
  id: number
  username: string
  avatar?: string
}

interface Comment {
  id: number
  author: CommentAuthor
  text: string
  createdAt: string | Date
  updatedAt?: string | Date | null
  likes?: number
  dislikes?: number
  userLiked?: boolean
  userReaction?: string | null  // 'like', 'dislike', или null
}

interface CommentBlockProps {
  comment: Comment
  // For mention navigation in replies, parent id helps resolve target
  parentCommentId?: number
  replyToCommentId?: number
  highlighted?: boolean
  depth?: number
}

interface CommentBlockEmits {
  (e: 'like', commentId: number): void
  (e: 'react', commentId: number, reaction: 'like' | 'dislike'): void
  (e: 'reply', commentId: number): void
  (e: 'userClick', userId: number): void
  (e: 'mentionClick', commentId: number): void
  (e: 'delete', commentId: number): void
  (e: 'edit', commentId: number, newText: string): void
}

const props = defineProps<CommentBlockProps>()
const emit = defineEmits<CommentBlockEmits>()

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const isLiked = ref(props.comment.userLiked || false)
const likesCount = ref(props.comment.likes || 0)
const showOptionsMenu = ref(false)
const isDeletePanelOpen = ref(false)
const isReportPanelOpen = ref(false)
const isInfoPanelOpen = ref(false)
const selectedReasons = ref<string[]>([])
const isEditing = ref(false)
const editText = ref('')
const isSaving = ref(false)

// Rating system - инициализируем из props
const userVote = ref<'up' | 'down' | null>(
  props.comment.userReaction === 'like' ? 'up' : 
  props.comment.userReaction === 'dislike' ? 'down' : 
  null
)
const likes = ref(props.comment.likes || 0)
const dislikes = ref(props.comment.dislikes || 0)
const rating = computed(() => likes.value - dislikes.value)
const showRatingTooltip = ref(false)
const avatarError = ref(false) // Флаг ошибки загрузки аватара

// Безопасный URL аватара (валидируется перед использованием)
const safeAvatarUrl = computed(() => {
  if (avatarError.value) return null
  return sanitizeAvatarUrl(props.comment.author.avatar)
})

// Обработчик ошибки загрузки аватара
const onAvatarError = () => {
  avatarError.value = true
}

// Check if comment was edited
const isEdited = computed(() => {
  if (!props.comment.updatedAt || !props.comment.createdAt) return false
  const createdAt = typeof props.comment.createdAt === 'string' ? new Date(props.comment.createdAt) : props.comment.createdAt
  const updatedAt = typeof props.comment.updatedAt === 'string' ? new Date(props.comment.updatedAt) : props.comment.updatedAt
  if (!createdAt || !updatedAt || isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) return false
  return updatedAt.getTime() > createdAt.getTime() + 1000 // 1 second difference to account for server timing
})

// Синхронизируем состояние с props при их изменении
watch(() => props.comment.userReaction, (newReaction) => {
  userVote.value = newReaction === 'like' ? 'up' : newReaction === 'dislike' ? 'down' : null
}, { immediate: false })

watch(() => props.comment.likes, (newLikes) => {
  likes.value = newLikes || 0
}, { immediate: false })

watch(() => props.comment.dislikes, (newDislikes) => {
  dislikes.value = newDislikes || 0
}, { immediate: false })

// Сбрасываем ошибку аватара при изменении автора комментария
watch(() => props.comment.author.avatar, () => {
  avatarError.value = false
})

// Owner check: only comment creator can edit/delete
const auth = useAuthStore()
const anonId = computed(() => {
  const key = 'anon_user_id'
  let id = localStorage.getItem(key)
  if (!id) {
    // Generate a smaller ID that fits in PostgreSQL integer (max ~2 billion)
    // Use last 8 digits of timestamp + random number to stay under 2^31
    const timestamp = Date.now()
    const smallId = (timestamp % 100000000) + Math.floor(Math.random() * 10000)
    id = String(smallId)
    localStorage.setItem(key, id)
  }
  return Number(id)
})
const currentUserId = computed(() => auth.user?.id ?? anonId.value)
const isOwner = computed(() => {
  const commentAuthorId = Number(props.comment.author.id)
  const userId = Number(currentUserId.value)
  console.log('Comment author ID:', commentAuthorId, 'Current user ID:', userId, 'Is owner:', commentAuthorId === userId)
  return commentAuthorId === userId
})

// Format text with highlighted @mentions
const formattedText = computed(() => {
  const text = props.comment.text || ''
  // Replace @username with clickable highlighted span (supports cyrillic and latin)
  return text.replace(/@([a-zA-Zа-яА-ЯёЁ0-9_]+)/g, '<span class="mention" style="color: #8c00ff; font-weight: 600; cursor: pointer;" data-mention="$1">@$1</span>')
})

// Handle click on mention
const handleTextClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('mention')) {
    // If this is a reply, navigate to the parent comment; otherwise use self id
    const targetCommentId = props.replyToCommentId || props.parentCommentId || props.comment.id
    emit('mentionClick', targetCommentId)
    event.stopPropagation()
  }
}

const reportReasons = [
  {
    id: 'spam',
    title: 'Spam',
    description: 'Unwanted commercial content or repetitive messages'
  },
  {
    id: 'harassment',
    title: 'Harassment',
    description: 'Bullying, threats, or personal attacks'
  },
  {
    id: 'hate',
    title: 'Hate Speech',
    description: 'Content promoting violence or hatred'
  },
  {
    id: 'inappropriate',
    title: 'Inappropriate Content',
    description: 'Sexual, violent, or disturbing content'
  },
  {
    id: 'misinformation',
    title: 'Misinformation',
    description: 'False or misleading information'
  }
]

const onLike = () => {
  isLiked.value = !isLiked.value
  likesCount.value += isLiked.value ? 1 : -1
  emit('like', props.comment.id)
}

const onReply = () => {
  emit('reply', props.comment.id)
}

const onUserClick = () => {
  const authorId = props.comment.author.id
  // Проверяем, что ID валидный (не 0 и не undefined)
  if (authorId && authorId > 0) {
    // Проверяем, является ли текущий пользователь автором комментария
    if (auth.user && auth.user.id === authorId) {
      // Показываем уведомление вместо перехода
      toast.add({
        severity: 'info',
        summary: t('notifications.ownComment.summary', 'Это ваш комментарий'),
        detail: t('notifications.ownComment.detail', 'Вы не можете перейти на свой профиль из собственного комментария'),
        life: 3000
      })
      return
    }
    
    console.log('🚀 Navigating to user profile from comment:', authorId)
    // Переходим на профиль пользователя (безопасно - только публичная информация)
    router.push(`/user/${authorId}`)
    // Также эмитим событие для обратной совместимости
    emit('userClick', authorId)
  } else {
    console.warn('❌ Cannot navigate to profile: invalid author ID in comment', {
      authorId,
      commentId: props.comment.id,
      author: props.comment.author
    })
  }
}

const toggleOptionsMenu = () => {
  showOptionsMenu.value = !showOptionsMenu.value
}

const originalText = ref('')

const handleEdit = () => {
  if (!isOwner.value) return
  originalText.value = props.comment.text
  editText.value = props.comment.text
  isEditing.value = true
  showOptionsMenu.value = false
}

const saveEdit = async () => {
  if (!editText.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Error',
      detail: 'Comment cannot be empty',
      life: 3000
    })
    return
  }
  
  // Проверяем авторизацию перед сохранением
  if (!auth.isAuthenticated || !auth.token) {
    toast.add({
      severity: 'error',
      summary: 'Authentication Required',
      detail: 'Please log in to edit comments',
      life: 3000
    })
    router.push('/auth')
    return
  }
  
  try {
    isSaving.value = true
    console.log('Saving comment:', props.comment.id, 'with text:', editText.value.trim())
    console.log('Auth token exists:', !!auth.token)
    const updated = await updateComment(props.comment.id, editText.value.trim())
    console.log('Comment updated successfully:', updated)
    emit('edit', props.comment.id, editText.value.trim())
    isEditing.value = false
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Comment updated successfully',
      life: 3000
    })
  } catch (error: any) {
    console.error('Failed to update comment:', error)
    console.error('Error details:', error.response?.data || error.message)
    console.error('Error status:', error.response?.status)
    
    let errorMessage = 'Failed to update comment'
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.'
      // Очищаем токен и перенаправляем на логин
      auth.logout()
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    })
  } finally {
    isSaving.value = false
  }
}

const handleTextareaKeydown = (event: KeyboardEvent) => {
  // Escape - отмена редактирования
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelEdit()
    return
  }
  
  // Enter - сохранение (или новая строка с Shift)
  if (event.key === 'Enter') {
    // Если нажат Shift+Enter - разрешаем новую строку (обычное поведение)
    if (event.shiftKey) {
      return
    }
    
    // Если нажат просто Enter - сохраняем редактирование
    event.preventDefault()
    saveEdit()
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = originalText.value
  originalText.value = ''
}

const handleDelete = () => {
  if (!isOwner.value) return
  showOptionsMenu.value = false
  isDeletePanelOpen.value = true
}

const closeDeletePanel = () => {
  isDeletePanelOpen.value = false
}

const confirmDelete = async () => {
  isDeletePanelOpen.value = false
  const commentId = props.comment.id
  
  const { startDelete } = useUndoableDeleteManager()
  
  // Начинаем удаление с возможностью отмены
  startDelete(
    `comment-${commentId}`,
    'comment',
    async () => {
      // Функция выполнится после истечения таймера
      try {
        await deleteComment(commentId, currentUserId.value)
        emit('delete', commentId)
      } catch (error) {
        console.error('Failed to delete comment:', error)
        toast.add({
          severity: 'error',
          summary: t('notifications.comment.delete.error.summary'),
          detail: t('notifications.comment.delete.error.detail'),
          life: 3000
        })
      }
    },
    {
      message: t('notifications.undoDelete.comment.message'),
      onUndo: async () => {
        toast.add({
          severity: 'info',
          summary: t('notifications.comment.delete.cancelled.summary'),
          detail: t('notifications.comment.delete.cancelled.detail'),
          life: 2000
        })
      }
    }
  )
}

const handleInfo = () => {
  showOptionsMenu.value = false
  isInfoPanelOpen.value = true
}

const closeInfoPanel = () => {
  isInfoPanelOpen.value = false
}

const handleReport = () => {
  showOptionsMenu.value = false
  isReportPanelOpen.value = true
  selectedReasons.value = []
}

const closeReportPanel = () => {
  isReportPanelOpen.value = false
  selectedReasons.value = []
}

const confirmReport = () => {
  console.log('Report comment:', props.comment.id, 'Reasons:', selectedReasons.value)
  isReportPanelOpen.value = false
  selectedReasons.value = []
  // TODO: Send report to API
}

const handleVote = async (voteType: 'up' | 'down') => {
  const reaction = voteType === 'up' ? 'like' : 'dislike'
  
  // Обновляем состояние оптимистично для лучшего UX
  const previousVote = userVote.value
  
  // Оптимистичное обновление
  if (previousVote === voteType) {
    // Удаляем реакцию
    if (voteType === 'up') {
      likes.value = Math.max(0, likes.value - 1)
    } else {
      dislikes.value = Math.max(0, dislikes.value - 1)
    }
    userVote.value = null
  } else if (previousVote) {
    // Меняем реакцию
    if (previousVote === 'up') {
      likes.value = Math.max(0, likes.value - 1)
      dislikes.value++
    } else {
      dislikes.value = Math.max(0, dislikes.value - 1)
      likes.value++
    }
    userVote.value = voteType
  } else {
    // Добавляем новую реакцию
    if (voteType === 'up') {
      likes.value++
    } else {
      dislikes.value++
    }
    userVote.value = voteType
  }
  
  // Emit reaction to parent for API call (родитель обновит состояние на основе ответа сервера)
  emit('react', props.comment.id, reaction)
}

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'just now'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return 'just now'
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
}

const formatFullDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.more-options-wrapper')
  
  if (!dropdown && showOptionsMenu.value) {
    showOptionsMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.username-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.self-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(140, 0, 255, 0.1);
  color: var(--primary-violet);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.rating-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: transparent;
  padding: 0;
  margin: 0;
  
  .rating-btn-text {
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
    user-select: none;
    transition: color 0.2s ease-in-out;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.plus-btn {
  color: var(--ico-color);
  margin-left: 16px;
  
  .rating-btn-text {
    color: inherit;
  }
  
  &:hover {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  
  &.active {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    transform: scale(1.05);
    
    .rating-btn-text {
      color: #22c55e;
    }
  }
}

.minus-btn {
  color: var(--ico-color);
  
  .rating-btn-text {
    color: inherit;
  }
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
  
  &.active {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    transform: scale(1.05);
    
    .rating-btn-text {
      color: #ef4444;
    }
  }
}

.comment-block {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 16px;
  width: 90%;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.highlighted {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
    animation: highlight-fade 3s ease-in-out forwards;
  }
  
  /* Nested comment indicator removed per design */
}

@keyframes highlight-fade {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
  10% {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0);
  }
}

.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--btn-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.question-icon {
  color: var(--text-primary);
}

.user-info {
  flex: 1;
  margin-top: 11px;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.more-options-wrapper {
  position: relative;
  margin-left: auto;
}

.more-options-icon {
  width: 31px;
  height: 31px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  
  &:hover {
    color: var(--text-primary);
  }
  
  &.active {
    color: var(--primary-violet);
  }
}

.options-dropdown {
  position: absolute;
  top: 0px;
  left: calc(100% + 8px);
  transform: none;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 10px;
  min-width: 260px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000002;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  background: none;
  border: none;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  svg {
    width: 23px;
    height: 23px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    
    svg {
      color: var(--text-primary);
    }
  }
  
  &.danger {
    &:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      
      svg {
        color: #ef4444;
      }
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.16s ease-in-out, margin-top 0.16s ease-in-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  margin-top: -4px;
}

.username {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--btn-primary);
  }
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-time {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 400;
}

.comment-id {
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0.7;
}

.edited-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.7;
  margin-left: 8px;
  cursor: help;
  transition: opacity 0.2s ease;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    opacity: 1;
    color: var(--text-primary);
  }
}

.comment-content {
  margin-bottom: 12px;
  padding-left: 60px;
}

.comment-text {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
  white-space: pre-line;
}

.comment-text :deep(.mention) {
  color: #8c00ff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-text :deep(.mention:hover) {
  text-decoration: underline;
}

.comment-edit-textarea {
  width: 100%;
  background-color: var(--btn-primary);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 400;
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-left: 0;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  min-width: 100px;
  justify-content: center;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &.save-btn {
    background-color: var(--primary-violet);
    color: white;
    
    &:hover {
      background-color: var(--primary-blue);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &.cancel-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 60px;
}

.action-btn {
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.action-btn.like-btn {
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    
    .heart-icon {
      color: #ef4444;
    }
  }
  
  &.active {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    
    .heart-icon {
      color: #ef4444;
    }
  }
}

.heart-icon {
  transition: all 0.3s ease;
  
  &.filled {
    color: #ef4444;
    transform: scale(1.05);
  }
}

.action-btn.reply-btn {
  &:hover {
    background-color: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    
    .reply-icon {
      color: #3b82f6;
    }
  }
}

.reply-icon {
  transition: all 0.3s ease;
}

.action-count,
.action-text {
  font-weight: 500;
  font-size: 14px;
}

/* Rating System */
.rating-system {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-left: auto;
  position: relative;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
    transform: scale(1.1);
  }
  
  &:first-child {
    transform: rotate(180deg);
    
    &:hover {
      transform: rotate(180deg) scale(1.1);
    }
  }
}

.rating-text {
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0;
  min-width: 32px;
  text-align: center;
  transition: all 0.3s ease;
  
  &.positive {
    color: #22c55e;
  }
  
  &.negative {
    color: #ef4444;
  }
}

/* Rating Tooltip */
.rating-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  background-color: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 16px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &.likes {
    color: #22c55e;
  }
  
  &.dislikes {
    color: #ef4444;
    position: relative;
    padding-left: 16px;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--text-secondary);
      opacity: 0.5;
      font-size: 18px;
    }
  }
}

/* Tooltip fade animation */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

/* Mobile adaptation */
@media (max-width: 768px) {
  .comment-block {
    padding: 16px 18px;
    border-radius: 16px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .username {
    font-size: 16px;
  }
  
  .comment-time {
    font-size: 12px;
  }
  
  .comment-content {
    padding-left: 52px;
  }
  
  .comment-text {
    font-size: 14px;
  }
  
  .comment-actions {
    padding-left: 52px;
  }
  
  .action-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* Tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  .comment-block {
    padding: 18px 20px;
  }
  
  .username {
    font-size: 17px;
  }
  
  .comment-text {
    font-size: 15px;
  }
}

/* Delete Confirmation Panel */
.delete-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: deletePanelOverlayAppear 0.3s ease-out;
}

@keyframes deletePanelOverlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.delete-panel {
  animation: deletePanelAppear 0.3s ease-out 0.1s both;
}

@keyframes deletePanelAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.delete-panel-content {
  background-color: var(--bg-secondary);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
  max-width: 500px;
}

.delete-panel-text {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0 0 25px 0;
  line-height: 1.4;
}

.delete-panel-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.delete-panel-button {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.cancel {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    border: 2px solid var(--text-secondary);
    
    &:hover {
      background-color: var(--text-secondary);
      color: var(--bg-primary);
    }
  }
  
  &.confirm {
    background-color: #ef4444;
    color: white;
    
    &:hover {
      background-color: #dc2626;
    }
  }
}

/* Mobile adaptation for delete panel */
@media (max-width: 768px) {
  .delete-panel-content {
    padding: 25px;
    min-width: 280px;
    margin: 0 20px;
  }
  
  .delete-panel-text {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .delete-panel-button {
    padding: 10px 20px;
    font-size: 15px;
  }
}

/* Report Panel */
.report-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: reportPanelOverlayAppear 0.3s ease-out;
}

@keyframes reportPanelOverlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.report-panel {
  animation: reportPanelAppear 0.3s ease-out 0.1s both;
}

@keyframes reportPanelAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.report-panel-content {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 550px;
  max-width: 650px;
  max-height: 80vh;
  overflow-y: auto;
}

.report-panel-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 12px 0;
}

.report-panel-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  margin: 0 0 25px 0;
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.reason-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background-color: var(--bg-primary);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  &.selected {
    background-color: rgba(140, 0, 255, 0.1);
    border-color: var(--primary-violet);
  }
}

.reason-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.reason-checkmark {
  position: relative;
  width: 28px;
  height: 28px;
  border: 2px solid var(--text-secondary);
  border-radius: 8px;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    display: none;
    left: 8px;
    top: 3px;
    width: 8px;
    height: 14px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
}

.reason-item.selected .reason-checkmark {
  background-color: var(--primary-violet);
  border-color: var(--primary-violet);
  
  &::after {
    display: block;
  }
}

.reason-title {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 600;
}

.report-panel-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.report-panel-button {
  padding: 14px 30px;
  border-radius: 12px;
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.cancel {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    border: 2px solid var(--text-secondary);
    
    &:hover {
      background-color: var(--text-secondary);
      color: var(--bg-primary);
    }
  }
  
  &.confirm {
    background-color: var(--primary-violet);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: var(--primary-blue);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

/* Mobile adaptation for report panel */
@media (max-width: 768px) {
  .report-panel-content {
    padding: 30px;
    min-width: 320px;
    max-width: 90vw;
    margin: 0 20px;
  }
  
  .report-panel-title {
    font-size: 24px;
  }
  
  .report-panel-subtitle {
    font-size: 16px;
  }
  
  .reason-item {
    padding: 16px 20px;
  }
  
  .reason-title {
    font-size: 18px;
  }
  
  .report-panel-button {
    padding: 12px 24px;
    font-size: 16px;
  }
}

/* Info Panel */
.info-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: infoPanelOverlayAppear 0.3s ease-out;
}

@keyframes infoPanelOverlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.info-panel {
  animation: infoPanelAppear 0.3s ease-out 0.1s both;
}

@keyframes infoPanelAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.info-panel-content {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 500px;
  max-width: 600px;
}

.info-panel-title {
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 30px 0;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--bg-primary);
  border-radius: 12px;
  gap: 20px;
}

.info-label {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  color: var(--text-primary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  text-align: right;
  word-break: break-word;
  flex: 1;
}

.info-panel-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.info-panel-button {
  padding: 14px 30px;
  border-radius: 12px;
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.close {
    background-color: var(--primary-violet);
    color: white;
    
    &:hover {
      background-color: var(--primary-blue);
    }
  }
}

/* Mobile adaptation for info panel */
@media (max-width: 768px) {
  .info-panel-content {
    padding: 30px;
    min-width: 320px;
    max-width: 90vw;
    margin: 0 20px;
  }
  
  .info-panel-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .info-section {
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .info-row {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-label {
    font-size: 16px;
  }
  
  .info-value {
    font-size: 16px;
    text-align: left;
  }
  
  .info-panel-button {
    padding: 12px 24px;
    font-size: 16px;
  }
}
</style>

