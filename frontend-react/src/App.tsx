import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { setupCachePersistence } from '@/lib/queryCache'
import { Toaster } from '@/components/ui/toaster'
import { SiteFooter } from '@/components/SiteFooter'
import HomePage from '@/pages/HomePage'
import NetworkingPage from '@/pages/NetworkingPage'
import CoursesPage from '@/pages/CoursesPage'
import CourseDetailPage from '@/pages/CourseDetailPage'
import DevelopersPage from '@/pages/DevelopersPage'
import ArticlePage from '@/pages/ArticlePage'
import ProfilePage from '@/pages/ProfilePage'
import AuthPage from '@/pages/AuthPage'
import CreateArticlePage from '@/pages/CreateArticlePage'
import EditArticlePage from '@/pages/EditArticlePage'
import SettingsPage from '@/pages/SettingsPage'
import ReadingListPage from '@/pages/ReadingListPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import NotificationsPage from '@/pages/NotificationsPage'
import DraftsPage from '@/pages/DraftsPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import TrendingPage from '@/pages/TrendingPage'
import AchievementsPage from '@/pages/AchievementsPage'
import ForumLandingPage from '@/pages/ForumLandingPage'
import FriendsPage from '@/pages/FriendsPage'
import ExplorePage from '@/pages/ExplorePage'
import EventDetailPage from '@/pages/EventDetailPage'
import ExploreAchievementsPage from '@/pages/ExploreAchievementsPage'
import PricingPage from '@/pages/PricingPage'
import FeedbackPage from '@/pages/FeedbackPage'
import DashboardPage from '@/pages/DashboardPage'
import TermsOfServicePage from '@/pages/TermsOfServicePage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import OnboardingPage from '@/pages/OnboardingPage'
import NewsPage from '@/pages/NewsPage'
import ChangesPage from '@/pages/ChangesPage'
import RulesPage from '@/pages/RulesPage'
import FAQPage from '@/pages/FAQPage'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentUser } from '@/api/auth'
import { useThemeStore } from '@/stores/themeStore'
import { useI18nStore } from '@/stores/i18nStore'
import { DraftRecoveryProvider } from '@/components/DraftRecoveryProvider'

/**
 * QueryClient с оптимизированными настройками для высокой нагрузки
 * - Кэширование для снижения нагрузки на сервер
 * - Retry логика для отказоустойчивости
 * - Stale time для баланса между актуальностью и производительностью
 * - Персистентное кэширование в localStorage
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Не рефетчить при фокусе окна (снижает нагрузку)
      refetchOnWindowFocus: false,
      // Не рефетчить при переподключении (опционально, можно включить для критичных данных)
      refetchOnReconnect: false,
      // Не рефетчить заново при быстрых переходах (используем кеш)
      refetchOnMount: false,
      // Retry логика: 3 попытки с экспоненциальной задержкой
      retry: (failureCount, error: any) => {
        // Не ретраить на 4xx ошибки (клиентские ошибки)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        // Максимум 3 попытки для сетевых/серверных ошибок
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Время, в течение которого данные считаются свежими (5 минут)
      staleTime: 5 * 60 * 1000,
      // Время хранения в кэше (30 минут)
      gcTime: 30 * 60 * 1000, // ранее cacheTime
      // Таймаут запроса (30 секунд)
      networkMode: 'online',
    },
    mutations: {
      // Retry для мутаций только на сетевые ошибки
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
})

// Настраиваем персистентное кэширование
if (typeof window !== 'undefined') {
  setupCachePersistence(queryClient)
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initializeTheme = useThemeStore((state) => state.initialize)
  const initializeI18n = useI18nStore((state) => state.initialize)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    initializeI18n()
  }, [initializeI18n])

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  // При возврате в приложение (в т.ч. на мобильных) обновляем пользователя, чтобы аватар и данные были актуальны
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      getCurrentUser().then((u) => { if (u) useAuthStore.getState().setUser(u) })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<ForumLandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/forum" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/events/:id" element={<EventDetailPage />} />
          <Route path="/explore/achievements" element={<ExploreAchievementsPage />} />
          <Route path="/networking" element={<NetworkingPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/create" element={<CreateArticlePage />} />
          <Route path="/edit/:id" element={<EditArticlePage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
          <Route path="/reading-list" element={<ReadingListPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/legal/terms" element={<TermsOfServicePage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/changes" element={<ChangesPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
        <DraftRecoveryProvider />
        <SiteFooter />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

