import { ref, computed } from 'vue'
import { getUserStats, getUserArticles, getPublicUserStats, getPublicUserArticles, type UserStats } from '@/api/articles'
import type { UserArticle } from '@/types/article'
import { useAuthStore } from '@/stores/auth'

export function useProfile(targetUserId?: number | null) {
    const userStats = ref<UserStats | null>(null)
    const userArticles = ref<UserArticle[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const authStore = useAuthStore()
    
    // Вычисляем на основе текущего значения (не computed, так как targetUserId может меняться)
    const isViewingOwnProfile = computed(() => {
        const targetId = targetUserId
        return !targetId || (authStore.user && targetId === authStore.user.id)
    })

    const formattedJoinDate = computed(() => {
        if (!userStats.value?.join_date) return 'Неизвестно'
        const date = new Date(userStats.value.join_date)
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    })

    const fetchUserStats = async (userId?: number) => {
        try {
            loading.value = true
            error.value = null
            const targetId = userId || targetUserId
            const isOwn = !targetId || (authStore.user && targetId === authStore.user.id)
            console.log('🔄 Fetching user stats...', { targetId, isViewingOwn: isOwn })
            
            if (isOwn && !targetId) {
                // Свой профиль через защищенный endpoint
            userStats.value = await getUserStats()
            } else if (targetId) {
                // Чужой профиль через публичный endpoint
                userStats.value = await getPublicUserStats(targetId)
            } else {
                throw new Error('User ID not specified')
            }
            
            console.log('✅ User stats fetched:', userStats.value)
        } catch (err: any) {
            error.value = err.response?.status === 404 ? 'Пользователь не найден' : 'Ошибка загрузки статистики'
            console.error('❌ Error fetching user stats:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchUserArticles = async (userId?: number, skip: number = 0, limit: number = 100) => {
        try {
            loading.value = true
            error.value = null
            const targetId = userId || targetUserId
            const isOwn = !targetId || (authStore.user && targetId === authStore.user.id)
            console.log('🔄 Fetching user articles...', { targetId, isViewingOwn: isOwn })
            
            if (isOwn && !targetId) {
                // Свой профиль через защищенный endpoint
            userArticles.value = await getUserArticles(skip, limit)
            } else if (targetId) {
                // Чужой профиль через публичный endpoint (передаем viewer_user_id для реакций)
                const viewerId = authStore.user?.id
                userArticles.value = await getPublicUserArticles(targetId, skip, limit, viewerId)
            } else {
                throw new Error('User ID not specified')
            }
            
            console.log('✅ User articles fetched:', userArticles.value)
        } catch (err: any) {
            error.value = err.response?.status === 404 ? 'Пользователь не найден' : 'Ошибка загрузки статей'
            console.error('❌ Error fetching user articles:', err)
        } finally {
            loading.value = false
        }
    }

    const refreshProfile = async (userId?: number) => {
        await Promise.all([
            fetchUserStats(userId),
            fetchUserArticles(userId)
        ])
    }

    return {
        userStats,
        userArticles,
        loading,
        error,
        formattedJoinDate,
        isViewingOwnProfile,
        fetchUserStats,
        fetchUserArticles,
        refreshProfile
    }
}
