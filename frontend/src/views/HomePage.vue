<template>
  <div class="articles-page">
    <div class="articles-container">
      <!-- Articles Body -->
      <div class="articles-body">
      <!-- First Left Block - Search -->
      <div class="search-section">
        <div class="search-container">
                  <div class="filter-icon-wrapper" @click="toggleFilterDropdown" style="cursor: pointer;">
                    <svg 
                      class="search-icon" 
                      :class="{ 'active': showFilterDropdown, 'has-filters': hasActiveFilters }"
                      width="32" 
                      height="28" 
                      viewBox="0 0 42 38" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M39.6119 2H2L17.0448 19.7375V32L24.5672 35.75V19.7375L39.6119 2Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <!-- Индикатор активных фильтров -->
                    <span v-if="hasActiveFilters && !showFilterDropdown" class="filter-indicator">
                      <span v-if="activeFiltersCount > 0" class="filter-count">{{ activeFiltersCount > 99 ? '99+' : activeFiltersCount }}</span>
                    </span>
                  </div>
          <div class="search-divider"></div>
          <svg 
            class="search-icon-2" 
            width="28" 
            height="28" 
            viewBox="0 0 38 38" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            @click="handleSearch"
            style="cursor: pointer;"
          >
            <path d="M35.8507 35.75L27.6701 27.5937M32.0895 17C32.0895 25.2843 25.3538 32 17.0448 32C8.73577 32 2 25.2843 2 17C2 8.71573 8.73577 2 17.0448 2C25.3538 2 32.0895 8.71573 32.0895 17Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- Search Bar -->
          <div class="search-input-container">
            <input
              type="text"
              class="search-input"
              :class="{ 'has-tags': filters.tags.length > 0 }"
              :placeholder="$t('articles.search')"
              :value="searchQuery"
              @input="onSearchInput"
              @keydown.enter="handleSearch"
            >
            <!-- Selected Tags Display -->
            <div v-if="filters.tags.length > 0" class="selected-tags" :class="{ 'scrollable': filters.tags.length > 2 }">
              <span 
                v-for="tag in filters.tags" 
                :key="tag" 
                class="selected-tag"
                @click="removeTag(tag)"
              >
                {{ tag }}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          <!-- Clear Search Button -->
          <button
            v-if="searchQuery || filters.tags.length > 0"
            @click="handleClearSearch"
            class="clear-search-btn"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Category Filter Panel -->
        <div class="category-filter-panel">
          <button 
            @click="handleCategoryClick('all')"
            :class="['category-btn', { active: selectedCategory === 'all' }]"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            All
          </button>
          
          <button 
            @click="handleCategoryClick('news')"
            :class="['category-btn', { active: selectedCategory === 'news' }]"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            News
          </button>
          
          <button 
            @click="handleCategoryClick('development')"
            :class="['category-btn', { active: selectedCategory === 'development' }]"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Development
          </button>
          
          <button 
            @click="handleCategoryClick('research')"
            :class="['category-btn', { active: selectedCategory === 'research' }]"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.663 17H4.337C3.6 17 3 16.4 3 15.663V8.337C3 7.6 3.6 7 4.337 7H9.663C10.4 7 11 7.6 11 8.337V15.663C11 16.4 10.4 17 9.663 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.337 17H11.663C10.926 17 10.326 16.4 10.326 15.663V8.337C10.326 7.6 10.926 7 11.663 7H16.337C17.074 7 17.674 7.6 17.674 8.337V15.663C17.674 16.4 17.074 17 16.337 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Researches
          </button>
          
          <button 
            @click="handleCategoryClick('guides')"
            :class="['category-btn', { active: selectedCategory === 'guides' }]"
          >
            <svg class="category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Guides
          </button>
        </div>

        <!-- Filter Dropdown -->
        <div 
          class="filter-dropdown"
          :class="{ 'show': showFilterDropdown }"
        >
          <div class="filter-section">
            <h4 class="filter-title">{{ $t('articles.filters.difficulty') }}</h4>
            <div class="difficulty-circles">
              <button 
                v-for="(label, difficulty) in difficultyOptions" 
                :key="difficulty"
                @click="handleDifficultyFilter(filters.difficulty === difficulty ? null : difficulty)"
                :class="['difficulty-circle', `difficulty-${difficulty}`, { 'selected': filters.difficulty === difficulty }]"
                :title="label"
                type="button"
              >
                <FireIcon class="difficulty-icon" />
              </button>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-title">{{ $t('articles.filters.readingTime') }}</h4>
            <div class="reading-time-inputs">
              <div class="time-input-group">
                <label>{{ $t('articles.filters.from') }}</label>
                <input 
                  type="number" 
                  :value="filters.readingTimeMin" 
                  @input="handleReadingTimeFilter(($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null, filters.readingTimeMax)"
                  :placeholder="$t('articles.filters.minutes')"
                  min="0"
                  class="time-input"
                />
              </div>
              <div class="time-input-group">
                <label>{{ $t('articles.filters.to') }}</label>
                <input 
                  type="number" 
                  :value="filters.readingTimeMax" 
                  @input="handleReadingTimeFilter(filters.readingTimeMin, ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
                  :placeholder="$t('articles.filters.minutes')"
                  min="0"
                  class="time-input"
                />
              </div>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-title">{{ $t('articles.filters.tags') }}</h4>
            
            <!-- Tag Search Input -->
            <div class="tag-search-container">
              <input
                type="text"
                class="tag-search-input"
                :placeholder="$t('articles.filters.searchTags')"
                :value="tagSearchQuery"
                @input="onTagSearchInput"
              />
              <svg class="tag-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div class="filter-tags">
              <button 
                v-for="tag in filteredTags" 
                :key="tag"
                @click="handleTagFilter(tag)"
                :class="['filter-tag', { active: filters.tags.includes(tag) }]"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <div class="filter-actions">
            <button @click="handleResetFilters" class="filter-reset-btn">
              {{ $t('articles.filters.reset') }}
            </button>
            <button @click="toggleFilterDropdown" class="filter-close-btn">
              {{ $t('articles.filters.close') }}
            </button>
          </div>
        </div>

        <!-- Articles Container -->
        <div 
          class="articles-list-container"
          :class="{ 'shifted-down': showFilterDropdown }"
        >
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text" >Loading articles...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="isEmpty" class="empty-state">
            <h3 v-if="isSearching">{{ $t('articles.searchResults.noResults', { query: searchQuery }) }}</h3>
            <h3 v-else>{{ $t('common.no_articles') }}</h3>
            <p v-if="isSearching">{{ $t('articles.searchResults.noResultsDescription') }}</p>
            <p v-else>{{ $t('articles.searchResults.noResultsDescription') }}</p>
            <button @click="handleClearSearch" class="reset-filters-btn">
              {{ isSearching ? $t('articles.searchResults.showAll') : $t('articles.searchResults.resetFilters') }}
            </button>
          </div>

          <!-- Articles List -->
          <template v-else>
            <!-- Search Results Header -->
            <div v-if="isSearching" class="search-results-header">
              <h3>{{ $t('articles.searchResults.title', { query: searchQuery }) }}</h3>
              <p class="search-results-count">{{ $t('articles.searchResults.count', { count: totalRecords }) }}</p>
            </div>
            
            <div
              :class="{
                'articles-list-vertical': viewMode === 'default' || viewMode === 'line',
                'articles-grid': viewMode === 'square',
              }"
            >
              <template v-if="viewMode === 'default'">
                <ArticleCard
                  v-for="article in paginatedArticles"
                  :key="article.id"
                  :ref="(el) => { if (el) articleCardRefs.set(article.id, el) }"
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
              <template v-else-if="viewMode === 'line'">
                <ArticleCardLine
                  v-for="article in paginatedArticles"
                  :key="article.id"
                  :article="article"
                  @tag-click="handleTagClick"
                  @author-click="handleAuthorClick"
                  @article-click="handleArticleClick"
                  @share-article="handleShareArticle"
                />
              </template>
              <template v-else>
                <ArticleCardSquare
                  v-for="article in paginatedArticles"
                  :key="article.id"
                  :article="article"
                  @author-click="handleAuthorClick"
                  @article-click="handleArticleClick"
                  @tag-click="handleTagClick"
                  @share-article="handleShareArticle"
                />
              </template>
            </div>
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
            <div class="page-size-control">
              <label class="page-size-label">Per page:</label>
              <div class="custom-select" :class="{ 'is-open': isSelectOpen }">
                <div class="select-trigger" @click="toggleSelect">
                  <span class="select-value">{{ rows }}</span>
                  <svg class="select-arrow" :class="{ 'is-rotated': isSelectOpen }" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="select-dropdown" v-show="isSelectOpen">
                  <div 
                    v-for="opt in pageSizeOptions" 
                    :key="opt" 
                    class="select-option"
                    :class="{ 'is-selected': opt === rows }"
                    @click="selectOption(opt)"
                  >
                    {{ opt }}
                  </div>
                </div>
              </div>
            </div>
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
      
      <!-- Delete Confirmation Dialog -->
      <DeleteConfirmDialog
        :visible="isDeleteDialogOpen"
        :article-title="articleToDelete?.title || ''"
        :loading="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
      
      <!-- Report Panel -->
      <div v-if="isReportPanelOpen" class="report-panel-overlay" @click="closeReportPanel">
        <div class="report-panel-content" @click.stop>
          <div class="report-header">
            <h3 class="report-panel-title">{{ t('notifications.reportArticle.title') }}</h3>
            <button @click="closeReportPanel" class="close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <p class="report-panel-subtitle">{{ t('notifications.reportArticle.subtitle') }}</p>
          
          <div class="report-reasons">
            <label v-for="reason in reportReasons" :key="reason.id" class="reason-item" :class="{ selected: selectedReasons.includes(reason.id) }">
              <input 
                type="checkbox" 
                :value="reason.id" 
                v-model="selectedReasons"
                class="reason-checkbox"
              >
              <div class="reason-checkmark"></div>
              <div class="reason-content">
                <span class="reason-title">{{ reason.title }}</span>
                <span class="reason-description">{{ reason.description }}</span>
              </div>
            </label>
          </div>
          
          <div class="report-footer">
            <button @click="closeReportPanel" class="report-btn cancel">{{ t('notifications.reportArticle.cancel') }}</button>
            <button @click="confirmReport" class="report-btn submit" :disabled="selectedReasons.length === 0">
              {{ t('notifications.reportArticle.submit') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Toast for notifications -->
      <Toast />

      <!-- Share Panel -->
      <SharePanel
        :visible="isSharePanelOpen"
        :article-url="articleUrl"
        :article-title="articleToShare?.title || ''"
        @close="closeSharePanel"
      />
      
      <!-- Second Right Block - Sidebar -->
      <div class="sidebar-section" ref="sidebarRef">
        <!-- Popular Today Articles -->
        <div class="trending-articles-card">
          <div class="card-header">
            <svg class="card-icon" width="28" height="30" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.7083 1.41666L1.625 15.9167H12.5L11.2917 25.5833L23.375 11.0833H12.5L13.7083 1.41666Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 class="card-title">{{ $t('articles.trending.title') }}</h2>
          </div>

          <div class="trending-articles-list">
            <!-- Loading state -->
            <div v-if="loadingTrending" class="trending-loading">
              <div class="loading-spinner"></div>
            </div>

            <!-- Empty state -->
            <div v-else-if="trendingArticles.length === 0" class="trending-empty">
              <p class="empty-text">{{ $t('articles.trending.empty') }}</p>
            </div>

            <!-- Trending articles -->
            <div 
              v-else
              v-for="article in trendingArticles" 
              :key="article.id"
              class="trending-article-card" 
              @click="handleTrendingArticleClick(article)"
            >
              <h3 class="trending-article-title">{{ article.title }}</h3>
              <div class="trending-article-stats">
                <div class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ article.likes || 0 }}</span>
                </div>
                <div class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ article.commentsCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleCardLine from '@/components/ArticleCardLine.vue'
