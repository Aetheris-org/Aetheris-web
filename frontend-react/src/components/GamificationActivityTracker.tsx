/**
 * Отслеживает ежедневный визит и начисляет XP за daily_login (стрик + 10 XP).
 * Вызывает registerActivity('daily_login') только если lastActivityDate !== сегодня.
 */
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { isoToday } from '@/lib/gamification'

export function GamificationActivityTracker() {
  const user = useAuthStore((s) => s.user)
  const initializing = useAuthStore((s) => s.initializing)
  const lastActivityDate = useGamificationStore((s) => s.lastActivityDate)
  const registerActivity = useGamificationStore((s) => s.registerActivity)
  const didRun = useRef(false)

  useEffect(() => {
    if (initializing || !user) return
    const today = isoToday()
    if (lastActivityDate === today) return
    // Начисляем только раз за сессию при первом подходящем рендере
    if (didRun.current) return
    didRun.current = true
    registerActivity('daily_login')
  }, [initializing, user, lastActivityDate, registerActivity])

  return null
}
