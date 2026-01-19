/**
 * Общая логика геймификации: уровни, XP, стрики
 * Используется в gamificationStore и при расчёте level в auth/getCurrentUser
 */

export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 75
}

export interface LevelInfo {
  level: number
  xpIntoLevel: number
  xpForLevel: number
  nextLevelTotal: number
}

export function calculateLevelInfo(experience: number): LevelInfo {
  let level = 1
  let xpRemaining = experience
  let xpNeeded = xpForLevel(level)

  while (xpRemaining >= xpNeeded) {
    xpRemaining -= xpNeeded
    level += 1
    xpNeeded = xpForLevel(level)
  }

  const nextLevelTotal = experience - xpRemaining + xpNeeded

  return {
    level,
    xpIntoLevel: xpRemaining,
    xpForLevel: xpNeeded,
    nextLevelTotal,
  }
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}