import ArticleCardSquare from '@/components/ArticleCardSquare.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import SharePanel from '@/components/SharePanel.vue'
import Toast from 'primevue/toast'
import Paginator from 'primevue/paginator'
import FireIcon from '@/assets/svgs/fire_ico.svg'

import { useArticles } from '@/composables/useArticles'
import { useTags } from '@/composables/useTags'
import { useI18n } from 'vue-i18n'
import { deleteArticle, getTrendingArticles } from '@/api/articles'
import { useAuthStore } from '@/stores/auth'
import { useViewModeStore } from '@/stores/viewMode'
import { useToast } from 'primevue/usetoast'
import { useUndoableDeleteManager } from '@/composables/useUndoableDeleteManager'
import type { Article } from '@/types/article'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const viewModeStore = useViewModeStore()
const toast = useToast()

// Используем composable для работы со статьями
const {
  articles,
  loading,
  error,
  totalArticles,
  fetchArticles,
  searchArticles
} = useArticles()

// Сохраняем все статьи для фильтрации
const allArticles = ref<Article[]>([])

// Trending articles state
const trendingArticles = ref<Article[]>([])
const loadingTrending = ref(false)

// Delete dialog state
const isDeleteDialogOpen = ref(false)
const isDeleting = ref(false)
const articleToDelete = ref<{ id: number; title: string } | null>(null)

