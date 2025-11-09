<template>
    <div class="profile-container">
        <!-- Profile Header Section -->
        <div class="profile-header">
            <!-- Avatar -->
            <div 
                class="profile-avatar"
                :class="{ 'editable': isViewingOwnProfileComputed && auth.isAuthenticated }"
                @click="isViewingOwnProfileComputed && auth.isAuthenticated ? goToProfileSettings() : null"
            >
                <AvatarImage :src="safeProfileAvatar || null" :alt="(profileUser?.username || auth.user?.username || t('common.guest'))" />
                <!-- Edit overlay (only for own profile) -->
                <div v-if="isViewingOwnProfileComputed && auth.isAuthenticated" class="avatar-edit-overlay">
                    <svg 
                        class="edit-overlay-icon"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>

                <!-- User Info -->
                <div class="user-info">
                    <div class="username-with-badge">
                        <h1 class="user-nickname">
                            {{ profileUser?.username || auth.user?.username || t('common.guest') }}
                        </h1>
                        <span v-if="isViewingOwnProfileComputed" class="self-badge">{{ $t('labels.you') }}</span>
                    </div>

                    <p class="user-tag">
                        {{ profileUser ? "#" + profileUser.id : (auth.user ? "#" + auth.user.id : "#0000") }}
                    </p>

                <!-- User Stats -->
                <div class="user-stats" v-if="userStats && !loading">
                    <span class="stat-item">{{ userStats.articles_count }} {{ $t('profile_page.title1') }}</span>
                    <div class="stat-divider"></div>
                    <span class="stat-item">{{ userStats.comments_count }} {{ $t('profile_page.title2') }}</span>
                    <div class="stat-divider"></div>
                    <span class="stat-item">{{ $t('profile_page.title3') }} {{ formattedJoinDate }}</span>
                </div>
                <div class="user-stats" v-else-if="loading">
                    <span class="stat-item">Загрузка...</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons" v-if="isViewingOwnProfileComputed && auth.isAuthenticated">
                <button class="edit-button" @click="goToProfileSettings">
                    <img src="/src/assets/imgs/pen.png" alt="Edit" class="edit-icon" width="30" height="30">
                </button>

                <div class="more-options-wrapper">
                    <button ref="moreButtonRef" class="more-button" @click="toggleMoreMenu">
                        <svg class="more-icon" width="6" height="30" viewBox="0 0 6 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="3" cy="6" r="2" fill="currentColor"/>
                            <circle cx="3" cy="15" r="2" fill="currentColor"/>
                            <circle cx="3" cy="24" r="2" fill="currentColor"/>
                        </svg>
                    </button>

                    <Transition name="dropdown-fade">
                        <Teleport to="body">
                            <div v-if="showMoreMenu" class="options-dropdown" :style="optionsStyle" @click.stop>
                            <button class="dropdown-item" @click="copyProfileLink">
                                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 1 1 7 7L17 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Copy link</span>
                            </button>
                            <button class="dropdown-item" @click="copyUserId">
                                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                                    <path d="M7 10h6M7 13h6M19 7v11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>Copy ID</span>
                            </button>
                            <button class="dropdown-item" @click="openReport">
                                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Report</span>
                            </button>
                            <button class="dropdown-item" @click="openInfo">
                                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M11 12H12V16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Info</span>
                            </button>
                            </div>
                        </Teleport>
                    </Transition>
                </div>
            </div>
            <div class="action-buttons" v-else>
                <div class="more-options-wrapper">
                    <button ref="moreButtonRef" class="more-button" @click="toggleMoreMenu">
                        <svg class="more-icon" width="6" height="30" viewBox="0 0 6 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="3" cy="6" r="2" fill="currentColor"/>
                            <circle cx="3" cy="15" r="2" fill="currentColor"/>
                            <circle cx="3" cy="24" r="2" fill="currentColor"/>
                        </svg>
                    </button>

                    <Transition name="dropdown-fade">
                        <Teleport to="body">
                            <div v-if="showMoreMenu" class="options-dropdown" :style="optionsStyle" @click.stop>
                                <button class="dropdown-item" @click="copyProfileLink">
                                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 1 1 7 7L17 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Copy link</span>
                                </button>
                                <button class="dropdown-item" @click="copyUserId">
                                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                                        <path d="M7 10h6M7 13h6M19 7v11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span>Copy ID</span>
                                </button>
                                <button class="dropdown-item" @click="openReport">
                                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Report</span>
                                </button>
                                <button class="dropdown-item" @click="openInfo">
                                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M11 12H12V16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Info</span>
                                </button>
                            </div>
                        </Teleport>
                    </Transition>
                </div>
            </div>
        </div>

        <!-- Divider Line -->
        <div class="profile-divider"></div>

        <!-- Content Section -->
        <div class="profile-content">
            <div v-if="loading && !userStats" class="loading-state">
                <p class="loading-message">Загрузка статей...</p>
            </div>
            <div v-else-if="error" class="error-state">
                <p class="error-message">{{ error }}</p>
                <button @click="refreshProfile(targetUserId || undefined)" class="retry-button">Попробовать снова</button>
            </div>
            <div v-else-if="!targetUserId && !auth.isAuthenticated" class="empty-state">
                <p class="empty-message">
                    {{ $t('common.not_registered') }}
                </p>
            </div>
            <div v-else-if="articles.length === 0 && !loading" class="empty-state">
                <p class="empty-message">
                    {{ $t('common.no_articles') }}
                </p>
            </div>
            <div v-else-if="articles.length > 0" class="articles-grid">
                <ArticleCard
                    v-for="article in articles"
                    :key="article.id"
                    :article="article"
                    @tag-click="handleTagClick"
                    @author-click="handleAuthorClick"
                    @article-click="handleArticleClick"
                    @article-deleted="handleArticleDeleted"
                />
            </div>
        </div>

        <!-- Info Modal -->
        <div v-if="showInfoModal" class="modal-backdrop" @click.self="showInfoModal = false">
            <div class="modal-content">
                <h3 class="modal-title">{{ t('profile.info.title') }}</h3>
                <p class="modal-row"><strong>{{ t('profile.info.id') }}:</strong> {{ targetUserId || profileUser?.id }}</p>
                <p class="modal-row"><strong>{{ t('profile.info.nickname') }}:</strong> {{ profileUser?.username || auth.user?.username }}</p>
                <p class="modal-row" v-if="formattedJoinDate"><strong>{{ t('profile.info.joined') }}:</strong> {{ formattedJoinDate }}</p>
                <div class="modal-actions">
                    <button class="retry-button" @click="showInfoModal = false">OK</button>
                </div>
            </div>
        </div>

        <!-- Report Panel -->
        <div v-if="isReportPanelOpen" class="report-panel-overlay" @click="closeReportPanel">
          <div class="report-panel" @click.stop>
            <div class="report-panel-content">
              <div class="report-header">
                <h3 class="report-panel-title">{{ t('notifications.reportUser.title') }}</h3>
                <button @click="closeReportPanel" class="close-btn" aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <p class="report-panel-subtitle">{{ t('notifications.reportUser.subtitle') }}</p>

              <div class="report-reasons">
                <label v-for="reason in reportReasons" :key="reason.id" class="reason-item" :class="{ selected: selectedReasons.includes(reason.id) }">
                  <input type="checkbox" class="reason-checkbox" :value="reason.id" v-model="selectedReasons" />
                  <div class="reason-checkmark"></div>
                  <div class="reason-content">
                    <span class="reason-title">{{ t(`notifications.reportUser.reasons.${reason.id}`) }}</span>
                    <span class="reason-description" v-if="reason.descriptionKey">{{ t(reason.descriptionKey) }}</span>
                  </div>
                </label>
              </div>

              <div class="report-footer">
                <button @click="closeReportPanel" class="report-btn cancel">{{ t('notifications.reportUser.cancel') }}</button>
                <button @click="confirmUserReport" class="report-btn submit" :disabled="selectedReasons.length === 0">{{ t('notifications.reportUser.submit') }}</button>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from "@/stores/auth"
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/composables/useProfile'
import ArticleCard from '@/components/ArticleCard.vue'
import type { Article, UserArticle } from '@/types/article'
import { getPublicUserProfile } from '@/api/articles'
import { sanitizeAvatarUrl } from '@/utils/avatarValidation'
import { Teleport } from 'vue'
import AvatarImage from '@/components/AvatarImage.vue'

