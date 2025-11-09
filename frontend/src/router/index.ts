import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import { getTokenFromCookie } from '@/api/axios'

const routes = [
  // Main page (articles)
  { path: '/', name: 'HomePage', component: () => import('@/views/HomePage.vue') },

  // Welcome page (landing)
  { path: '/home', name: 'Welcome', component: () => import('@/views/Welcome.vue') },
  { path: '/articles/interactive', name: 'ArticlesInteractive', component: () => import('@/views/ArticlesInteractive.vue') },
  { path: '/articles/companies', name: 'ArticlesCompanies', component: () => import('@/views/ArticlesCompanies.vue') },
  { path: '/events', name: 'Events', component: () => import('@/views/Events.vue') },
  { path: '/article/:id', name: 'FullArticle', component: () => import('@/views/FullArticle.vue'), props: true },

  // FAQ
  { path: '/faq', name: 'FAQ', component: () => import('@/views/FAQ.vue') },
  { path: '/faq/item/:id', name: 'FAQDetail', component: () => import('@/views/faq/FAQDetail.vue') },
  { path: '/faq/help', name: 'FAQHelp', component: () => import('@/views/FAQHelp.vue') },
  { path: '/faq/changes', name: 'FAQChanges', component: () => import('@/views/FAQChanges.vue') },
  { path: '/faq/keywords', name: 'FAQKeywords', component: () => import('@/views/FAQKeywords.vue') },
  { path: '/faq/user-ranks', name: 'FAQUserRanks', component: () => import('@/views/FAQUserRanks.vue') },
  { path: '/faq/clan-ranks', name: 'FAQClanRanks', component: () => import('@/views/FAQClanRanks.vue') },

  // Legal pages
  { path: '/legal', name: 'LegalIndex', component: () => import('@/views/LegalContentRules.vue') },
  { path: '/legal/community-rules', name: 'LegalCommunityRules', component: () => import('@/views/LegalCommunityRules.vue') },
  { path: '/legal/content-rules', name: 'LegalContentRules', component: () => import('@/views/LegalContentRules.vue') },
  { path: '/legal/privacy-policy', name: 'LegalPrivacyPolicy', component: () => import('@/views/LegalPrivacyPolicy.vue') },
  { path: '/legal/terms-of-use', name: 'LegalTermsOfUse', component: () => import('@/views/LegalTermsOfUse.vue') },
  { path: '/legal/copyright-policy', name: 'LegalCopyrightPolicy', component: () => import('@/views/LegalCopyrightPolicy.vue') },
  { path: '/legal/security', name: 'LegalSecurity', component: () => import('@/views/LegalSecurity.vue') },
  { path: '/legal/another', name: 'LegalAnother', component: () => import('@/views/LegalAnother.vue') },

  // Authentication (OAuth2 only)
  { path: '/auth', name: 'Auth', component: () => import('@/views/Auth.vue') },
  { path: '/auth/callback', name: 'AuthCallback', component: () => import('@/views/AuthCallback.vue') },
  { path: '/auth/finalize', name: 'AuthFinalize', component: () => import('@/views/AuthFinalize.vue') },

  // User pages
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue') },
  { path: '/user/:userId', name: 'UserProfile', component: () => import('@/views/Profile.vue'), props: true },
  { path: '/create-article', name: 'CreateArticle', component: () => import('@/views/CreateArticle.vue') },
  { path: '/edit-article/:id', name: 'EditArticle', component: () => import('@/views/EditArticle.vue'), props: true },
  { path: '/your-articles', name: 'YourArticles', component: () => import('@/views/YourArticles.vue') },
  { path: '/stared-articles', name: 'StaredArticles', component: () => import('@/views/StaredArticles.vue') },
  { path: '/draft-articles', name: 'DraftArticles', component: () => import('@/views/DraftArticles.vue') },

  // Settings pages
  { path: '/settings/profile', name: 'SettingsProfile', component: () => import('@/views/SettingsProfile.vue') },
  { path: '/settings/appearance', name: 'SettingsAppearance', component: () => import('@/views/SettingsAppearance.vue') },
  { path: '/settings/privacy', name: 'SettingsPrivacy', component: () => import('@/views/SettingsPrivacy.vue') },
  { path: '/settings/subscription', name: 'SettingsSubscription', component: () => import('@/views/SettingsSubscription.vue') },
  { path: '/settings/sessions', name: 'SettingsSessions', component: () => import('@/views/SettingsSessions.vue') },
  { path: '/settings/support', name: 'SettingsSupport', component: () => import('@/views/SettingsSupport.vue') },
  { path: '/settings/another', name: 'SettingsAnother', component: () => import('@/views/SettingsAnother.vue') },

  // Additional pages
  { path: '/notifications', name: 'Notifications', component: () => import('@/views/Notifications.vue') },
  { path: '/news', name: 'News', component: () => import('@/views/HomePage.vue') },
  { path: '/research', name: 'Research', component: () => import('@/views/HomePage.vue') },
  { path: '/development', name: 'Development', component: () => import('@/views/HomePage.vue') },
  { path: '/shop', name: 'Shop', component: () => import('@/views/Shop.vue') },
  { path: '/analytics', name: 'Analytics', component: () => import('@/views/Analytics.vue') },
  { path: '/balance', name: 'Balance', component: () => import('@/views/Balance.vue') },

    //test view for articles
    { path: '/test-article', name: 'TestArticle', component: () => import('@/views/TestArticle.vue') },
  
  // Admin Panel (guarded)
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      { path: '', redirect: { name: 'AdminArticles' } },
      { path: 'articles', name: 'AdminArticles', component: () => import('@/views/admin/AdminReportedArticles.vue') },
      { path: 'comments', name: 'AdminComments', component: () => import('@/views/admin/AdminReportedComments.vue') },
      { path: 'profiles', name: 'AdminProfiles', component: () => import('@/views/admin/AdminReportedProfiles.vue') },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Восстановление позиции прокрутки при навигации
  scrollBehavior(to, from, savedPosition) {
    // Если есть сохраненная позиция (при нажатии назад/вперед), используем её
    if (savedPosition) {
      return savedPosition
    }
    // Если есть хэш в URL, прокручиваем к элементу
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Отступ сверху для фиксированного хедера
      }
    }
    // При переходе на статью - всегда к началу (instant для немедленной прокрутки)
    if (to.path.startsWith('/article/')) {
      return { top: 0, behavior: 'instant' }
    }
    // При возврате на страницу статей - возвращаем false, чтобы компонент сам восстановил позицию
    // Это предотвращает прокрутку роутером, компонент сделает это после загрузки контента
    if (to.path === '/' || to.path === '/news' || to.path === '/research' || to.path === '/development') {
      return false // Компонент сам восстановит позицию через sessionStorage
    }
    // По умолчанию прокручиваем к началу страницы
    return { top: 0, behavior: 'instant' }
  },
});