// Report panel state
const isReportPanelOpen = ref(false)
const selectedReasons = ref<string[]>([])
const articleToReport = ref<{ id: number; title: string } | null>(null)

// Share panel state
const isSharePanelOpen = ref(false)
const articleToShare = ref<{ id: number; title: string } | null>(null)
const articleCardRefs = new Map<number, ComponentPublicInstance | Element>()

// Обработчик обновления статей (используется в event listener и watch)
const handleArticlesRefresh = async () => {
  console.log('🔄 Refreshing articles list...')
  await fetchArticles(first.value, rows.value)
  allArticles.value = [...articles.value]
  // Применяем текущие фильтры после обновления
  if (routeFilterTag.value || filters.value.difficulty || filters.value.readingTimeMin || filters.value.readingTimeMax || filters.value.tags.length > 0) {
    await applyFilters()
  }
}

// Вычисляемые свойства
const isEmpty = computed(() => articles.value.length === 0)
const totalRecords = computed(() => totalArticles.value)

const first = ref(0)
const rows = ref(10)
const pageSizeOptions = [5, 10, 20, 30, 50]

// Custom select logic
const isSelectOpen = ref(false)

const toggleSelect = () => {
  isSelectOpen.value = !isSelectOpen.value
}

const selectOption = (value: number) => {
  rows.value = value
  isSelectOpen.value = false
  handleRowsChange(value.toString())
}

// Закрытие выпадающего списка при клике вне его
const closeSelectOnOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.custom-select')) {
    isSelectOpen.value = false
  }
}

// Добавляем обработчик при монтировании компонента
onMounted(() => {
  document.addEventListener('click', closeSelectOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', closeSelectOnOutsideClick)
})

// Статьи уже пагинированы на сервере, используем их напрямую
const paginatedArticles = computed(() => articles.value)
const showBackToTop = ref(false)
const buttonOpacity = ref(1)
const searchQuery = ref('')
const isSearching = ref(false)
// Используем store для режима отображения вместо локального ref
const viewMode = computed(() => viewModeStore.mode)
const currentCardComponent = computed(() => {
  if (viewMode.value === 'line') return ArticleCardLine
  if (viewMode.value === 'square') return ArticleCardSquare
  return ArticleCard
})

// Filter states
const showFilterDropdown = ref(false)
const selectedCategory = ref<string>('all')
const filters = ref({
  difficulty: null as string | null, // 'easy', 'medium', 'hard'
  readingTimeMin: null as number | null,
  readingTimeMax: null as number | null,
  tags: [] as string[]
})
// Скрытый фильтр по маршруту (не показывается в UI)
const routeFilterTag = ref<string | null>(null)
const { allTags, filterTags } = useTags()
const tagSearchQuery = ref('')


// Проверяем, есть ли активные фильтры
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.difficulty ||
    filters.value.readingTimeMin ||
    filters.value.readingTimeMax ||
    filters.value.tags.length > 0 ||
    routeFilterTag.value
  )
})

// Подсчитываем количество активных фильтров
const activeFiltersCount = computed(() => {
  let count = 0
  
  if (filters.value.difficulty) count++
  if (filters.value.readingTimeMin || filters.value.readingTimeMax) count++
  if (filters.value.tags.length > 0) count += filters.value.tags.length
  // routeFilterTag не считаем в счетчике, так как он скрытый
  
  return count
})

// Difficulty options for filter
const difficultyOptions = computed(() => ({
  easy: t('create-article.difficulty.easy'),
  medium: t('create-article.difficulty.medium'),
  hard: t('create-article.difficulty.hard')
} as Record<string, string>))

// Filtered tags based on search query
const filteredTags = computed(() => {
  return filterTags(tagSearchQuery.value, [])
})

// const onPageChange = async (event: any) => {
//   first.value = event.first
//   rows.value = event.rows
//   console.log('Page changed:', event)
//
//   // Загружаем статьи для новой страницы
//   await fetchArticles({}, {
//     page: Math.floor(event.first / event.rows) + 1,
//     limit: event.rows
//   })
// }

// Обработчики событий ArticleCard
const handleTagClick = (tag: string) => {
  console.log('Клик по тегу:', tag)
  
  // Добавляем тег только в фильтры, не в поисковую строку
  if (!filters.value.tags.includes(tag)) {
    filters.value.tags.push(tag)
  }
  
  // Применяем фильтры
  applyFilters()
}

const handleAuthorClick = (authorId: number) => {
  console.log('Клик по автору:', authorId)
  // TODO: Реализовать фильтрацию по автору
}

const handleArticleClick = (articleId: number) => {
  console.log('HomePage: Клик по статье:', articleId, 'Авторизован:', authStore.isAuthenticated)
  // Сохраняем позицию прокрутки перед переходом
  saveScrollPosition()
  // Переход к полной статье (scrollBehavior роутера обработает прокрутку)
  router.push(`/article/${articleId}`)
}

const handleTrendingArticleClick = (article: Article) => {
  console.log('Клик по популярной статье:', article.id)
  saveScrollPosition()
  // Переход к полной статье
  router.push(`/article/${article.id}`)
}

const fetchTrendingArticlesData = async () => {
  try {
    loadingTrending.value = true
    const userId = authStore.user?.id
    trendingArticles.value = await getTrendingArticles(userId, 5)
    console.log('Популярные статьи загружены:', trendingArticles.value)
  } catch (err) {
    console.error('Ошибка загрузки популярных статей:', err)
    trendingArticles.value = []
  } finally {
    loadingTrending.value = false
  }
}

const handleArticleDeleted = (articleId: number) => {
  console.log('Статья удалена:', articleId)
  // Удаляем статью из списка
  const articleIndex = articles.value.findIndex(article => article.id === articleId)
  if (articleIndex > -1) {
    articles.value.splice(articleIndex, 1)
  }
}

