<template>
  <div class="articles-page">
    <div class="articles-container">
      <!-- Page Title -->
      <div class="page-title-section">
        <h1 class="page-title">Your articles</h1>
      </div>
      
      <!-- Articles Body -->
      <div class="articles-body">
        <!-- First Left Block - Search -->
        <div class="search-section">
          <!-- Status Filter -->
          <div class="status-filter">
            <button
              class="status-chip"
              :class="{ active: statusFilter === 'all' }"
              @click="statusFilter = 'all'"
            >All</button>
            <button
              class="status-chip"
              :class="{ active: statusFilter === 'published' }"
              @click="statusFilter = 'published'"
            >Published</button>
            <button
              class="status-chip"
              :class="{ active: statusFilter === 'draft' }"
              @click="statusFilter = 'draft'"
            >Drafts</button>
          </div>

          <div class="search-container">
            <svg class="search-icon" width="32" height="28" viewBox="0 0 42 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.6119 2H2L17.0448 19.7375V32L24.5672 35.75V19.7375L39.6119 2Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="search-divider"></div>
            <svg class="search-icon-2" width="28" height="28" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35.8507 35.75L27.6701 27.5937M32.0895 17C32.0895 25.2843 25.3538 32 17.0448 32C8.73577 32 2 25.2843 2 17C2 8.71573 8.73577 2 17.0448 2C25.3538 2 32.0895 8.71573 32.0895 17Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- Search Bar -->
            <input
              type="text"
              class="search-input"
              placeholder="Find your articles..."
              :value="searchQuery"
              @input="onSearchInput"
            >
          </div>

          <!-- Articles Container -->
          <div class="articles-list-container">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading your articles...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="isEmpty" class="empty-state">
              <h3>{{ $t('your-articles.empty.title') }}</h3>
              <p>{{ $t('your-articles.empty.subtitle') }}</p>
              <button @click="goToCreateArticle" class="create-article-btn">
                Создать статью
              </button>
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
                @delete-article="handleDeleteArticle"
                @edit-article="handleEditArticle"
                @article-deleted="handleArticleDeleted"
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
              <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Second Right Block - Sidebar -->
        <div class="sidebar-section">
          <!-- Article Info -->
          <div class="article-info-card">
            <div class="card-header">
              <svg class="card-icon" width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7083 1.41666L1.625 15.9167H12.5L11.2917 25.5833L23.375 11.0833H12.5L13.7083 1.41666Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2 class="card-title">Your stats</h2>
            </div>
            
            <div class="info-item">
              <p class="info-label">Articles:</p>
              <p class="info-value">{{ totalRecords }}</p>
            </div>
            
            <div class="info-item">
              <p class="info-label">Total likes:</p>
              <p class="info-value">{{ totalLikes }}</p>
            </div>
            
            <div class="info-item">
              <p class="info-label">Total comments:</p>
              <p class="info-value">{{ totalComments }}</p>
            </div>
            
            <div class="info-item">
              <p class="info-label">Views:</p>
              <p class="info-value">unknown</p>
            </div>
          </div>

          <!-- Similar Articles -->
          <div class="similar-articles-card">
            <div class="card-header">
              <svg class="card-icon" width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7083 1.41666L1.625 15.9167H12.5L11.2917 25.5833L23.375 11.0833H12.5L13.7083 1.41666Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2 class="card-title">Quick actions</h2>
            </div>
            
            <button @click="goToCreateArticle" class="action-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Create new article
            </button>
            
            <button @click="refreshArticles" class="action-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 21v-5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Refresh articles
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import Paginator from 'primevue/paginator'
import { useUserArticles } from '@/composables/useUserArticles'
import { useAuthStore } from '@/stores/auth'
import type { UserArticle } from '@/types/article'

const router = useRouter()
const auth = useAuthStore()

// Используем composable для работы со статьями пользователя
const {
  articles,
  loading,
  error,
  isEmpty,
  fetchUserArticles,
  refreshArticles
} = useUserArticles()

// Вычисляемые свойства
const statusFilter = ref<'all' | 'published' | 'draft'>('all')

const filteredArticlesRaw = computed(() => {
  if (statusFilter.value === 'all') return articles.value
  return articles.value.filter(a => a.status === statusFilter.value)
})

const totalRecords = computed(() => filteredArticlesRaw.value.length)
const totalLikes = computed(() => filteredArticlesRaw.value.reduce((sum, article) => sum + (article.likes || 0), 0))
const totalComments = computed(() => filteredArticlesRaw.value.reduce((sum, article) => sum + (article.comments_count || 0), 0))

