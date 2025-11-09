<template>
  <div class="test-container">
    <h1>Тест ArticleCard</h1>

    <div class="test-article">
      <ArticleCard
        :article="testArticle"
        @tag-click="handleTagClick"
        @author-click="handleAuthorClick"
        @article-click="handleArticleClick"
      />
    </div>

    <div class="test-info">
      <h3>События:</h3>
      <ul>
        <li v-for="event in events" :key="event.id">
          {{ event.type }}: {{ event.data }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import type { Article } from '@/types/article'

// Тестовые данные
const testArticle: Article = {
  id: 1,
  title: 'Тестовая статья для проверки компонента ArticleCard',
  content: 'Это полное содержание тестовой статьи. Здесь будет подробное описание темы, примеры кода, объяснения и много другой полезной информации для читателей.',
  excerpt: 'Краткое описание тестовой статьи с основными моментами и ключевыми идеями.',
  author: {
    id: 1,
    username: 'Аякиро',
    avatar: 'https://via.placeholder.com/85x85/434956/FFFFFF?text=A',
    email: 'pinicilin@example.com',
    createdAt: new Date('2024-01-01')
  },
  tags: ['Vue.js', 'TypeScript', 'Тест', 'Frontend'],
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-16T14:20:00Z'),
  publishedAt: new Date('2024-01-15T10:30:00Z'),
  status: 'published',
  views: 1250,
  likes: 42,
  commentsCount: 15,
  featured: true,
  category: 'Tutorial',
  readingTime: 8
}

// События для отладки
const events = ref<Array<{id: number, type: string, data: string}>>([])
let eventId = 0

const addEvent = (type: string, data: string) => {
  events.value.unshift({
    id: ++eventId,
    type,
    data
  })

  // Ограничиваем количество событий
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

// Обработчики событий
const handleTagClick = (tag: string) => {
  addEvent('Tag Click', tag)
  console.log('Клик по тегу:', tag)
}

const handleAuthorClick = (authorId: number) => {
  addEvent('Author Click', `ID: ${authorId}`)
  console.log('Клик по автору:', authorId)
}

const handleArticleClick = (articleId: number) => {
  addEvent('Article Click', `ID: ${articleId}`)
  console.log('Клик по статье:', articleId)
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
}

.test-article {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.test-info {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.test-info h3 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.test-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.test-info li {
  color: var(--text-secondary);
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-primary);
}

.test-info li:last-child {
  border-bottom: none;
}
</style>