// Delete article handlers
const handleDeleteArticle = (article: { id: number; title: string }) => {
  articleToDelete.value = article
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!articleToDelete.value || !authStore.user) return
  
  isDeleteDialogOpen.value = false
  const articleId = articleToDelete.value.id
  const articleIndex = articles.value.findIndex(article => article.id === articleId)
  
  const { startDelete } = useUndoableDeleteManager()
  
  // Начинаем удаление с возможностью отмены
  startDelete(
    `article-${articleId}`,
    'article',
    async () => {
      // Функция выполнится после истечения таймера
      try {
        await deleteArticle(articleId)
        // Удаляем статью из списка
        const foundIndex = articles.value.findIndex(article => article.id === articleId)
        if (foundIndex > -1) {
          articles.value.splice(foundIndex, 1)
        }
        
        // Показываем уведомление об успешном удалении
        toast.add({
          severity: 'success',
          summary: t('notifications.deleteArticle.success.summary'),
          detail: t('notifications.deleteArticle.success.detail'),
          life: 3000
        })
      } catch (error) {
        console.error('Ошибка при удалении статьи:', error)
        
        // Показываем уведомление об ошибке
        toast.add({
          severity: 'error',
          summary: t('notifications.deleteArticle.error.summary'),
          detail: t('notifications.deleteArticle.error.detail'),
          life: 3000
        })
      } finally {
        articleToDelete.value = null
      }
    },
    {
      message: t('notifications.undoDelete.article.message'),
      onUndo: async () => {
        toast.add({
          severity: 'info',
          summary: t('notifications.article.delete.cancelled.summary'),
          detail: t('notifications.article.delete.cancelled.detail'),
          life: 2000
        })
        articleToDelete.value = null
      }
    }
  )
}

const cancelDelete = () => {
  isDeleteDialogOpen.value = false
  articleToDelete.value = null
}

// Report panel handlers
const reportReasons = computed(() => [
  { id: 'spam', title: t('notifications.reportArticle.reasons.spam'), description: t('notifications.reportArticle.reasons.spamDesc') },
  { id: 'harassment', title: t('notifications.reportArticle.reasons.harassment'), description: t('notifications.reportArticle.reasons.harassmentDesc') },
  { id: 'hate', title: t('notifications.reportArticle.reasons.hate'), description: t('notifications.reportArticle.reasons.hateDesc') },
  { id: 'inappropriate', title: t('notifications.reportArticle.reasons.inappropriate'), description: t('notifications.reportArticle.reasons.inappropriateDesc') },
  { id: 'misinformation', title: t('notifications.reportArticle.reasons.misinformation'), description: t('notifications.reportArticle.reasons.misinformationDesc') },
  { id: 'copyright', title: t('notifications.reportArticle.reasons.copyright'), description: t('notifications.reportArticle.reasons.copyrightDesc') },
  { id: 'other', title: t('notifications.reportArticle.reasons.other'), description: t('notifications.reportArticle.reasons.otherDesc') }
])

const handleReportArticle = (article: { id: number; title: string }) => {
  articleToReport.value = article
  isReportPanelOpen.value = true
  selectedReasons.value = []
}

const closeReportPanel = () => {
  isReportPanelOpen.value = false
  selectedReasons.value = []
  articleToReport.value = null
}

const confirmReport = () => {
  console.log('Report article:', articleToReport.value?.id, 'Reasons:', selectedReasons.value)
  closeReportPanel()
}

// Share panel handlers
const handleShareArticle = (article: { id: number; title: string }) => {
  articleToShare.value = article
  isSharePanelOpen.value = true
}

const closeSharePanel = () => {
  isSharePanelOpen.value = false
  
  // Сбрасываем состояние share иконки в компоненте статьи
  if (articleToShare.value) {
    const cardRef = articleCardRefs.get(articleToShare.value.id)
    if (cardRef && typeof (cardRef as any).resetShareState === 'function') {
      (cardRef as any).resetShareState()
    }
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

// Обработчик поиска
const handleSearch = async () => {
  console.log('Поиск:', searchQuery.value)
  
  // Отменяем текущий таймаут при ручном запуске поиска
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  
  if (searchQuery.value.trim().length < 2) {
    // Если запрос слишком короткий, применяем только фильтры
    isSearching.value = false
    await applyFilters()
    return
  }
  
  isSearching.value = true
  try {
    await searchArticles(searchQuery.value.trim())
    // Сохраняем результаты поиска для фильтрации
    allArticles.value = [...articles.value]
    // После поиска применяем фильтры к результатам
    if (filters.value.difficulty || filters.value.readingTimeMin || filters.value.readingTimeMax || filters.value.tags.length > 0) {
      await applyTagFilters()
    }
  } catch (error) {
    console.error('Ошибка поиска:', error)
  }
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
const handleResetFilters = async () => {
  // Очищаем только фильтры, но не поисковую строку
  isSearching.value = false
  filters.value = {
    difficulty: null,
    readingTimeMin: null,
    readingTimeMax: null,
    tags: []
  }
  showFilterDropdown.value = false
  console.log('Фильтры сброшены')
  // Восстанавливаем статьи с текущими параметрами пагинации
  await fetchArticles(first.value, rows.value)
  allArticles.value = [...articles.value]
}

// Отдельная функция для полного сброса (включая поиск)
const handleClearSearch = async () => {
  searchQuery.value = ''
  isSearching.value = false
  filters.value = {
    difficulty: null,
    readingTimeMin: null,
    readingTimeMax: null,
    tags: []
  }
  showFilterDropdown.value = false
  console.log('Поиск и фильтры сброшены')
  // Восстанавливаем статьи с текущими параметрами пагинации
  await fetchArticles(first.value, rows.value)
  allArticles.value = [...articles.value]
}

// Filter handlers
const toggleFilterDropdown = () => {
  showFilterDropdown.value = !showFilterDropdown.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-section')) {
    showFilterDropdown.value = false
  }
}

const handleDifficultyFilter = (difficulty: string | null) => {
  filters.value.difficulty = difficulty
  applyFilters()
}

const handleReadingTimeFilter = (min: number | null, max: number | null) => {
  filters.value.readingTimeMin = min
  filters.value.readingTimeMax = max
  applyFilters()
}

const handleTagFilter = (tag: string) => {
  const index = filters.value.tags.indexOf(tag)
  if (index > -1) {
    filters.value.tags.splice(index, 1)
  } else {
    filters.value.tags.push(tag)
  }
  applyFilters()
}

// Обработчик клика по категории (пока только визуальное переключение)
const handleCategoryClick = (category: string) => {
  selectedCategory.value = category
  console.log('Selected category:', category)
  // В будущем здесь будет логика фильтрации
}

const removeTag = (tag: string) => {
  // Удаляем тег из фильтров
  const index = filters.value.tags.indexOf(tag)
  if (index > -1) {
    filters.value.tags.splice(index, 1)
  }
  
  // Применяем фильтры
  applyFilters()
}

// Tag search handler
const onTagSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  tagSearchQuery.value = target.value
}

const applyFilters = async () => {
  console.log('Применяем фильтры:', filters.value)
  
  // Если есть активные фильтры или скрытый фильтр по маршруту, применяем их
  if (filters.value.difficulty || filters.value.readingTimeMin || filters.value.readingTimeMax || filters.value.tags.length > 0 || routeFilterTag.value) {
    await applyTagFilters()
  } else {
    // Если нет фильтров, восстанавливаем все статьи
    if (allArticles.value.length > 0) {
      articles.value = [...allArticles.value]
    } else {
      await fetchArticles()
      allArticles.value = [...articles.value]
    }
  }
}

const applyTagFilters = async () => {
  try {
    // Если allArticles пустой, загружаем все статьи сначала
    if (allArticles.value.length === 0) {
      await fetchArticles()
      allArticles.value = [...articles.value]
    }
    
    // Используем все статьи для фильтрации
    let filteredArticles = [...allArticles.value]
    
    console.log('Исходные статьи для фильтрации:', filteredArticles.length)
    console.log('Фильтр сложности:', filters.value.difficulty)
    
    // Объединяем теги из фильтров и скрытый тег маршрута
    const allFilterTags = [...filters.value.tags]
    if (routeFilterTag.value && !allFilterTags.includes(routeFilterTag.value)) {
      allFilterTags.push(routeFilterTag.value)
    }
    
    // Фильтр по тегам (включая скрытый тег маршрута)
    if (allFilterTags.length > 0) {
      filteredArticles = filteredArticles.filter(article => 
        allFilterTags.some(tag => article.tags.includes(tag))
      )
      console.log('После фильтрации по тегам:', filteredArticles.length)
    }
    
    // Фильтр по сложности
    if (filters.value.difficulty) {
      filteredArticles = filteredArticles.filter(article => {
        const matches = article.difficulty === filters.value.difficulty
        console.log(`Статья "${article.title}" сложность: ${article.difficulty}, фильтр: ${filters.value.difficulty}, совпадает: ${matches}`)
        return matches
      })
      console.log('После фильтрации по сложности:', filteredArticles.length)
    }
    
    // Фильтр по времени чтения (примерная оценка)
    if (filters.value.readingTimeMin || filters.value.readingTimeMax) {
      filteredArticles = filteredArticles.filter(article => {
        const estimatedReadingTime = Math.ceil(article.content.length / 1000) // Примерно 1000 символов в минуту
        const minTime = filters.value.readingTimeMin || 0
        const maxTime = filters.value.readingTimeMax || Infinity
        return estimatedReadingTime >= minTime && estimatedReadingTime <= maxTime
      })
      console.log('После фильтрации по времени чтения:', filteredArticles.length)
    }
    
    // Обновляем список статей
    articles.value = filteredArticles
    console.log('Итоговое количество статей:', articles.value.length)
  } catch (error) {
    console.error('Ошибка при применении фильтров:', error)
  }
}

// Navigation handlers
// setActiveSection больше не нужна, так как роутинг управляет состоянием

const handlePageChange = async (event: any) => {
  first.value = event.first
  rows.value = event.rows
  console.log('Page changed:', event)
  
  // Загружаем статьи с сервера для новой страницы
  await fetchArticles(event.first, event.rows)
  
  // Прокручиваем страницу вверх при смене страницы
  scrollToTop()
}

const handleRowsChange = async (value: string) => {
  const size = Number(value)
  if (!Number.isFinite(size) || size <= 0) return
  rows.value = size
  first.value = 0
  
  // Загружаем статьи с сервера с новым размером страницы
  await fetchArticles(0, size)
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
    buttonOpacity.value = opacity
    backToTopBtn.style.opacity = opacity.toString()

    // Always use fixed positioning to avoid "flying to stratosphere" issue
    backToTopBtn.style.position = 'fixed'
    backToTopBtn.style.bottom = '30px'
    backToTopBtn.style.left = '30px'
    backToTopBtn.style.top = 'auto'
    backToTopBtn.classList.remove('above-footer')
  }
}

