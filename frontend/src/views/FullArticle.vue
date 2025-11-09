<template>
  <div class="full-article-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ $t('common.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <h1 class="error-text">{{ $t('common.error') }}</h1>
      <p class="error-message">{{ error }}</p>
      <button @click="goBack" class="back-button">{{ $t('common.go_back') }}</button>
    </div>
    
    <div v-else-if="article" class="article-container">
      <FullArticleCard 
        ref="fullArticleCardRef"
        :article="article" 
        @article-deleted="handleArticleDeleted"
        @share-article="handleShareArticle"
      />
      <!-- Comments Section -->
      <div class="comments-section" id="comments">
        <h2 class="comments-title">Comments ({{ totalCommentsCount }})</h2>
        
        <!-- Comment Input -->
        <div class="comment-input-container">
          <textarea
            ref="commentInput"
            v-model="newComment"
            class="comment-input"
            placeholder="Write a comment..."
            rows="3"
            @keydown.ctrl.enter="addComment"
          ></textarea>
          <button class="submit-comment-btn" @click="addComment" :disabled="!newComment.trim()">
            Submit
          </button>
        </div>
        
        <!-- Comments List -->
        <div class="comments-list">
          <template v-for="comment in commentTree" :key="comment.id">
            <CommentThread
              :comment="comment"
              :highlighted-comment-id="highlightedCommentId"
              :replying-to="replyingTo"
              @like="handleCommentLike"
              @react="handleCommentReact"
              @reply="handleCommentReply"
              @user-click="handleUserClick"
              @mention-click="handleMentionClick"
              @delete="handleCommentDelete"
              @edit="handleCommentEdit"
              @submit-reply="handleReplySubmit"
              @cancel-reply="cancelReply"
            />
          </template>
          
          <div v-if="commentTree.length === 0" class="no-comments">
            <p>Be the first to leave a comment!</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found-container">
      <h1 class="not-found-text">{{ $t('common.article_not_found') }}</h1>
      <button @click="goBack" class="back-button">{{ $t('common.go_back') }}</button>
    </div>
    
    <!-- Share Panel -->
    <SharePanel
      :visible="isSharePanelOpen"
      :article-url="articleUrl"
      :article-title="articleToShare?.title || ''"
      @close="closeSharePanel"
    />
    
    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import FullArticleCard from '@/components/FullArticleCard.vue'
import CommentBlock from '@/components/CommentBlock.vue'
import ReplyCommentBlock from '@/components/ReplyCommentBlock.vue'
import AuthorCommentBlock from '@/components/AuthorCommentBlock.vue'
import CommentInput from '@/components/CommentInput.vue'
import CommentThread from '@/components/CommentThread.vue'
import SharePanel from '@/components/SharePanel.vue'
import { useArticles } from '@/composables/useArticles'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/article'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getArticle, fetchComments, addComment: addCommentApi, reactCommentFn } = useArticles()

// Состояния
const article = ref<Article | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const newComment = ref('')
const replyingTo = ref<{ id: number, parentId: number, username: string } | null>(null)
const highlightedCommentId = ref<number | null>(null)
const commentInput = ref<HTMLTextAreaElement | null>(null)
const fullArticleCardRef = ref<InstanceType<typeof FullArticleCard> | null>(null)
const auth = useAuthStore()

// Share panel state
const isSharePanelOpen = ref(false)
const articleToShare = ref<{ id: number; title: string } | null>(null)

// Backend-powered comments
type UiComment = {
  id: number
  author: { id: number, username: string, avatar?: string, isAuthor?: boolean }
  text: string
  createdAt: string
  updatedAt?: string | null
  likes: number
  dislikes: number
  userLiked: boolean
  userReaction?: string | null
  parentId?: number | null
  replyToCommentId?: number | null
  depth?: number
  children?: UiComment[]
}

