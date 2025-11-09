<template>
  <div class="stared-articles-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">{{ $t('common.favorites', 'Избранное') }}</h1>
        <p class="page-subtitle" v-if="!loading && !isEmpty">
          {{ totalFavoritesText }}
        </p>
      </div>

      <!-- Articles Container -->
      <div class="articles-list-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ $t('common.loading', 'Загрузка...') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="isEmpty" class="empty-state">
          <div class="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <h3>{{ $t('bookmarks.empty.title', 'У вас пока нет избранных статей') }}</h3>
          <p>{{ $t('bookmarks.empty.description', 'Добавляйте интересные статьи в избранное, чтобы не потерять их') }}</p>
        </div>

        <!-- Articles List -->
        <template v-else>
          <ArticleCard
            v-for="article in paginatedArticles"
            :key="article.id"
            :article="article"
            @tag-click="handleTagClick"
            @author-click="handleAuthorClick"
            @article-click="handleArticleClick"
            @article-deleted="handleArticleDeleted"
            @delete-article="handleDeleteArticle"
            @report-article="handleReportArticle"
            @share-article="handleShareArticle"
          />
        </template>

        <!-- Pagination -->
        <div v-if="!loading && !isEmpty" class="pagination-container">
          <Paginator
            v-model:first="first"
            :rows="rows"
            :totalRecords="totalRecords"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            @page="handlePageChange"
          />
        </div>
      </div>

      <!-- Back to Top Button -->
      <button
        class="back-to-top-btn"
        @click="scrollToTop"
        :class="{ visible: showBackToTop }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCurrentLocale } from '@/i18n'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Paginator from 'primevue/paginator'
import ArticleCard from '@/components/ArticleCard.vue'
import { getBookmarkedArticles } from '@/api/articles'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/article'

// getBookmarkedArticles уже возвращает правильно преобразованные Article[] через transformArticle
// Не нужно дополнительное преобразование

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

// State
const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Pagination
const first = ref(0)
const rows = ref(10)
const showBackToTop = ref(false)

// Computed
const isEmpty = computed(() => !loading.value && articles.value.length === 0)
const totalRecords = computed(() => articles.value.length)

// Форматирование количества статей с учетом языка
const totalFavoritesText = computed(() => {
  const count = totalRecords.value
  const locale = getCurrentLocale()
  
  if (locale === 'ru') {
    // Русская локализация с правильным склонением
    if (count % 10 === 1 && count % 100 !== 11) {
      return t('common.totalFavorites_one', { count })
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return t('common.totalFavorites_few', { count })
    } else {
      return t('common.totalFavorites_many', { count })
    }
  } else {
    // Для остальных языков используем простую plural форму
    if (count === 1) {
      return t('common.totalFavorites_one', { count })
    } else {
      return t('common.totalFavorites_other', { count })
    }
  }
})

const paginatedArticles = computed(() => {
  const start = first.value
  const end = start + rows.value
  return articles.value.slice(start, end)
})