// Автоматическая фильтрация по маршруту (скрытая, без добавления тегов в UI)
watch(() => route.path, async (newPath, oldPath) => {
  // Определяем тег для фильтрации на основе маршрута
  let filterTag: string | null = null
  
  if (newPath === '/news') {
    filterTag = 'news'
  } else if (newPath === '/research') {
    filterTag = 'research'
  } else if (newPath === '/development') {
    filterTag = 'development'
  }
  
  // Устанавливаем скрытый фильтр по маршруту (не добавляем в filters.tags)
  routeFilterTag.value = filterTag
  
  // Применяем фильтр только если статьи уже загружены
  if ((filterTag || (newPath === '/' && oldPath && oldPath !== '/')) && (allArticles.value.length > 0 || articles.value.length > 0)) {
    await applyFilters()
  }
})

// Сохранение позиции прокрутки перед уходом со страницы
const saveScrollPosition = () => {
  const scrollY = window.scrollY
  sessionStorage.setItem(`scroll:${route.path}`, scrollY.toString())
}

// Управление sticky позиционированием боковой панели при приближении к футеру
const sidebarRef = ref<HTMLElement | null>(null)
let rafId: number | null = null

const updateSidebarSticky = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    if (!sidebarRef.value) return
    
    const sidebar = sidebarRef.value
    const footer = document.querySelector('.footer-wrapper') as HTMLElement
    
    if (!footer) return
    
    const footerRect = footer.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const footerTop = footerRect.top
    
    // Получаем высоту хедера из CSS переменной
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
    
    // Константы
    const footerGap = 20
    const minTopOffset = headerHeight + 20 // Учитываем высоту хедера
    
    // Если футер еще не достиг viewport
    if (footerTop > windowHeight) {
      // Обычный sticky без ограничений, но с учетом хедера
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = 'auto'
      return
    }
    
    // Футер достиг viewport - устанавливаем bottom чтобы sidebar упирался в футер с отступом
    // Используем только когда футер реально виден и близко
    if (footerTop < windowHeight) {
      const bottomOffset = windowHeight - footerTop + footerGap
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = `${bottomOffset}px`
    } else {
      // Футер еще далеко - обычный sticky
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = 'auto'
    }
  })
}

