<template>
    <div class="articles-minimal">
        <h2>Статьи</h2>

        <div v-if="loading">Загрузка статей...</div>

        <div v-else-if="articlesToShow.length === 0">Статьи не найдены</div>

        <div v-else class="articles-list">
            <ArticleCard
                v-for="article in articlesToShow"
                :key="article.id"
                :article="article"
                @tag-click="handleTagClick"
                @author-click="handleAuthorClick"
                @article-click="handleArticleClick"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { useArticles } from '@/composables/useArticles'
import { Article } from '@/types/article'

const router = useRouter()

const {
    articles,
    loading,
    fetchArticles,
    // filterByTag,
    // filterByAuthor,
} = useArticles()

const testArticle: Article = {
    id: 1,
    title: 'Пример карточки',
    content: 'Тут типа контент',
    excerpt: 'Это тестовая карточка для проверки отображения.',
    author: { id: 1, username: 'ZimBazo' },
    tags: ['vue', 'fastapi'],
    createdAt: new Date().toISOString(),
    status: 'published',
    likes: 43,
    dislikes: 53,
    commentsCount: 354,
}

const articlesToShow = computed(() => {
    return articles.value.length > 0 ? articles.value : [testArticle]
})

const handleTagClick = (tag: string) => console.log('tag clicked', tag)
const handleAuthorClick = (id: number) => console.log('author clicked', id)
const handleArticleClick = (id: number) => {
    console.log('article clicked', id)
    router.push(`/article/${id}`)
}

onMounted(async () => {
    await fetchArticles()
    console.log('Статьи после загрузки:', articles.value)
})

</script>

<style scoped>
.articles-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
