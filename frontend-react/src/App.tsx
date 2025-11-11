import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import NetworkingPage from '@/pages/NetworkingPage'
import CoursesPage from '@/pages/CoursesPage'
import DevelopersPage from '@/pages/DevelopersPage'
import ArticlePage from '@/pages/ArticlePage'
import ProfilePage from '@/pages/ProfilePage'
import AuthPage from '@/pages/AuthPage'
import CreateArticlePage from '@/pages/CreateArticlePage'
import SettingsPage from '@/pages/SettingsPage'
import ReadingListPage from '@/pages/ReadingListPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import NotificationsPage from '@/pages/NotificationsPage'
import DraftsPage from '@/pages/DraftsPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import TrendingPage from '@/pages/TrendingPage'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initializeTheme = useThemeStore((state) => state.initialize)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/networking" element={<NetworkingPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/create" element={<CreateArticlePage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
          <Route path="/reading-list" element={<ReadingListPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

