<template>
  <div class="test-container">
    <h1>Тест иконок аватаров</h1>

    <div class="test-section">
      <h2>С аватаром:</h2>
      <ArticleCard
        :article="articleWithAvatar"
        @tag-click="handleTagClick"
        @author-click="handleAuthorClick"
        @article-click="handleArticleClick"
      />
    </div>

    <div class="test-section">
      <h2>Без аватара (иконка вопроса):</h2>
      <ArticleCard
        :article="articleWithoutAvatar"
        @tag-click="handleTagClick"
        @author-click="handleAuthorClick"
        @article-click="handleArticleClick"
      />
    </div>

    <div class="test-section">
      <h2>Сравнение аватаров:</h2>
      <div class="avatars-comparison">
        <div class="avatar-example">
          <div class="avatar-with-image">
            <img src="https://via.placeholder.com/85x85/434956/FFFFFF?text=A" alt="Avatar" />
          </div>
          <p>С аватаром</p>
        </div>

        <div class="avatar-example">
          <div class="avatar-with-question">
            <svg
              class="question-icon"
              width="32"
              height="32"
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
          <p>Без аватара</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import type { Article } from '@/types/article'

// Статья с аватаром
const articleWithAvatar: Article = {
  id: 1,
  title: 'Статья с аватаром автора',
  content: 'Это статья от пользователя с установленным аватаром.',
  excerpt: 'Показывает, как выглядит карточка с аватаром.',
  author: {
    id: 1,
    username: 'Аякиро',
    avatar: 'https://via.placeholder.com/85x85/434956/FFFFFF?text=A',
    email: 'pinicilin@example.com',
    createdAt: new Date('2024-01-01')
  },
  tags: ['Vue.js', 'TypeScript', 'Frontend'],
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

// Статья без аватара
const articleWithoutAvatar: Article = {
  id: 2,
  title: 'Статья без аватара автора',
  content: 'Это статья от пользователя без установленного аватара.',
  excerpt: 'Показывает, как выглядит карточка с иконкой вопроса.',
  author: {
    id: 4,
    username: 'Anonymous',
    avatar: undefined, // Нет аватара
    email: 'anonymous@example.com',
    createdAt: new Date('2024-01-01')
  },
  tags: ['React', 'JavaScript', 'Web'],
  createdAt: new Date('2024-01-14T15:45:00Z'),
  updatedAt: new Date('2024-01-15T09:20:00Z'),
  publishedAt: new Date('2024-01-14T15:45:00Z'),
  status: 'published',
  views: 850,
  likes: 23,
  commentsCount: 8,
  featured: false,
  category: 'Guide',
  readingTime: 5
}

// Обработчики событий
const handleTagClick = (tag: string) => {
  console.log('Клик по тегу:', tag)
}

const handleAuthorClick = (authorId: number) => {
  console.log('Клик по автору:', authorId)
}

const handleArticleClick = (articleId: number) => {
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

h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  margin-top: 40px;
}

.test-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatars-comparison {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.avatar-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-with-image,
.avatar-with-question {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-with-image {
  background-color: #434956;
}

.avatar-with-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-with-question {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  transition: all 0.2s ease-in-out;
}

.avatar-with-question:hover {
  background-color: #FFFFFF;
  color: #000000;
}

.avatar-with-question:hover .question-icon {
  color: #000000;
  transform: scale(1.1);
}

.question-icon {
  color: var(--text-primary);
  transition: all 0.2s ease-in-out;
}

.avatar-example p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  text-align: center;
}
</style>
