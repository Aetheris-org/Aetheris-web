import { ref } from 'vue'
import type { Article, CreateArticleRequest } from '@/types/article'
import { useAuthStore } from '@/stores/auth'
import {
    getAllArticles,
    searchArticles as apiSearchArticles,
    getArticle as apiGetArticle,
    reactArticle as apiReact,
    createArticle as apiCreateArticle,
    updateArticle as apiUpdateArticle,
    getArticleComments,
    createArticleComment,
    reactComment as apiReactComment,
} from '@/api/articles'

const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

function generateExcerpt(content: string, length = 1400): string {
    if (!content) return ''
    const clean = content.replace(/<[^>]+>/g, '')
    return clean.length > length ? clean.slice(0, length).trimEnd() : clean
}

function getOrCreateUserId(): number {
    const key = 'anon_user_id'
    let id = localStorage.getItem(key)
    if (!id) {
        // Generate a smaller ID that fits in PostgreSQL integer (max ~2 billion)
        // Use last 8 digits of timestamp + random number to stay under 2^31
        const timestamp = Date.now()
        const smallId = (timestamp % 100000000) + Math.floor(Math.random() * 10000)
        id = String(smallId)
        localStorage.setItem(key, id)
    }
    return Number(id)
}

/**
 * Map server article to frontend Article type
 * Данные уже преобразованы в articles.ts через transformArticle,
 * но добавляем дополнительные поля для совместимости
 */
function mapServerArticle(a: any): Article {
    // Если author уже объект (из transformArticle), используем его
    // Если author строка (старый формат), преобразуем в объект
    let authorObj: { id: number; username: string; avatar?: string | null } = {
        id: 0,
        username: 'Anonymous'
    }
    
    if (typeof a.author === 'object' && a.author !== null) {
        authorObj = {
            id: a.author.id || a.author_id || 0,
            username: a.author.username || 'Anonymous',
            avatar: a.author.avatar || a.author_avatar || null
        }
    } else if (typeof a.author === 'string') {
        // Старый формат (совместимость)
        authorObj = {
            id: a.author_id || 0,
            username: a.author,
            avatar: a.author_avatar || null
        }
    }
    
    const article: Article = {
        id: a.id,
        title: a.title,
        content: a.content,
        excerpt: a.excerpt || generateExcerpt(a.content),
        author: authorObj,
        tags: Array.isArray(a.tags) ? a.tags : (typeof a.tags === 'string' ? a.tags.split(',') : []),
        createdAt: a.createdAt || a.created_at || new Date().toISOString(),
        updatedAt: a.updatedAt || a.updated_at || undefined,
        status: a.status || 'published',
        difficulty: a.difficulty || 'medium',
        likes: a.likes ?? a.likes_count ?? 0,
        dislikes: a.dislikes ?? a.dislikes_count ?? 0,
        commentsCount: a.commentsCount ?? a.comments_count ?? 0,
        userReaction: a.userReaction ?? a.user_reaction ?? null,
        previewImage: a.previewImage || a.preview_image || null,
        author_id: authorObj.id || a.author_id || undefined, // Для навигации
    }
    return article
}

export function useArticles() {
    const auth = useAuthStore()
    const totalArticles = ref(0)
    
    async function fetchArticles(start: number = 0, limit: number = 10) {
        loading.value = true
        error.value = null
        try {
            const userId = getOrCreateUserId()
            const response = await getAllArticles(userId, start, limit)
            articles.value = response.data.map(mapServerArticle)
            totalArticles.value = response.total
        } catch (e: any) {
            error.value = e.message || 'Ошибка загрузки'
        } finally {
            loading.value = false
        }
    }

    async function searchArticles(query: string) {
        loading.value = true
        error.value = null
        try {
            const userId = getOrCreateUserId()
            const raw = await apiSearchArticles(query, userId)
            articles.value = raw.map(mapServerArticle)
        } catch (e: any) {
            error.value = e.message || 'Ошибка поиска'
        } finally {
            loading.value = false
        }
    }

    async function react(articleId: number, reaction: 'like' | 'dislike') {
        try {
            const userId = getOrCreateUserId()
            const updated = await apiReact(articleId, userId, reaction)
            const mapped = mapServerArticle(updated)
            const idx = articles.value.findIndex(a => a.id === articleId)
            if (idx !== -1) articles.value[idx] = mapped
            return mapped
        } catch (e: any) {
            console.error('Ошибка при реакции', e)
            throw e
        }
    }

    async function getArticle(articleId: number) {
        try {
            const userId = getOrCreateUserId()
            const raw = await apiGetArticle(articleId, userId)
            return mapServerArticle(raw)
        } catch (e: any) {
            console.error('Ошибка при загрузке статьи', e)
            throw e
        }
    }

    async function createArticle(data: CreateArticleRequest) {
        try {
            loading.value = true
            error.value = null
            // Не отправляем author - бэкенд берет его из токена аутентификации
            // Это безопаснее, так как нельзя подделать автора статьи
            const payload = {
                ...data,
                // author не включаем - бэкенд установит его из токена
            } as any
            const rawArticle = await apiCreateArticle(payload)
            console.log('API вернул article:', rawArticle)

            const article = mapServerArticle(rawArticle)
            articles.value.unshift(article)
            console.log('rawArticle из API:', article)

            return article
        } catch (e: any) {
            error.value = e.message || 'Ошибка API при создании статьи'
            console.error(error.value)
            throw new Error(String(error.value))
        } finally {
            loading.value = false
        }
    }

    async function updateArticle(id: number, data: CreateArticleRequest) {
        try {
            loading.value = true
            error.value = null
            const rawArticle = await apiUpdateArticle(id, data)
            const article = mapServerArticle(rawArticle)
            const idx = articles.value.findIndex(a => a.id === id)
            if (idx !== -1) articles.value[idx] = article
            return article
        } catch (e: any) {
            error.value = e.message || 'Ошибка API при обновлении статьи'
            console.error(error.value)
            throw new Error(String(error.value))
        } finally {
            loading.value = false
        }
    }

    // comments
    async function fetchComments(articleId: number) {
        const userId = getOrCreateUserId()
        return await getArticleComments(articleId, userId)
    }

    async function addComment(articleId: number, text: string, parentId?: number | null) {
        // Не отправляем author_id и author_name - бэкенд берет их из токена аутентификации
        // Это безопаснее, так как нельзя подделать автора комментария
        return await createArticleComment(articleId, { text, parent_id: parentId ?? null })
    }

    async function reactCommentFn(commentId: number, reaction: 'like' | 'dislike') {
        // user_id больше не нужен - используется токен из cookies
        return await apiReactComment(commentId, reaction)
    }

    return { articles, loading, error, totalArticles, fetchArticles, searchArticles, react, getArticle, createArticle, updateArticle, fetchComments, addComment, reactCommentFn }
}