interface Props {
    userId?: string | number
}

const props = defineProps<Props>()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Получаем userId из props или route params
const targetUserId = computed(() => {
    if (props.userId) {
        const id = typeof props.userId === 'string' ? parseInt(props.userId, 10) : props.userId
        return isNaN(id) ? null : id
    }
    if (route.params.userId) {
        const id = typeof route.params.userId === 'string' ? parseInt(route.params.userId, 10) : route.params.userId
        return isNaN(Number(id)) ? null : Number(id)
    }
    return null
})

// Получаем информацию о пользователе профиля
const profileUser = ref<{ id: number; username: string; avatar?: string | null } | null>(null)

// Computed для получения аватара профиля
const profileAvatar = computed(() => {
    if (targetUserId.value && profileUser.value?.avatar) {
        return profileUser.value.avatar
    }
    if (!targetUserId.value && auth.user?.avatar) {
        return auth.user.avatar
    }
    return null
})

const avatarError = ref(false) // Флаг ошибки загрузки аватара

// Безопасный URL аватара (валидируется перед использованием)
const safeProfileAvatar = computed(() => {
    if (avatarError.value) return null
    return sanitizeAvatarUrl(profileAvatar.value)
})

// Обработчик ошибки загрузки аватара
const onAvatarError = () => {
    avatarError.value = true
}