// Global navigation guard
router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  
  // Загружаем user из localStorage при первой навигации (если есть)
  if (!auth.user) {
    auth.loadFromStorage()
  }

  // Обработка OAuth callback - COOKIE-BASED AUTH
  // SECURITY: Token теперь в cookie, не в URL
  if (to.path === '/auth/callback') {
    console.log('🔵 Router guard: OAuth callback detected (cookie-based)')
    
    // Проверяем наличие access token в cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]
    
    if (!token) {
      console.error('❌ No access token in cookie!')
      return { path: '/auth', query: { error: 'no_token' }, replace: true }
    }
    
    console.log('✅ Access token found in cookie')
    
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
    
    try {
      console.log('🔵 Making request to /api/users/me with cookie token...')
      // ВАЖНО: Добавляем populate для загрузки аватара
      const response = await fetch(`${API_BASE}/api/users/me?populate[avatar][fields][0]=url`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // ВАЖНО: отправляем cookies
      })
      
      console.log(`🔵 Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to fetch user: ${response.status}`)
        console.error(`❌ Response body: ${errorText.substring(0, 200)}`)
        throw new Error(`Failed to fetch user: ${response.status}`)
      }
      
      const responseData = await response.json()
      console.log('🔵 Raw response:', JSON.stringify(responseData).substring(0, 200))
      
      // Strapi возвращает формат: { id, username, email, avatar, ... } напрямую из /api/users/me
      const userData = responseData
      
      // Импортируем функцию адаптации из api/profile.ts для правильной обработки аватара
      const { adaptBackendUser } = await import('@/api/profile')
      
      // Адаптируем к формату frontend с правильной обработкой аватара
      const adaptedUser = adaptBackendUser(userData)
      
      console.log('✅ User data adapted:', { 
        id: adaptedUser.id, 
        username: adaptedUser.nickname || adaptedUser.username,
        hasAvatar: !!adaptedUser.avatar 
      })
      
      auth.setUser(adaptedUser)
      
      console.log('✅ User data loaded:', { id: adaptedUser.id, username: adaptedUser.nickname || adaptedUser.username })
      
      // Проверяем что username валидный (не временный, не хеш, не email)
      const username = adaptedUser.nickname || adaptedUser.username
      const hasValidUsername = username && 
                               username !== userData.email &&
                               !username.startsWith('user_') &&
                               !username.startsWith('hash-')
      
      // Проверяем сохранённый redirect (например, /create-article)
      const savedRedirect = sessionStorage.getItem('auth_redirect')
      sessionStorage.removeItem('auth_redirect') // Очищаем после использования
      
      if (!hasValidUsername) {
        console.log('🔵 User has no valid username, redirecting to /auth/finalize')
        // Сохраняем redirect для использования после установки никнейма
        if (savedRedirect) {
          sessionStorage.setItem('auth_redirect', savedRedirect)
        }
        return { path: '/auth/finalize', replace: true }
      } else {
        console.log('✅ User has valid username, redirecting to', savedRedirect || '/')
        return { path: savedRedirect || '/', replace: true }
      }
    } catch (err) {
      console.error('❌ Router guard: Auth callback error:', err)
      auth.logout()
      return { path: '/auth', query: { error: 'auth_failed' }, replace: true }
    }
  }

  // Публичные пути, доступные без авторизации
  const publicPaths = [
    '/auth',
    '/auth/callback',
    '/auth/finalize',
    '/home',
    '/articles/interactive',
    '/articles/companies',
  ]

  const isPublicPath = publicPaths.includes(to.path) || 
                       to.path.startsWith('/article/') || 
                       to.path.startsWith('/user/') ||
                       to.path.startsWith('/legal/') ||
                       to.path.startsWith('/faq/')

  // Главная страница доступна всем
  if (to.path === '/') {
    return true
  }

  // Редирект на главную, если пользователь авторизован и заходит на страницу авторизации
  if (auth.isAuthenticated && to.path === '/auth') {
    return { path: '/', replace: true }
  }

  // Admin guard - требует авторизации
  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated) {
      document.dispatchEvent(new CustomEvent('auth-required', { 
        detail: { redirect: to.fullPath } 
      }))
      return { path: '/auth', query: { redirect: to.fullPath } }
    }
    // TODO: Добавить проверку роли админа
    return true
  }

  // Защищённые маршруты требуют авторизации
  if (!auth.isAuthenticated && !isPublicPath) {
    console.log('🔒 Route guard: Protected route requires auth', {
      path: to.path,
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      token: getTokenFromCookie() ? 'exists' : 'missing'
    })
    document.dispatchEvent(new CustomEvent('auth-required', { 
      detail: { redirect: to.fullPath } 
    }))
    return { path: '/auth', query: { redirect: to.fullPath } }
  }

  return true
})

export default router;