onMounted(async () => {
  // Инициализируем позицию sidebar
  await nextTick()
  setTimeout(() => {
    updateSidebarSticky()
  }, 100)
  
  window.addEventListener('scroll', () => {
    handleScroll()
    updateSidebarSticky()
  }, { passive: true })
  
  // Слушаем изменения высоты хедера
  window.addEventListener('header:heightChanged', () => {
    updateSidebarSticky()
  })
  
  document.addEventListener('click', handleClickOutside)
  // Слушаем события изменения режима отображения из AppHeader
  window.addEventListener('articles:viewMode', (e: Event) => {
    const mode = (e as CustomEvent).detail
    if (mode === 'default' || mode === 'line' || mode === 'square') {
      viewModeStore.setMode(mode)
    }
  })
  
  // Слушаем события обновления статей (например, после создания новой статьи)
  window.addEventListener('articles:refresh', handleArticlesRefresh)
  
  // При первой загрузке устанавливаем скрытый фильтр по маршруту
  const currentPath = route.path
  let filterTag: string | null = null
  
  if (currentPath === '/news') {
    filterTag = 'news'
  } else if (currentPath === '/research') {
    filterTag = 'research'
  } else if (currentPath === '/development') {
    filterTag = 'development'
  }
  
  // Устанавливаем скрытый фильтр (не добавляем в filters.tags)
  routeFilterTag.value = filterTag
  
  // Загружаем первую страницу статей с пагинацией
  await fetchArticles(0, rows.value)
  console.log('Статьи загружены следующие:', articles.value)
  
  // Сохраняем все статьи для фильтрации
  allArticles.value = [...articles.value]
  
  // Загружаем популярные статьи
  await fetchTrendingArticlesData()
  
  // Применяем фильтры после загрузки
  if (filterTag || filters.value.difficulty || filters.value.readingTimeMin || filters.value.readingTimeMax || filters.value.tags.length > 0) {
    await applyFilters()
  }
  
  // Восстанавливаем позицию прокрутки после полной загрузки и рендеринга контента
  await nextTick()
  // Даём время на полный рендеринг DOM
  setTimeout(() => {
    // Восстанавливаем прокрутку ТОЛЬКО если ранее поставили флаг восстановления
    const shouldRestore = sessionStorage.getItem('restore:/') === '1'
    if (shouldRestore) {
      const savedScroll = sessionStorage.getItem(`scroll:${route.path}`)
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10)
        if (scrollY > 0) {
          window.scrollTo({ top: scrollY, behavior: 'instant' })
        }
      }
      // Сразу сбрасываем флаг, чтобы при переходе с других страниц открывать сверху
      sessionStorage.removeItem('restore:/')
    } else {
      // Без флага всегда начинаем с самого верха
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    // Обновляем позицию sidebar после восстановления прокрутки
    updateSidebarSticky()
  }, 150)
})

// Watch на route.query.refresh для обновления статей при переходе с query параметром
watch(() => route.query.refresh, async (refresh) => {
  if (refresh) {
    console.log('🔄 Route refresh query detected, refreshing articles...')
    await handleArticlesRefresh()
    // Удаляем query параметр из URL без перезагрузки страницы
    router.replace({ path: route.path, query: {} })
  }
})

// Сохраняем позицию прокрутки перед уходом со страницы
watch(() => route.path, (newPath, oldPath) => {
  // Если уходим со страницы статей, сохраняем позицию
  if ((oldPath === '/' || oldPath === '/news' || oldPath === '/research' || oldPath === '/development') && 
      !newPath.startsWith('/article/') && newPath !== oldPath) {
    // Сохраняем позицию и ставим флаг: вернёмся в этот раздел — восстановим
    saveScrollPosition()
    sessionStorage.setItem('restore:/', '1')
  }
  
  // Если переходим на главную, обновляем статьи
  if (newPath === '/' && oldPath !== '/') {
    handleArticlesRefresh()
  }
})

onBeforeUnmount(() => {
  // Сохраняем позицию перед размонтированием
  saveScrollPosition()
})

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('articles:viewMode', () => {})
  window.removeEventListener('articles:refresh', handleArticlesRefresh)
})
</script>

<style scoped>
@import '@/assets/main.scss';

.articles-page {
  background-color: var(--bg-primary);
  min-height: calc(100vh - 80px);
  width: 100%;
  padding-bottom: 0;
  margin-bottom: 0;
}

.articles-page .articles-container {
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px;
  padding-top: calc(var(--header-height, 0px));
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: 0 12px;
    padding-top: calc(var(--header-height, 0px));
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 0 20px;
    padding-top: calc(var(--header-height, 0px));
    max-width: 1000px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    padding: 0 24px;
    padding-top: calc(var(--header-height, 0px));
    max-width: 1400px;
  }
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
  gap: 12px;
}

.search-container {
  background-color: var(--bg-secondary);
  border-radius: 32px;
  display: flex;
  align-items: center;
  position: relative;

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

.filter-icon-wrapper {
  position: relative;
  margin-left: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: var(--text-secondary);
}

.search-icon:hover {
  transform: scale(1.1);
  opacity: 0.8;
  color: var(--text-primary);
}

.search-icon:active {
  transform: scale(0.95);
}

.search-icon.active {
  color: var(--primary-violet);
  transform: scale(1.15);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
}

.search-icon.active:hover {
  color: #3b82f6;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
}

/* Стили для иконки с активными фильтрами (когда дропдаун закрыт) */
.search-icon.has-filters {
  color: var(--primary-violet);
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.3));
}

.search-icon.has-filters:hover {
  color: #3b82f6;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

/* Индикатор активных фильтров (точка с счетчиком) */
.filter-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background-color: var(--primary-violet);
  border-radius: 9px;
  border: 2px solid var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  z-index: 100;
  animation: pulse 2s ease-in-out infinite;
}

.filter-count {
  color: white;
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-sans);
  line-height: 1;
  text-align: center;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(139, 92, 246, 0.6);
  }
}

.search-divider {
  width: 2px;
  height: 38px;
  margin-left: 20px;
  background-color: var(--text-secondary);
  border-radius: 30px;
  opacity: 0.35;
}

.search-icon-2 {
  margin-left: 20px;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.search-icon-2:hover {
  transform: scale(1.1);
  opacity: 0.8;
  color: var(--text-primary);
}

.search-icon-2:active {
  transform: scale(0.95);
}

.search-input-container {
  margin-left: 16px;
  width: 912px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.search-input {
  width: 100%;
  height: 50px;
  background-color: var(--bg-primary);
  border-radius: 25px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  padding-left: 16px;
  padding-right: 60px; /* Отступ для кнопки очистки */
  border: 5px solid transparent;
  outline: none;
  transition: padding-left 0.3s ease;
  /* Скрываем стандартный курсор */
  caret-color: transparent;
}

.search-input:focus {
  padding-left: 16px;
  border: 2px solid #ffffff;
  box-shadow: none;
  animation: borderPulse 1.6s ease-in-out infinite;
}

@keyframes borderPulse {
  0%, 100% { border-color: rgba(255, 255, 255, 1); }
  50% { border-color: rgba(255, 255, 255, 0.65); }
}

/* Добавляем отступ для текста, когда есть теги */
.search-input.has-tags {
  padding-left: 320px; /* Увеличенный отступ для контейнера тегов */
}

.selected-tags {
  position: absolute;
  top: 50%;
  left: 24px; /* Увеличиваем отступ от левого края */
  transform: translateY(-50%);
  display: flex;
  gap: 6px;
  pointer-events: none;
  z-index: 1;
  align-items: center;
  animation: fadeInUp 0.3s ease-out;
  max-width: 280px; /* Примерно ширина двух тегов */
  overflow: hidden;
  width: fit-content;
}

/* Ограничиваем ширину контейнера тегов */
.selected-tags:not(.scrollable) {
  max-width: 280px;
}

.selected-tags.scrollable {
  max-width: 280px;
  width: 280px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  scroll-behavior: smooth;
  padding-bottom: 2px;
}

.selected-tags.scrollable::-webkit-scrollbar {
  height: 4px;
}

.selected-tags.scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.selected-tags.scrollable::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.selected-tags.scrollable::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateY(0);
  }
}