const comments = ref<UiComment[]>([])
const replyComments = ref<UiComment[]>([])
const commentTree = ref<UiComment[]>([])

// Total comments count (main comments + reply comments)
const totalCommentsCount = computed(() => comments.value.length + replyComments.value.length)

// Get article ID from route
const articleId = ref<number>(parseInt(route.params.id as string))

// Load article
const loadArticle = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (isNaN(articleId.value)) {
      throw new Error('Invalid article ID')
    }
    
    const fetchedArticle = await getArticle(articleId.value)
    article.value = fetchedArticle

    // load comments from backend
    const list = await fetchComments(articleId.value)
    const mapped: UiComment[] = list.map(c => ({
      id: c.id,
      author: {
        id: c.author_id ?? 0,
        username: c.author_name || 'Guest',
        avatar: c.author_avatar || undefined,  // Используем аватар из API
        isAuthor: (c.author_name || '') === (fetchedArticle.author?.username || fetchedArticle.author || '')
      },
      text: c.text,
      createdAt: c.created_at,
      updatedAt: c.updated_at ?? null,
      likes: c.likes ?? 0,
      dislikes: c.dislikes ?? 0,
      userLiked: c.user_reaction === 'like',
      userReaction: c.user_reaction ?? null,
      parentId: c.parent_id ?? null,
      replyToCommentId: c.parent_id ?? null,
    }))
    comments.value = mapped.filter(m => !m.parentId)
    replyComments.value = mapped.filter(m => !!m.parentId)
    
    // Build tree structure for nested display
    commentTree.value = buildCommentTree(mapped)
    console.log('Comment tree built:', commentTree.value)
  } catch (err: any) {
    console.error('Error loading article:', err)
    
    // Handle 404 - article not found
    if (err.response?.status === 404) {
      error.value = 'Статья не найдена или была удалена'
    } 
    // Handle 403 - forbidden (e.g. draft article)
    else if (err.response?.status === 403) {
      error.value = 'У вас нет доступа к этой статье'
    }
    // Handle other errors
    else {
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке статьи'
    }
  } finally {
    loading.value = false
  }
}

// Go back
const goBack = () => {
  router.go(-1)
}

// Handle article deletion
const handleArticleDeleted = (articleId: number) => {
  console.log('Статья удалена:', articleId)
  
  // Show notification
  toast.add({
    severity: 'error',
    summary: t('notifications.deleteArticle.success.summary', 'Статья удалена'),
    detail: t('notifications.deleteArticle.success.detail', 'Статья была успешно удалена'),
    life: 3000
  })
  
  // Перенаправляем на главную страницу после удаления
  router.push('/')
}

// Share panel handlers
const handleShareArticle = (articleData: { id: number; title: string }) => {
  articleToShare.value = articleData
  isSharePanelOpen.value = true
}

const closeSharePanel = () => {
  isSharePanelOpen.value = false
  
  // Сбрасываем состояние share иконки в компоненте статьи
  if (fullArticleCardRef.value && typeof fullArticleCardRef.value.resetShareState === 'function') {
    fullArticleCardRef.value.resetShareState()
  }
  
  articleToShare.value = null
}

// Computed property for article URL
const articleUrl = computed(() => {
  if (articleToShare.value && typeof window !== 'undefined') {
    return `${window.location.origin}/article/${articleToShare.value.id}`
  }
  return ''
})

// Comment handlers
const addComment = async () => {
  try {
    if (!newComment.value.trim()) return
    // Require auth to comment
    if (!auth.isAuthenticated) {
      toast.add({ severity: 'warn', summary: t('common.warning', 'Требуется вход'), detail: t('comments.auth_required', 'Войдите, чтобы оставить комментарий'), life: 3000 })
      router.push('/auth')
      return
    }

    const created = await addCommentToBackend(newComment.value)
    comments.value.unshift(created)
    newComment.value = ''
    
    // Rebuild tree
    const allComments = [...comments.value, ...replyComments.value]
    commentTree.value = buildCommentTree(allComments)
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      toast.add({ severity: 'error', summary: t('common.error', 'Ошибка'), detail: t('comments.auth_required', 'Войдите, чтобы оставить комментарий'), life: 3000 })
      router.push('/auth')
    } else {
      toast.add({ severity: 'error', summary: t('common.error', 'Ошибка'), detail: err?.message || 'Не удалось добавить комментарий', life: 3000 })
    }
  }
}