const first = ref(0)
const rows = ref(10)

// Функция для преобразования UserArticle в Article для ArticleCard
const convertToArticle = (userArticle: UserArticle) => {
  return {
    id: userArticle.id,
    title: userArticle.title,
    content: userArticle.content,
    excerpt: userArticle.excerpt,
    author: {
      id: 0, // UserArticle не содержит author.id
      username: userArticle.author,
      avatar: undefined
    },
    tags: userArticle.tags,
    createdAt: userArticle.created_at,
    status: userArticle.status,
    likes: userArticle.likes,
    dislikes: userArticle.dislikes,
    commentsCount: userArticle.comments_count,
    userReaction: userArticle.user_reaction,
    previewImage: userArticle.preview_image,
    difficulty: userArticle.difficulty
  }
}

// Пагинированные статьи - показываем только 10 статей на текущей странице
const paginatedArticles = computed(() => {
  const start = first.value
  const end = start + rows.value
  return filteredArticlesRaw.value.slice(start, end).map(convertToArticle)
})

const showBackToTop = ref(false)
const searchQuery = ref('')

// Обработчики событий ArticleCard
const handleTagClick = (tag: string) => {
  console.log('Клик по тегу:', tag)
  // TODO: Реализовать фильтрацию по тегу
}

const handleAuthorClick = (authorId: number) => {
  console.log('Клик по автору:', authorId)
  // TODO: Реализовать фильтрацию по автору
}

const handleArticleClick = (articleId: number) => {
  console.log('Клик по статье:', articleId)
  // Переход к полной статье
  router.push(`/article/${articleId}`)
}

const handleDeleteArticle = (articleData: { id: number; title: string }) => {
  console.log('Удаление статьи:', articleData)
  // Здесь можно добавить дополнительную логику перед удалением
  // Например, показать диалог подтверждения
}

const handleEditArticle = (articleData: { id: number; title: string }) => {
  console.log('Редактирование статьи:', articleData)
  // Переходим на страницу редактирования статьи
  router.push(`/edit-article/${articleData.id}`)
}

const handleArticleDeleted = (articleId: number) => {
  console.log('Статья удалена:', articleId)
  // Обновляем список статей после удаления
  refreshArticles()
}

// Обработчик поиска
const handleSearch = () => {
  console.log('Поиск:', searchQuery.value)
  // TODO: Реализовать поиск статей
}

// Обработчик изменения поискового запроса
const onSearchInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value

  // Дебаунс для поиска
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    handleSearch()
  }, 500)
}

const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Дополнительные обработчики
const goToCreateArticle = () => {
  router.push('/create-article')
}

const handlePageChange = (event: any) => {
  first.value = event.first
  rows.value = event.rows
  console.log('Page changed:', event)
  
  // Прокручиваем страницу вверх при смене страницы
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight

  // Show button when scrolling down more than 300px
  showBackToTop.value = scrollY > 300

  // Find the footer and button elements
  const footer = document.querySelector('.footer-container') as HTMLElement
  const backToTopBtn = document.querySelector('.back-to-top-btn') as HTMLElement

  if (footer && backToTopBtn) {
    const footerRect = footer.getBoundingClientRect()
    const footerTop = footerRect.top
    const fadeDistance = 100 // distance to start fading

    // Calculate opacity based on distance to footer
    let opacity = 1
    if (footerTop <= windowHeight + fadeDistance) {
      const distanceToFooter = footerTop - windowHeight
      if (distanceToFooter <= 0) {
        // Footer is visible - hide button completely
        opacity = 0
      } else {
        // Footer is approaching - fade out
        opacity = Math.min(1, distanceToFooter / fadeDistance)
      }
    }

    // Apply opacity
    backToTopBtn.style.opacity = opacity.toString()

    // Always use fixed positioning to avoid "flying to stratosphere" issue
    backToTopBtn.style.position = 'fixed'
    backToTopBtn.style.bottom = '30px'
    backToTopBtn.style.left = '30px'
    backToTopBtn.style.top = 'auto'
    backToTopBtn.classList.remove('above-footer')
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  await fetchUserArticles()
  console.log('Статьи пользователя загружены:', articles.value)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import '@/assets/main.scss';

.articles-page {
  background-color: var(--bg-primary);
  min-height: 100vh;
  width: 100%;
  padding-top: calc(var(--header-height, 80px) + 30px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.articles-page .articles-container {
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: 0 12px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 0 20px;
    max-width: 1000px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    padding: 0 24px;
    max-width: 1400px;
  }
}

/* Page Title Section */
.page-title-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.page-title {
  color: var(--text-primary);
  font-size: 50px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

/* Articles Body */
.articles-body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 20px;
    gap: 12px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    margin-top: 30px;
    gap: 14px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    margin-top: 40px;
    gap: 16px;
  }
}

/* First Left Block - Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-filter {
  display: flex;
  gap: 8px;
}

.status-chip {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-chip.active,
.status-chip:hover {
  background-color: white;
  color: var(--bg-primary);
}

.search-container {
  background-color: var(--bg-secondary);
  border-radius: 32px;
  display: flex;
  align-items: center;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    height: 50px;
    border-radius: 25px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 100%;
    max-width: 700px;
    height: 60px;
    border-radius: 30px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 1060px;
    height: 70px;
    border-radius: 32px;
  }
}

.search-icon {
  margin-left: 20px;
}

.search-divider {
  width: 2px;
  height: 38px;
  margin-left: 20px;
  background-color: white;
  border-radius: 30px;
  opacity: 0.3;
}

.search-icon-2 {
  margin-left: 20px;
}

.search-input {
  margin-left: 16px;
  width: 912px;
  height: 50px;
  background-color: var(--bg-primary);
  border-radius: 25px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  padding-left: 16px;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-third);
  opacity: 0.3;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 700;
}

/* Articles List Container */
.articles-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    gap: 16px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 100%;
    max-width: 700px;
    gap: 18px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 1060px;
    gap: 20px;
  }
}