.selected-tag {
  background-color: var(--primary-violet);
  color: white;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-family: var(--font-sans);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 140px;
  min-width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: tagSlideIn 0.3s ease-out;
  flex-shrink: 0;
}

@keyframes tagSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.selected-tag:hover {
  background-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.25);
}

.selected-tag svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.selected-tag:hover svg {
  opacity: 1;
}

.search-input::placeholder {
  color: var(--text-third);
  opacity: 0.3;
}

/* Clear Search Button */
.clear-search-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  transform: translateY(-50%) scale(1.1);
}

/* Category Filter Panel */
.category-filter-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 32px;
  padding: 12px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  margin-top: 12px;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 16px;
    gap: 8px;
    border-radius: 25px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    max-width: 700px;
    padding: 11px 18px;
    gap: 10px;
    border-radius: 28px;
  }

  @media (min-width: 1025px) {
    width: 1060px;
    padding: 12px 20px;
    gap: 12px;
    border-radius: 32px;
  }
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: var(--bg-primary);
  border: 2px solid transparent;
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  flex: 1;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 14px;
    gap: 6px;
    border-radius: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 11px 16px;
    font-size: 15px;
    gap: 7px;
    border-radius: 18px;
  }
}

.category-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transition: left 0.5s ease;
}

.category-btn:hover::before {
  left: 100%;
}

.category-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.category-btn.active {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
  color: var(--text-primary);
}

.category-btn.active::before {
  display: none;
}

.category-btn.active:hover {
  background-color: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

.category-icon {
  flex-shrink: 0;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.category-btn:hover .category-icon {
  opacity: 1;
  transform: scale(1.1);
}

.category-btn.active .category-icon {
  opacity: 1;
  color: white;
}

@media (max-width: 480px) {
  .category-filter-panel {
    padding: 8px 10px;
    gap: 4px;
  }
  
  .category-btn {
    padding: 8px 8px;
    font-size: 12px;
    gap: 4px;
    flex-direction: column;
  }
  
  .category-icon {
    width: 16px;
    height: 16px;
  }
}

@media (min-width: 481px) and (max-width: 640px) {
  .category-btn {
    padding: 10px 10px;
    font-size: 13px;
    gap: 5px;
  }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
}

/* Articles List Container */
.articles-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1; /* гарантируем, что список статей и его дропдауны над сайдбаром */

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

/* Cards flow for list/default */
.articles-list-vertical {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Grid for square mode: 2 columns */
.articles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (min-width: 1025px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Search Results Header */
.search-results-header {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 10px;
  border-left: 4px solid var(--primary-violet);
}

.search-results-header h3 {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 8px 0;
}

.search-results-count {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0;
}

/* Pagination Container */
.pagination-container {
  display: flex;
  justify-content: center;
  padding-bottom: 0;
  padding-top: 20px;
  margin-bottom: 0;
  background-color: transparent;
  gap: 12px;
}

.page-size-control { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  position: relative;
}

.page-size-label { 
  color: var(--text-secondary); 
  font-family: var(--font-sans); 
  font-weight: bold; 
}

/* Custom Select Styles */
.custom-select {
  position: relative;
  min-width: 90px;
}

.select-trigger {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 10px 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  user-select: none;
}

.select-trigger:hover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.select-trigger:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.select-value {
  flex: 1;
  text-align: left;
}

.select-arrow {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-primary);
  flex-shrink: 0;
}

.select-arrow.is-rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  margin-bottom: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  z-index: 40000; /* above footer */
  overflow: hidden;
  animation: dropdownSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.select-option {
  padding: 12px 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.select-option.is-selected {
  background: var(--accent-primary);
  color: white;
  font-weight: 700;
  box-shadow: inset 0 0 0 9999px rgba(139, 92, 246, 0.15);
}

/* Закрытие при клике вне элемента */
.custom-select.is-open::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
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
  font-family: var(--font-sans);
  font-weight: bold;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-bottom: 20px;
}

.reset-filters-btn {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 24px;
  padding-right: 24px;
  border-radius: 8px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.reset-filters-btn:hover {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
}

/* Second Right Block - Sidebar Section */
.sidebar-section {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  z-index: 0;
  transition: top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
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
  align-items: center;
  margin-top: 24px;
  padding: 0 100px 10px 0px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 0 20px 8px 0px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    margin-top: 22px;
    padding: 0 60px 10px 0px;
  }
}

.card-icon {
  margin-left: 24px;
  width: 28px;
  height: 30px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    margin-left: 20px;
    width: 24px;
    height: 26px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    margin-left: 22px;
    width: 26px;
    height: 28px;
  }
}

.card-title {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin-left: 12px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 22px;
    margin-left: 10px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 25px;
    margin-left: 11px;
  }
}

.info-value {
  color: var(--text-secondary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  margin-left: 8px;
  margin: 0;
}

/* Trending Articles Card */
.trending-articles-card {
  background-color: var(--bg-secondary);
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  padding: 0 0 20px 0;

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100%;
    min-height: 580px;
    border-radius: 25px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 280px;
    min-height: 630px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    width: 300px;
    min-height: 670px;
  }
}

.trending-articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
  margin-top: 10px;
}