async function addCommentToBackend(text: string, parentId?: number) {
  console.log('Adding comment with parent_id:', parentId)
  const c = await addCommentApi(articleId.value, text, parentId ?? null)
  console.log('Comment created from API:', c)
  console.log('Comment author avatar:', c.author_avatar)
  const mapped: UiComment = {
    id: c.id,
    author: {
      id: c.author_id ?? 0,
      username: c.author_name || 'Guest',
      avatar: c.author_avatar || null, // ВАЖНО: Используем аватар из ответа API
      isAuthor: (c.author_name || '') === (article.value?.author?.username || (article.value as any)?.author || '')
    },
    text: c.text,
    createdAt: c.created_at,
    updatedAt: c.updated_at ?? null,
    likes: c.likes ?? 0,
    dislikes: c.dislikes ?? 0,
    userLiked: c.user_reaction === 'like',
    userReaction: c.user_reaction ?? null,  // Добавляем userReaction
    parentId: c.parent_id ?? null,
    replyToCommentId: c.parent_id ?? null,
  }
  return mapped
}

const handleCommentLike = (commentId: number) => {
  console.log('Like comment:', commentId)
  // TODO: Implement comment like functionality
}

const handleCommentReact = async (commentId: number, reaction: 'like' | 'dislike') => {
  try {
    const updated = await reactCommentFn(commentId, reaction)
    // Update local comment state with API response (серверное состояние - источник истины)
    const updateComment = (c: UiComment) => {
      if (c.id === commentId) {
        c.likes = updated.likes ?? 0
        c.dislikes = updated.dislikes ?? 0
        c.userReaction = updated.user_reaction ?? null
        c.userLiked = updated.user_reaction === 'like'
      }
      // Рекурсивно обновляем дочерние комментарии
      if (c.children) {
        c.children.forEach(updateComment)
      }
    }
    comments.value.forEach(updateComment)
    replyComments.value.forEach(updateComment)
    
    // Пересобираем дерево комментариев после обновления
    const allComments = [...comments.value, ...replyComments.value]
    commentTree.value = buildCommentTree(allComments)
  } catch (err) {
    console.error('Error reacting to comment:', err)
    // В случае ошибки можно откатить оптимистичное обновление
    // Но watch-еры в CommentBlock/AuthorCommentBlock сами синхронизируются с props
  }
}

const handleCommentReply = (commentId: number) => {
  const comment = comments.value.find(c => c.id === commentId) || 
                  replyComments.value.find(c => c.id === commentId)
  
  if (comment) {
    replyingTo.value = {
      id: commentId, // The comment being replied to (this will be the parent_id)
      parentId: commentId, // Same as id for simplicity
      username: comment.author.username
    }
  }
}

const handleReplySubmit = async (data: { text: string, replyToId?: number, replyToUser?: string }) => {
  if (!replyingTo.value) return
  // Use replyingTo.value.id as the parent - the comment we're replying to
  const created = await addCommentToBackend(data.text, replyingTo.value.id)
  replyComments.value.push(created)
  replyingTo.value = null
  
  // Rebuild tree
  const allComments = [...comments.value, ...replyComments.value]
  commentTree.value = buildCommentTree(allComments)
}

const cancelReply = () => {
  replyingTo.value = null
}

const handleUserClick = (userId: number) => {
  console.log('User clicked:', userId)
  // TODO: Navigate to user profile
}

