import { ref, computed } from 'vue'
import { getUserArticles } from '@/api/articles'
import type { UserArticle } from '@/types/article'

export function useUserArticles() {
  const articles = ref<UserArticle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isEmpty = computed(() => !loading.value && articles.value.length === 0)

  const fetchUserArticles = async (skip: number = 0, limit: number = 100) => {
    try {
      loading.value = true
      error.value = null
      const list = await getUserArticles(skip, limit)
      articles.value = Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch user articles:', e)
      error.value = 'Failed to load your articles'
    } finally {
      loading.value = false
    }
  }

  const refreshArticles = async () => {
    await fetchUserArticles()
  }

  return {
    articles,
    loading,
    error,
    isEmpty,
    fetchUserArticles,
    refreshArticles,
  }
}