/* Loading state */
.trending-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary-violet, #8b5cf6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.trending-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  padding: 20px;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: bold;
  text-align: center;
  margin: 0;
  opacity: 0.7;
  max-height: 60px;
  overflow-y: hidden;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.trending-article-card {
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-article-card:hover {
  background-color: rgba(255, 255, 255, 0.03);
  border-color: #ffffff;
  box-shadow: none;
  transform: translateY(-2px);
}

.trending-article-title {
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trending-article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 500;
}

.stat-item svg {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.stat-item:hover svg {
  opacity: 1;
}

/* Responsive adjustments for trending articles */
@media (max-width: 768px) {
  .trending-articles-list {
    padding: 0 16px;
    gap: 10px;
  }
  
  .trending-article-card {
    padding: 12px;
    gap: 6px;
  }
  
  .trending-article-title {
    font-size: 14px;
  }
  
  .trending-article-stats {
    gap: 12px;
  }
  
  .stat-item {
    font-size: 11px;
    gap: 4px;
  }
}

/* Articles Container Animation */
.articles-list-container {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

.articles-list-container.shifted-down {
  transform: translateY(50px);
  /* Ensure pagination doesn't get covered by the footer when filters are open */
  padding-bottom: 20px;
}

/* Filter Dropdown */
.filter-dropdown {
  background-color: var(--bg-secondary);
  border-radius: 25px;
  padding: 0;
  margin-top: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--bg-primary);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-dropdown.show {
  max-height: 600px;
  padding: 24px;
  opacity: 1;
  transform: translateY(0);
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-primary);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-section:last-of-type {
  margin-bottom: 0;
}

.filter-title {
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin: 0 0 12px 0;
}

.difficulty-circles {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.difficulty-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.difficulty-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.difficulty-circle:focus {
  outline: none;
  border-color: var(--primary-violet);
}

/* Color variants for different difficulties */
.difficulty-circle.difficulty-easy:hover {
  border-color: rgba(34, 197, 94, 0.7);
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.difficulty-circle.difficulty-easy.selected {
  border-color: #22c55e;
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.difficulty-circle.difficulty-medium:hover {
  border-color: rgba(245, 158, 11, 1);
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.difficulty-circle.difficulty-medium.selected {
  border-color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.difficulty-circle.difficulty-hard:hover {
  border-color: rgba(239, 68, 68, 1);
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.difficulty-circle.difficulty-hard.selected {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.difficulty-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
  fill: currentColor;
}

.difficulty-circle:hover .difficulty-icon {
  transform: scale(1.1);
}

.difficulty-circle.selected .difficulty-icon {
  transform: scale(1.1);
}

/* Цвета для иконок в зависимости от сложности */
.difficulty-circle.difficulty-easy .difficulty-icon {
  fill: #22c55e !important;
}

.difficulty-circle.difficulty-medium .difficulty-icon {
  fill: #f59e0b !important;
}

.difficulty-circle.difficulty-hard .difficulty-icon {
  fill: #ef4444 !important;
}

/* Hover эффекты для иконок */
.difficulty-circle:hover .difficulty-icon {
  transform: scale(1.1);
}

/* ЗАПОЛНЕНИЕ иконки цветом при выборе */
.difficulty-circle.selected.difficulty-easy .difficulty-icon {
  fill: #16a34a !important; /* Полное заполнение зеленым */
}

.difficulty-circle.selected.difficulty-medium .difficulty-icon {
  fill: #d97706 !important; /* Полное заполнение оранжевым */
}

.difficulty-circle.selected.difficulty-hard .difficulty-icon {
  fill: #dc2626 !important; /* Полное заполнение красным */
}

.reading-time-inputs {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 120px;
}

.time-input-group label {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.time-input {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: bold;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
}

.time-input:focus {
  border-color: var(--primary-violet);
}

.time-input::placeholder {
  color: var(--text-third);
  opacity: 0.6;
}

.tag-search-container {
  position: relative;
  margin-bottom: 12px;
}

.tag-search-input {
  width: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px 12px 10px 40px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}

.tag-search-input:focus {
  border-color: var(--primary-violet);
  background-color: var(--bg-primary);
}

.tag-search-input::placeholder {
  color: var(--text-third);
  opacity: 0.6;
}

.tag-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.filter-tag {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tag:hover {
  background-color: var(--btn-primary);
  color: var(--text-primary);
}

.filter-tag.active {
  background-color: var(--primary-violet);
  color: white;
  border-color: var(--primary-violet);
}

.filter-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--bg-primary);
}

.filter-reset-btn,
.filter-close-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.filter-reset-btn {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
}

.filter-reset-btn:hover {
  background-color: var(--btn-primary);
  color: var(--text-primary);
}

.filter-close-btn {
  background-color: var(--primary-violet);
  color: white;
}

.filter-close-btn:hover {
  background-color: #3b82f6;
}

/* Mobile responsiveness for filter dropdown */
@media (max-width: 768px) {
  .filter-dropdown {
    margin-top: 12px;
    padding: 16px;
  }
  
  .reading-time-inputs {
    flex-direction: column;
  }
  
  .time-input-group {
    min-width: 100%;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .filter-reset-btn,
  .filter-close-btn {
    width: 100%;
  }
  
  .search-input-container {
    width: 100%;
    margin-left: 0;
  }
  
  .selected-tags {
    left: 12px; /* Отступ на мобильных */
    top: 50%;
    transform: translateY(-50%);
    max-width: 200px; /* Меньше на мобильных */
    width: fit-content;
  }
  
  .selected-tags.scrollable {
    max-width: 200px;
    width: 200px;
  }
  
  .selected-tag {
    font-size: 11px;
    padding: 4px 8px;
    max-width: 80px;
    min-width: fit-content;
    border-radius: 12px;
  }
  
  .search-input.has-tags {
    padding-left: 240px; /* Увеличенный отступ для мобильных */
  }
}

/* Report Panel Styles */
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
  z-index: 30000;
}

.report-panel-content {
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 550px;
  max-width: 650px;
  max-height: 80vh;
  overflow-y: auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.report-header h3 {
  color: var(--text-primary);
  font-size: 28px;
  font-family: var(--font-sans);
  font-weight: 700;
  margin: 0;
}

.report-message {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans);
  margin: 0 0 20px 0;
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.reason-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--bg-primary);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.reason-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.reason-item.selected {
  background-color: rgba(140, 0, 255, 0.1);
  border-color: var(--primary-violet);
}

.reason-checkbox {
  position: absolute;
  opacity: 0;
}

.reason-checkmark {
  position: relative;
  width: 24px;
  height: 24px;
  border: 2px solid var(--text-secondary);
  border-radius: 8px;
  margin-right: 14px;
  flex-shrink: 0;
}

.reason-checkbox:checked + .reason-checkmark {
  background-color: var(--primary-violet);
  border-color: var(--primary-violet);
}

.reason-checkbox:checked + .reason-checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.reason-title {
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
}

.reason-description {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 1.4;
}

.report-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.report-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.report-btn.cancel {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: 2px solid var(--text-secondary);
}

.report-btn.cancel:hover {
  background-color: var(--text-secondary);
  color: var(--bg-primary);
}

.report-btn.submit {
  background-color: var(--primary-violet);
  color: white;
}

.report-btn.submit:hover:not(:disabled) {
  background-color: var(--primary-blue);
}

.report-btn.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-left: auto;
  flex-shrink: 0;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .report-panel-content {
    padding: 24px;
    min-width: 320px;
    max-width: 90vw;
    margin: 0 20px;
  }
  .report-header h3 {
    font-size: 24px;
  }
  .report-message {
    font-size: 16px;
  }
}

</style>