const handleCommentEdit = (commentId: number, newText: string) => {
  // Update comment text in local state
  const updateComment = (c: UiComment) => {
    if (c.id === commentId) {
      c.text = newText
      c.updatedAt = new Date().toISOString() // Mark as edited
    }
    if (c.children) {
      c.children.forEach(updateComment)
    }
  }
  
  comments.value.forEach(updateComment)
  replyComments.value.forEach(updateComment)
  
  // Rebuild tree to reflect changes
  const allComments = [...comments.value, ...replyComments.value]
  commentTree.value = buildCommentTree(allComments)
}

const handleCommentDelete = (commentId: number) => {
  // Remove comment from local state
  comments.value = comments.value.filter(c => c.id !== commentId)
  replyComments.value = replyComments.value.filter(c => c.id !== commentId)
  
  // Rebuild tree
  const allComments = [...comments.value, ...replyComments.value]
  commentTree.value = buildCommentTree(allComments)
  
  // Update total comments count
  totalCommentsCount.value = allComments.length
  
  // Show notification
  toast.add({
    severity: 'error',
    summary: t('notifications.comment.deleted.summary', 'Комментарий удален'),
    detail: t('notifications.comment.deleted.detail', 'Ваш комментарий был успешно удален'),
    life: 3000
  })
}

