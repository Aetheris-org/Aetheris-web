<template>
  <div class="comment-thread">
    <!-- Main Comment -->
    <AuthorCommentBlock
      v-if="comment.author.isAuthor"
      :id="`comment-${comment.id}`"
      :comment="comment"
      :parent-comment-id="comment.parentId"
      :reply-to-comment-id="comment.replyToCommentId"
      :depth="comment.depth"
      :highlighted="highlightedCommentId === comment.id"
      @like="emit('like', comment.id)"
      @react="(id, reaction) => emit('react', id, reaction)"
      @reply="emit('reply', comment.id)"
      @user-click="(userId) => emit('userClick', userId)"
      @mention-click="(commentId) => emit('mentionClick', commentId)"
      @delete="emit('delete', comment.id)"
      @edit="(id, newText) => emit('edit', id, newText)"
    />
    
    <CommentBlock
      v-else
      :id="`comment-${comment.id}`"
      :comment="comment"
      :parent-comment-id="comment.parentId"
      :reply-to-comment-id="comment.replyToCommentId"
      :depth="comment.depth"
      :highlighted="highlightedCommentId === comment.id"
      @like="emit('like', comment.id)"
      @react="(id, reaction) => emit('react', id, reaction)"
      @reply="emit('reply', comment.id)"
      @user-click="(userId) => emit('userClick', userId)"
      @mention-click="(commentId) => emit('mentionClick', commentId)"
      @delete="emit('delete', comment.id)"
      @edit="(id, newText) => emit('edit', id, newText)"
    />
    
    <!-- Reply Input for this comment -->
    <CommentInput
      v-if="replyingTo && replyingTo.id === comment.id"
      :is-reply="true"
      :reply-to-user="(comment.parentId != null || (comment.children && comment.children.length > 0)) ? replyingTo.username : null"
      :reply-to-id="replyingTo.id"
      :is-loading="isPostingReply && replyingTo.id === comment.id"
      :placeholder="$t('comments.replyPlaceholder') as string"
      :submit-button-text="$t('comments.reply') as string"
      @submit="(data) => emit('submitReply', data)"
      @cancel="emit('cancelReply')"
    />
    
    <!-- Child Comments (Recursive) -->
    <template v-if="comment.children && comment.children.length > 0">
      <CommentThread
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :highlighted-comment-id="highlightedCommentId"
        :replying-to="replyingTo"
        :editing-comment-id="editingCommentId"
        :is-posting-reply="isPostingReply"
        @like="(id) => emit('like', id)"
        @react="(id, reaction) => emit('react', id, reaction)"
        @reply="(id) => emit('reply', id)"
        @user-click="(userId) => emit('userClick', userId)"
        @mention-click="(commentId) => emit('mentionClick', commentId)"
        @delete="(id) => emit('delete', id)"
        @edit="(id, newText) => emit('edit', id, newText)"
        @submit-reply="(data) => emit('submitReply', data)"
        @cancel-reply="emit('cancelReply')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import CommentBlock from './CommentBlock.vue'
import AuthorCommentBlock from './AuthorCommentBlock.vue'
import CommentInput from './CommentInput.vue'

interface Comment {
  id: number
  author: {
    id: number
    username: string
    avatar?: string
    isAuthor?: boolean
  }
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
  children?: Comment[]
}

interface Props {
  comment: Comment
  highlightedCommentId: number | null
  replyingTo: { id: number, parentId: number, username: string } | null
  editingCommentId?: number | null
  isPostingReply?: boolean
}

interface Emits {
  (e: 'like', commentId: number): void
  (e: 'react', commentId: number, reaction: 'like' | 'dislike'): void
  (e: 'reply', commentId: number): void
  (e: 'userClick', userId: number): void
  (e: 'mentionClick', commentId: number): void
  (e: 'delete', commentId: number): void
  (e: 'edit', commentId: number, newText: string): void
  (e: 'submitReply', data: { text: string, replyToId?: number, replyToUser?: string }): void
  (e: 'cancelReply'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<script lang="ts">
export default {
  name: 'CommentThread'
}
</script>

<style scoped>
.comment-thread {
  display: flex;
  flex-direction: column;
}
</style>