const { 
    userStats, 
    userArticles, 
    loading, 
    error, 
    formattedJoinDate, 
    isViewingOwnProfile,
    refreshProfile 
} = useProfile(null) // Инициализируем без userId, будем передавать в refreshProfile

// Переопределяем isViewingOwnProfile для правильной работы с динамическим targetUserId
const isViewingOwnProfileComputed = computed(() => {
    const targetId = targetUserId.value
    return !targetId || (auth.user && targetId === auth.user.id)
})

// Преобразуем UserArticle в Article для совместимости с ArticleCard
const articles = computed<Article[]>(() => {
    if (!Array.isArray(userArticles.value)) {
        return []
    }
    const authorId = targetUserId.value || (profileUser.value?.id || 0)
    const authorUsername = profileUser.value?.username || auth.user?.nickname || auth.user?.username || 'Guest'
    
    return userArticles.value.map((userArticle: UserArticle): Article => ({
        id: userArticle.id,
        title: userArticle.title,
        content: userArticle.content,
        excerpt: userArticle.excerpt,
        author: {
            id: authorId,
            username: userArticle.author || authorUsername, // ВАЖНО: userArticle.author всегда строка
            avatar: userArticle.author_avatar || profileUser.value?.avatar || undefined
        },
        tags: userArticle.tags,
        createdAt: userArticle.created_at,
        status: userArticle.status,
        likes: userArticle.likes,
        dislikes: userArticle.dislikes,
        commentsCount: userArticle.comments_count,
        userReaction: userArticle.user_reaction,
        previewImage: userArticle.preview_image,
        difficulty: userArticle.difficulty,
        author_id: authorId
    }))
})

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

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

const handleArticleDeleted = (articleId: number) => {
    console.log('Статья удалена:', articleId)
    // Удаляем статью из списка
    if (Array.isArray(articles.value)) {
        articles.value = articles.value.filter(article => article.id !== articleId)
    }
    // Обновляем статистику
    if (userStats.value) {
        userStats.value.articles_count = Math.max(0, userStats.value.articles_count - 1)
    }
}

const goToProfileSettings = () => {
    router.push('/settings/profile')
}

// More menu (dropdown)
const showMoreMenu = ref(false)
const moreButtonRef = ref<HTMLElement | null>(null)
const optionsStyle = ref({
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: '99999999'
})