const handleMentionClick = (commentId: number) => {
  // Highlight the mentioned comment
  highlightedCommentId.value = commentId
  
  // Scroll to the comment
  nextTick(() => {
    const element = document.getElementById(`comment-${commentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Wait for scroll to complete before starting the highlight timer
      // Smooth scroll usually takes about 500-1000ms, so we add extra delay
      setTimeout(() => {
        // Remove highlight after 3 seconds from when element is visible
        setTimeout(() => {
          highlightedCommentId.value = null
        }, 3000)
      }, 800) // Wait for scroll animation to complete
    } else {
      // If element not found, remove highlight after standard delay
      setTimeout(() => {
        highlightedCommentId.value = null
      }, 3000)
    }
  })
}

// Get replies for a specific comment
const getReplies = (commentId: number) => {
  return replyComments.value.filter(reply => reply.parentId === commentId)
}

// Build 1-level comment tree (root + direct replies only)
function buildCommentTree(flatComments: UiComment[], depth = 0): UiComment[] {
  console.log('Building tree from comments:', flatComments)
  const commentMap = new Map<number, UiComment>()
  const rootComments: UiComment[] = []
  
  // Sort comments: root comments first, then children
  // This ensures parents are processed before their children
  const sortedComments = [...flatComments].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1
    if (a.parentId && !b.parentId) return 1
    return 0
  })
  
  // Create a map of all comments
  sortedComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, depth, children: [] })
  })
  
  // Build the tree and clamp depth to 1 level
  sortedComments.forEach(comment => {
    const node = commentMap.get(comment.id)!
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      console.log(`Comment ${comment.id} has parent ${comment.parentId}`, parent ? 'found' : 'NOT FOUND')
      if (parent) {
        node.depth = 1
        parent.children = parent.children || []
        parent.children.push(node)
        console.log(`Added comment ${comment.id} as child of ${comment.parentId}, depth: ${node.depth}`)
      } else {
        // Parent not found, treat as root
        rootComments.push(node)
        console.log(`Parent not found for comment ${comment.id}, adding as root`)
      }
    } else {
      rootComments.push(node)
      console.log(`Comment ${comment.id} is a root comment`)
    }
  })
  
  console.log('Root comments:', rootComments)
  return rootComments
}

// Load on mount
onMounted(async () => {
  console.log('FullArticle mounted, articleId:', articleId.value)
  console.log('Current route:', route.path, route.params, route.hash)
  
  // Сразу прокручиваем к началу при загрузке статьи
  window.scrollTo({ top: 0, behavior: 'instant' })
  
  await loadArticle()
  
  // Проверяем, есть ли якорь для комментария в URL
  const hash = window.location.hash
  console.log('URL hash:', hash)
  
  if (hash && (hash === '#comments' || hash.startsWith('#comment-'))) {
    await nextTick()
    setTimeout(() => {
      if (hash === '#comments') {
        const el = document.getElementById('comments')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Фокусируемся на поле ввода комментария
          setTimeout(() => {
            if (commentInput.value) {
              commentInput.value.focus()
            }
          }, 300)
        }
      } else {
        const commentId = parseInt(hash.replace('#comment-', ''))
        if (commentId) {
          console.log('Attempting to scroll to comment:', commentId)
          scrollToComment(commentId)
        }
      }
    }, 500)
  }
})

// Функция для прокрутки к комментарию
const scrollToComment = (commentId: number) => {
  console.log('scrollToComment called with commentId:', commentId)
  const element = document.getElementById(`comment-${commentId}`)
  console.log('Found element:', element)
  
  if (element) {
    console.log('Scrolling to comment element')
    // Подсвечиваем комментарий
    highlightedCommentId.value = commentId
    
    // Прокручиваем к элементу
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
    
    // Убираем подсветку через 3 секунды
    setTimeout(() => {
      highlightedCommentId.value = null
    }, 3000)
  } else {
    console.log('Comment element not found, available elements with comment- prefix:')
    const allElements = document.querySelectorAll('[id^="comment-"]')
    allElements.forEach(el => console.log('Found comment element:', el.id))
  }
}

// Следим за изменениями хеша в URL
watch(() => route.hash, (newHash) => {
  if (!newHash) return
  if (newHash === '#comments') {
    setTimeout(() => {
      const el = document.getElementById('comments')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Фокусируемся на поле ввода комментария
        setTimeout(() => {
          if (commentInput.value) {
            commentInput.value.focus()
          }
        }, 300)
      }
    }, 100)
    return
  }
  if (newHash.startsWith('#comment-')) {
    const commentId = parseInt(newHash.replace('#comment-', ''))
    if (commentId) {
      setTimeout(() => {
        scrollToComment(commentId)
      }, 100)
    }
  }
})
</script>

<style scoped>
.full-article-page {
  min-height: 100vh;
  padding: 20px;
  padding-top: calc(var(--header-height, 80px) + 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.article-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-secondary);
  border-top: 4px solid var(--btn-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-text,
.not-found-text {
  color: var(--text-primary);
  font-size: 24px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin-bottom: 10px;
}

.error-message {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  margin-bottom: 20px;
}

.back-button {
  background-color: var(--btn-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--btn-primary-hover, #2563eb);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Comments Section */
.comments-section {
  margin: 40px auto 0;
  padding: 0;
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 100%;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 1055px;
  }
}

.comments-title {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin-bottom: 24px;
}

.comment-input-container {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  font-size: 16px;
  font-weight: bold;
  font-family: var(--font-sans);
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: 2px solid var(--btn-primary);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
}

.submit-comment-btn {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
  
  &:hover:not(:disabled) {
    background-color: var(--btn-primary-hover, #2563eb);
  }
  
  &:active:not(:disabled) {
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.comments-list {
  margin-top: 24px;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 20px;
  font-weight: bold;
  font-family: var(--font-sans);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .full-article-page {
    padding: 10px;
    padding-top: calc(var(--header-height, 60px) + 10px);
    transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .loading-text,
  .error-text,
  .not-found-text {
    font-size: 20px;
  }
  
  .comments-section {
    margin-top: 30px;
    padding: 0;
  }
  
  .comments-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .comment-input-container {
    padding: 16px;
    border-radius: 16px;
  }
  
  .comment-input {
    font-size: 14px;
    min-height: 70px;
  }
  
  .submit-comment-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
  .comments-section {
    padding: 0;
  }
  
  .comments-title {
    font-size: 26px;
  }
}
</style>
  