/* Pagination Container */
.pagination-container {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
  padding-top: 3px;
  background-color: transparent;
}

/* PrimeVue Paginator - Community Colors */
:deep(.p-paginator) {
  background-color: transparent !important;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: var(--text-primary);
  font-family: var(--font-sans);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover) {
  background-color: transparent !important;
  color: #3b82f6 !important;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight),
:deep(.p-paginator .p-paginator-pages .p-paginator-page[aria-current="page"]),
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-paginator-page-current) {
  background-color: transparent !important;
  color: #8b5cf6 !important;
  font-weight: bold;
  transform: scale(1.2);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  background-color: transparent !important;
  transition: all 0.2s ease;
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
  color: #3b82f6 !important;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-first:disabled),
:deep(.p-paginator .p-paginator-prev:disabled),
:deep(.p-paginator .p-paginator-next:disabled),
:deep(.p-paginator .p-paginator-last:disabled) {
  color: var(--text-secondary);
  opacity: 0.6;
}

/* Back to Top Button */
.back-to-top-btn {
  position: fixed;
  bottom: 30px;
  left: 30px;
  width: 50px;
  height: 50px;
  background-color: var(--primary-violet);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease, visibility 0.3s ease, transform 0.3s ease;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.back-to-top-btn.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top-btn:hover {
  background-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.back-to-top-btn:active {
  transform: translateY(0);
}

/* Loading and Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;
  color: var(--text-secondary);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 20px;
}

.create-article-btn {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.create-article-btn:hover {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
}

/* Second Right Block - Sidebar Section */
.sidebar-section {
  display: flex;
  flex-direction: column;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 20px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 280px;
    flex-shrink: 0;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 300px;
    flex-shrink: 0;
  }
}

/* Article Info Card */
.article-info-card {
  background-color: var(--bg-secondary);
  border-radius: 30px;
  display: flex;
  flex-direction: column;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    height: 350px;
    border-radius: 25px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 280px;
    height: 380px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 300px;
    height: 400px;
  }
}

.card-header {
  display: flex;
  margin-top: 24px;
}

.card-icon {
  margin-left: 24px;
  margin-top: 4px;
}

.card-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans);
  font-weight: 500;
  margin-left: 10px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0;
}

.info-item {
  display: flex;
  margin-top: 24px;
  margin-left: 24px;
}

.info-label {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  margin: 0;
}

.info-value {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  margin-left: 8px;
  margin: 0;
}

/* Similar Articles Card */
.similar-articles-card {
  background-color: var(--bg-secondary);
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  margin-top: 16px;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    height: 350px;
    border-radius: 25px;
    margin-top: 12px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 280px;
    height: 380px;
    margin-top: 14px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 300px;
    height: 230px;
    margin-top: 16px;
  }
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  border-radius: 15px;
  padding: 12px 16px;
  margin: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 260px;
  height: 56px;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
  font-weight: bold;
}

.action-button:hover {
  background-color: white;
  color: var(--bg-primary);
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

.action-button svg {
  width: 20px;
  height: 20px;
}
</style>