const updateDropdownPosition = () => {
    if (!showMoreMenu.value || !moreButtonRef.value) return
    
    const rect = moreButtonRef.value.getBoundingClientRect()
    const dropdownWidth = 260 // min-width из CSS
    const viewportWidth = window.innerWidth
    let left = rect.right - dropdownWidth
    // Если dropdown выходит за правый край, прижимаем к правому краю
    if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10
    }
    // Если dropdown выходит за левый край, прижимаем к левому краю
    if (left < 10) {
        left = 10
    }
    
    optionsStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 10}px`,
        left: `${left}px`,
        zIndex: '99999999'
    }
}

const toggleMoreMenu = async () => {
    showMoreMenu.value = !showMoreMenu.value
    
    if (showMoreMenu.value && moreButtonRef.value) {
        await nextTick()
        updateDropdownPosition()
    }
}

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const dropdown = target.closest('.more-options-wrapper')
    if (!dropdown && showMoreMenu.value) {
        showMoreMenu.value = false
    }
}

const copyProfileLink = async () => {
    const viewedId = targetUserId.value || auth.user?.id
    const url = viewedId ? `${window.location.origin}/profile/${viewedId}` : `${window.location.origin}/profile`
    try {
        await navigator.clipboard.writeText(url)
        showMoreMenu.value = false
        document.dispatchEvent(new CustomEvent('app-toast', {
            detail: {
                severity: 'success',
                summaryKey: 'notifications.profile.copyLink.success.summary',
                detailKey: 'notifications.profile.copyLink.success.detail',
                life: 3000
            }
        }))
    } catch {}
}

const copyUserId = async () => {
    const idNum = targetUserId.value || auth.user?.id
    const id = idNum ? idNum.toString() : ''
    if (!id) return
    try {
        await navigator.clipboard.writeText(id)
        showMoreMenu.value = false
        document.dispatchEvent(new CustomEvent('app-toast', {
            detail: {
                severity: 'success',
                summaryKey: 'notifications.profile.copyId.success.summary',
                detailKey: 'notifications.profile.copyId.success.detail',
                life: 3000
            }
        }))
    } catch {}
}

const openReport = () => {
    showMoreMenu.value = false
    isReportPanelOpen.value = true
}

const showInfoModal = ref(false)
const openInfo = () => {
    showMoreMenu.value = false
    showInfoModal.value = true
}

// Report user panel state
const isReportPanelOpen = ref(false)
const reportReasons = ref([
    { id: 'spam', descriptionKey: 'notifications.reportUser.reasons.spamDesc' },
    { id: 'harassment', descriptionKey: 'notifications.reportUser.reasons.harassmentDesc' },
    { id: 'inappropriate', descriptionKey: 'notifications.reportUser.reasons.inappropriateDesc' },
    { id: 'other', descriptionKey: 'notifications.reportUser.reasons.otherDesc' }
])
const selectedReasons = ref<string[]>([])
const closeReportPanel = () => {
    isReportPanelOpen.value = false
    selectedReasons.value = []
}
const confirmUserReport = () => {
    // Здесь может быть вызов API отправки жалобы на пользователя
    isReportPanelOpen.value = false
    const username = profileUser.value?.username || t('common.user')
    document.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
            severity: 'success',
            summaryKey: 'notifications.profile.reportUser.success.summary',
            detailKey: 'notifications.profile.reportUser.success.detail',
            params: { username },
            life: 3500
        }
    }))
    selectedReasons.value = []
}

// Загружаем информацию о пользователе профиля
const loadProfileUser = async () => {
    if (targetUserId.value) {
        try {
            profileUser.value = await getPublicUserProfile(targetUserId.value)
        } catch (err: any) {
            console.error('❌ Error loading profile user:', err)
            if (err.response?.status === 404) {
                error.value = t('profile.userNotFound')
            }
        }
    } else {
        // Свой профиль
        profileUser.value = auth.user ? { 
            id: auth.user.id, 
            username: auth.user.username || auth.user.nickname || '', 
            avatar: auth.user.avatar || null 
        } : null
    }
}

// Сбрасываем ошибку аватара при изменении профиля
watch(() => profileAvatar.value, () => {
    avatarError.value = false
})

// Отслеживаем изменения auth.user после логина/обновления данных
watch(() => auth.user, async (newUser) => {
    if (newUser && !targetUserId.value) {
        // Обновляем profileUser при изменении auth.user (важно после логина)
        profileUser.value = { 
            id: newUser.id, 
            username: newUser.username || newUser.nickname || '', 
            avatar: newUser.avatar || null 
        }
        // Сбрасываем ошибку аватара
        avatarError.value = false
    }
}, { deep: true })

// Отслеживаем изменения userId
watch(targetUserId, async (newUserId) => {
    if (newUserId) {
        await loadProfileUser()
        await refreshProfile(newUserId)
    } else {
        profileUser.value = auth.user ? { 
            id: auth.user.id, 
            username: auth.user.username || auth.user.nickname || '', 
            avatar: auth.user.avatar || null 
        } : null
        if (auth.isAuthenticated) {
            await refreshProfile()
        }
    }
}, { immediate: false })

onMounted(async () => {
    console.log('🔍 Profile mounted, auth state:', {
        isAuthenticated: auth.isAuthenticated,
        hasUser: !!auth.user,
        hasToken: !!auth.token,
        targetUserId: targetUserId.value
    })
    
    // Загружаем информацию о пользователе профиля
    await loadProfileUser()
    
    if (!auth.user && auth.token) {
        console.log('🔄 Fetching user data...')
        try { 
            await auth.fetchMe() 
            console.log('✅ User data fetched:', auth.user)
            if (!targetUserId.value) {
                profileUser.value = auth.user ? { 
                    id: auth.user.id, 
                    username: auth.user.username || auth.user.nickname || '', 
                    avatar: auth.user.avatar || null 
                } : null
            }
        } catch (err) {
            console.error('❌ Error fetching user data:', err)
        }
    }
    
    if (targetUserId.value) {
        // Загружаем чужой профиль
        console.log('🔄 Loading user profile...', targetUserId.value)
        try {
            await refreshProfile(targetUserId.value)
            console.log('✅ Profile data loaded:', {
                userStats: userStats.value,
                userArticles: userArticles.value
            })
        } catch (err) {
            console.error('❌ Error loading profile:', err)
        }
    } else if (auth.isAuthenticated) {
        // Загружаем свой профиль
        console.log('🔄 Refreshing own profile data...')
        try {
            await refreshProfile()
            console.log('✅ Profile data refreshed:', {
                userStats: userStats.value,
                userArticles: userArticles.value
            })
        } catch (err) {
            console.error('❌ Error refreshing profile:', err)
        }
    } else {
        console.log('❌ User not authenticated and no target user ID')
    }
    document.addEventListener('click', handleClickOutside)
    
    // Обновляем позицию dropdown при скролле и изменении размера окна
    window.addEventListener('scroll', updateDropdownPosition, { passive: true })
    window.addEventListener('resize', updateDropdownPosition, { passive: true })
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updateDropdownPosition)
    window.removeEventListener('resize', updateDropdownPosition)
})
</script>


<style scoped>
.profile-container {
  margin: 0 auto;
  background-color: var(--bg-primary);
  min-height: 100vh;
  padding: calc(var(--header-height, 80px) + 60px) 16px 0 16px;
  box-sizing: border-box;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Мобильные устройства */
  @media (max-width: 768px) {
    padding: calc(var(--header-height, 60px) + 40px) 12px 0 12px;
  }

  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: calc(var(--header-height, 70px) + 50px) 20px 0 20px;
    max-width: 1000px;
  }

  /* Десктоп */
  @media (min-width: 1025px) {
    padding: calc(var(--header-height, 80px) + 60px) 24px 0 24px;
    max-width: 1400px;
  }
}

/* Profile Header */
.profile-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 0;
  width: 1365px;
}

/* Avatar */
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--btn-primary);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;

  &.editable {
    cursor: pointer;

    &:hover {
      .avatar-edit-overlay {
        opacity: 1;
      }

      .avatar-image {
        filter: brightness(0.5);
      }

      .avatar-placeholder {
        filter: brightness(0.5);
      }
    }
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: filter 0.3s ease;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: filter 0.3s ease;
}

.question-icon {
  color: var(--text-primary);
  transition: all 0.2s ease-in-out;
}

.avatar-placeholder:hover .question-icon {
  color: #FFFFFF;
  transform: scale(1.1);
}

/* Edit Overlay */
.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.edit-overlay-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* User Info */
.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  flex: 1;
}

.username-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: nowrap;
}

.username-with-badge .user-nickname {
  margin: 0;
  white-space: nowrap;
}

.user-nickname {
  font-family: var(--font-sans);
  font-size: 30px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.self-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(140, 0, 255, 0.1);
  color: var(--primary-violet);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.user-tag {
  font-family: var(--font-sans);
  font-size: 23px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

/* User Stats */
.user-stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.stat-item {
  font-family: var(--font-sans);
  font-size: 25px;
  font-weight: 500;
  color: var(--text-third);
}

.stat-divider {
  width: 3px;
  height: 48px;
  background-color: var(--btn-primary);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
}

.edit-button {
  display: flex;
  align-items: center;
  width: 60px;
  height: 56px;
  background-color: transparent;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  padding: 0 16px;

  &:hover{
    background-color: var(--btn-primary);
  }
}

.edit-button:hover {
  opacity: 0.9;
}

.edit-icon {
  width: 30px;
  height: 30px;
  color: var(--text-primary);
}

.edit-text {
  font-family: var(--font-sans);
  font-size: 25px;
  font-weight: 500;
  color: var(--text-primary);
  margin-left: 16px;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background-color: transparent;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover{
    background-color: var(--btn-primary);
  }
}

.more-button:hover {
  opacity: 0.9;
}

.more-icon {
  width: 6px;
  height: 30px;
  color: var(--text-primary);
}

/* More button dropdown (matches CommentBlock options-dropdown styling) */
.more-options-wrapper {
  position: relative;
}

.options-dropdown {
  position: fixed !important;
  transform: none;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 10px;
  min-width: 260px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 99999999 !important;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  background: none;
  border: none;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  svg {
    width: 23px;
    height: 23px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    
    svg {
      color: var(--text-primary);
    }
  }
  
  &.danger {
    &:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      
      svg {
        color: #ef4444;
      }
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.16s ease-in-out, margin-top 0.16s ease-in-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  margin-top: -4px;
}

/* Profile Divider */
.profile-divider {
  height: 2px;
  width: 1360px;
  background-color: var(--btn-primary);
  margin-top: 20px;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 50px 0 50px 0;
}

.empty-message {
  font-family: var(--font-sans);
  font-size: 25px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.loading-message, .error-message {
  font-family: var(--font-sans);
  font-size: 25px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

.retry-button {
  background-color: var(--btn-primary);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.retry-button:hover {
  opacity: 0.9;
}

/* Simple Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000000;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 480px;
  max-width: 92vw;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.modal-title {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 600;
}

.modal-row {
  margin: 6px 0;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 16px;
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* Report Panel styles (aligned with other parts of app) */
.report-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000000;
}

.report-panel {
  width: 720px;
  max-width: 94vw;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.report-panel-content {
  padding: 20px;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-panel-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.report-panel-subtitle {
  margin: 12px 0 10px 0;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 16px;
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.reason-item:hover { background: rgba(255, 255, 255, 0.04); }
.reason-item.selected { background: rgba(140, 0, 255, 0.08); }

.reason-checkbox { display: none; }

.reason-checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--text-secondary);
  border-radius: 4px;
  margin-top: 3px;
}

.reason-item.selected .reason-checkmark {
  background: var(--primary-violet);
  border-color: var(--primary-violet);
}

.reason-content { display: flex; flex-direction: column; gap: 4px; }
.reason-title { color: var(--text-primary); font-family: var(--font-sans); font-size: 16px; }
.reason-description { color: var(--text-secondary); font-family: var(--font-sans); font-size: 14px; }

.report-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.report-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-family: var(--font-sans);
  font-size: 15px;
  cursor: pointer;
}

.report-btn.cancel { background: rgba(255, 255, 255, 0.08); color: var(--text-primary); }
.report-btn.submit { background: var(--primary-violet); color: white; }
.report-btn.submit:disabled { opacity: 0.6; cursor: not-allowed; }

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
}

.empty-state, .loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200px 0 210px 0;
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .articles-grid {
    gap: 16px;
    padding: 16px 0;
  }
}
</style>