// Functions
const fetchBookmarkedArticles = async () => {
  if (!authStore.isAuthenticated || !authStore.user) {
    error.value = 'Authentication required'
    return
  }

  loading.value = true
  error.value = null

  try {
    // getBookmarkedArticles уже возвращает правильно преобразованные Article[]
    const fetchedArticles = await getBookmarkedArticles(0, 1000) // Загружаем все закладки
    console.log('📚 Bookmarked articles from API:', fetchedArticles)
    
    // Используем данные напрямую, так как они уже преобразованы через transformArticle
    articles.value = fetchedArticles
    
    console.log('✅ Loaded bookmarked articles:', articles.value.length, 'articles')
  } catch (err: any) {
    console.error('❌ Ошибка загрузки избранных статей:', err)
    error.value = err.response?.data?.detail || err.message || 'Failed to load bookmarked articles'
    toast.add({
      severity: 'error',
      summary: t('notifications.error.summary', 'Ошибка'),
      detail: error.value,
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const handleTagClick = (tag: string) => {
  router.push(`/?tag=${encodeURIComponent(tag)}`)
}

const handleAuthorClick = (authorId: number) => {
  router.push(`/user/${authorId}`)
}

const handleArticleClick = (articleId: number) => {
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }
  router.push(`/article/${articleId}`)
}

const handleArticleDeleted = (articleId: number) => {
  // Удаляем статью из списка при удалении
  articles.value = articles.value.filter(a => a.id !== articleId)
  toast.add({
    severity: 'success',
    summary: t('notifications.deleteArticle.success.summary', 'Статья удалена'),
    detail: t('notifications.deleteArticle.success.detail', 'Статья успешно удалена'),
    life: 3000
  })
}

const handleDeleteArticle = (article: { id: number; title: string }) => {
  // Обработка будет в ArticleCard
  console.log('Delete article:', article)
}

const handleReportArticle = (article: { id: number; title: string }) => {
  // Обработка будет в ArticleCard
  console.log('Report article:', article)
}

const handleShareArticle = (article: { id: number; title: string }) => {
  // Обработка будет в ArticleCard
  console.log('Share article:', article)
}

const handlePageChange = (event: any) => {
  first.value = event.first
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// Обновление списка при возврате на страницу
onActivated(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    await fetchBookmarkedArticles()
  }
})

// Слушаем изменения маршрута для обновления при возврате
watch(() => route.path, async (newPath) => {
  if (newPath === '/stared-articles' && authStore.isAuthenticated && authStore.user) {
    await fetchBookmarkedArticles()
  }
})

// Слушаем события обновления закладок
const handleBookmarkUpdate = async () => {
  if (authStore.isAuthenticated && authStore.user) {
    await fetchBookmarkedArticles()
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  // Слушаем события обновления закладок
  window.addEventListener('bookmark:updated', handleBookmarkUpdate)
  
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('notifications.authRequired.summary'),
      detail: t('notifications.authRequired.detail'),
      life: 4000
    })
    router.push('/auth')
    return
  }

  await fetchBookmarkedArticles()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('bookmark:updated', handleBookmarkUpdate)
})
</script>

<style scoped>
.stared-articles-page {
  min-height: 100vh;
  padding: calc(var(--header-height, 80px) + 60px) 20px 40px;
  background-color: var(--bg-primary);
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  color: var(--text-primary);
  font-size: 42px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0 0 12px 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: 400;
  margin: 0;
}

.articles-list-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-secondary);
  border-top-color: var(--primary-violet);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-state-icon {
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 24px;
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  margin: 0;
  max-width: 500px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding-bottom: 0;
  padding-top: 20px;
  margin-bottom: 0;
  margin-top: 40px;
  background-color: transparent;
  gap: 12px;
}

/* Paginator Styles */
:deep(.p-paginator) {
  background-color: transparent !important;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: var(--text-primary);
  font-family: var(--font-sans);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover) {
  background-color: transparent !important;
  color: #3b82f6 !important; /* Подсвечиваем саму цифру */
  transform: scale(1.1); /* Немного увеличиваем для эффекта */
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight),
:deep(.p-paginator .p-paginator-pages .p-paginator-page[aria-current="page"]),
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-paginator-page-current) {
  background-color: transparent !important;
  color: #8b5cf6 !important; /* Активная страница - фиолетовый цвет цифры */
  font-weight: bold; /* Делаем жирной для выделения */
  transform: scale(1.2); /* Увеличиваем активную страницу */
}

/* Override any green colors */
:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  background-color: transparent !important;
  transition: all 0.2s ease; /* Плавная анимация для всех страниц */
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  color: var(--text-primary);
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-first:hover),
:deep(.p-paginator .p-paginator-prev:hover),
:deep(.p-paginator .p-paginator-next:hover),
:deep(.p-paginator .p-paginator-last:hover) {
  background-color: transparent !important;
  color: #3b82f6 !important; /* Подсвечиваем сами иконки */
  transform: scale(1.1); /* Немного увеличиваем для эффекта */
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-first:disabled),
:deep(.p-paginator .p-paginator-prev:disabled),
:deep(.p-paginator .p-paginator-next:disabled),
:deep(.p-paginator .p-paginator-last:disabled) {
  color: var(--text-secondary);
  opacity: 0.6;
}

.back-to-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-violet);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(140, 0, 255, 0.3);
}

.back-to-top-btn.visible {
  opacity: 1;
  visibility: visible;
}

.back-to-top-btn:hover {
  background-color: var(--primary-blue);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(140, 0, 255, 0.4);
}

.back-to-top-btn:active {
  transform: translateY(-1px);
}

/* Mobile adaptation */
@media (max-width: 768px) {
  .stared-articles-page {
    padding: calc(var(--header-height, 80px) + 40px) 15px 20px;
  }

  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .back-to-top-btn {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
}
</style>
