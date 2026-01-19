/**
 * API геймификации: получение и синхронизация experience, стриков
 */
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface GamificationData {
  experience: number
  streak_days: number
  best_streak: number
  last_activity_date: string | null
}

const DEFAULTS: GamificationData = {
  experience: 0,
  streak_days: 0,
  best_streak: 0,
  last_activity_date: null,
}

/**
 * Получить данные геймификации текущего пользователя.
 * Если записи нет — возвращаются значения по умолчанию (запись не создаётся).
 */
export async function getGamification(): Promise<GamificationData> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return DEFAULTS

    const { data, error } = await supabase
      .from('user_gamification')
      .select('experience, streak_days, best_streak, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      // Таблица может отсутствовать до применения миграции
      if (error.code === '42P01' || (error as any)?.message?.includes('does not exist')) {
        logger.debug('[getGamification] Table user_gamification not found, using defaults')
        return DEFAULTS
      }
      logger.warn('[getGamification] Error:', error)
      return DEFAULTS
    }

    if (!data) return DEFAULTS

    return {
      experience: Math.max(0, Number(data.experience ?? 0)),
      streak_days: Math.max(0, Number(data.streak_days ?? 0)),
      best_streak: Math.max(0, Number(data.best_streak ?? 0)),
      last_activity_date: data.last_activity_date ? String(data.last_activity_date) : null,
    }
  } catch (e) {
    logger.warn('[getGamification] Unexpected error:', e)
    return DEFAULTS
  }
}

/**
 * Синхронизировать данные геймификации (upsert).
 * Вызывается после addExperience и других изменений в store.
 */
export async function syncGamification(payload: {
  experience: number
  streak_days: number
  best_streak: number
  last_activity_date: string | null
}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('user_gamification').upsert(
      {
        user_id: user.id,
        experience: Math.max(0, Math.floor(payload.experience)),
        streak_days: Math.max(0, Math.floor(payload.streak_days)),
        best_streak: Math.max(0, Math.floor(payload.best_streak)),
        last_activity_date: payload.last_activity_date || null,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      if (error.code === '42P01' || (error as any)?.message?.includes('does not exist')) {
        logger.debug('[syncGamification] Table user_gamification not found, skip')
        return
      }
      logger.warn('[syncGamification] Error:', error)
    }
  } catch (e) {
    logger.warn('[syncGamification] Unexpected error:', e)
  }
}
