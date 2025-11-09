<template>
  <div class="admin-section">
    <div class="section-header">
      <h2>Reported comments</h2>
      <span class="badge" v-if="items.length">{{ items.length }}</span>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!items.length" class="empty">No reports</div>
    <div v-else class="stack">
      <div class="comment-wrapper" v-for="item in items" :key="item.id">
        <AdminCommentBlock :comment="toComment(item)" @userClick="navigateToProfile" />
        <div class="reason">
          <div class="reason-chip">Reason:</div>
          <div class="reason-text">{{ item.reportReason }}</div>
          <div class="actions">
            <button class="btn subtle" @click="openHide(item)">Hide</button>
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
import { onMounted, ref } from 'vue'
import { fetchReportedComments } from '@/api/articles'
import AdminCommentBlock from '@/components/AdminCommentBlock.vue'
import AdminDeleteDialog from '@/components/AdminDeleteDialog.vue'
import AdminHideDialog from '@/components/AdminHideDialog.vue'

interface ReportedCommentItem {
  id: number
  content: string
  reportReason: string
}

const items = ref<ReportedCommentItem[]>([])
const loading = ref<boolean>(true)
const showDelete = ref<boolean>(false)
const pendingDeleteId = ref<number | null>(null)
const showHide = ref<boolean>(false)
const pendingHideId = ref<number | null>(null)

onMounted(async () => {
  try {
    const data = await fetchReportedComments()
    items.value = data
  } finally {
    loading.value = false
  }
})

function toComment(item: ReportedCommentItem) {
  return {
    id: item.id,
    author: { id: 0, username: 'Reported' },
    text: item.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    userLiked: false,
  }
}

function openDelete(item: ReportedCommentItem) {
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
      summary: 'Comment deleted',
      detail: reason ? `Reason: ${reason}` : 'Deleted successfully',
      life: 3500
    } }))
  } catch {}
}

function cancelDelete() {
  pendingDeleteId.value = null
}

function navigateToProfile(userId: number) {
  // Navigate to user profile
  window.open(`/profile/${userId}`, '_blank')
}

function openHide(item: ReportedCommentItem) {
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
      summary: 'Comment hidden',
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
.admin-section { display: flex; flex-direction: column; gap: 26px; width: 100%; font-family: var(--font-sans); }
.section-header { display: flex; align-items: center; gap: 10px; }
.section-header h2 { margin: 0; font-size: 29px; }
.badge { background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 10px; padding: 6px 12px; font-weight: 700; font-size: 16px; }

.stack { display: flex; flex-direction: column; gap: 31px; align-items: flex-start; width: 100%; }
.comment-wrapper { width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 13px; }
/* make embedded CommentBlock stretch nicely in admin right column */
:deep(.comment-block) { width: 100% !important; max-width: 1055px !important; margin: 0 !important; }
.reason { width: 100%; max-width: 1055px; background: var(--bg-secondary); border-radius: 26px; padding: 26px; box-shadow: 0 6px 18px rgba(0,0,0,0.18) inset; font-family: var(--font-sans); min-height: 80px; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 20px; }
.reason-chip { display: inline-flex; align-items: center; padding: 8px 16px; font-size: 21px; font-weight: 700; color: var(--text-primary); border: none; border-radius: 8px; background: transparent; margin: 0; }
.reason-text { font-size: 22px; opacity: 0.9; text-align: left; margin: 0; flex: 1; }
.actions { display: flex; gap: 16px; flex-shrink: 0; }
.btn { padding: 13px 21px; border-radius: 13px; border: 1px solid var(--text-secondary); background: transparent; color: var(--text-primary); font-weight: 700; cursor: pointer; font-size: 17px; transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, transform .15s ease; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
.btn:active { transform: translateY(0) scale(0.98); box-shadow: 0 3px 10px rgba(0,0,0,0.16); }
.btn:focus-visible { outline: 2px solid var(--btn-primary); outline-offset: 2px; }
.btn.primary { background: var(--btn-primary); }
.btn.subtle { background: rgba(255,255,255,0.04); }
.btn.danger { border-color: #ef4444; color: #ef4444; }
.loading, .empty { opacity: 0.8; }
</style>


