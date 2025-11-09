import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import ArticlePage from '@/pages/ArticlePage'
import ProfilePage from '@/pages/ProfilePage'
import AuthPage from '@/pages/AuthPage'
import CreateArticlePage from '@/pages/CreateArticlePage'
import SettingsPage from '@/pages/SettingsPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import { useAuthStore } from '@/stores/authStore'

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/create" element={<CreateArticlePage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

