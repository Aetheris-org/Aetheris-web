import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

type PreferredActivity =
  | 'publish_article'
  | 'receive_comment'
  | 'daily_login'
  | 'complete_daily_quest'
  | 'share_article'

type GamificationAchievementId =
  | 'reach_level_2'
  | 'reach_level_5'
  | 'reach_level_10'
  | 'streak_3'
  | 'streak_7'
  | 'complete_daily_set'

export interface LevelMilestone {
  level: number
  title: string
  description: string
  reward: string
}

export interface GamificationAchievement {
  id: GamificationAchievementId
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  xpReward: number
  completed: boolean
  completedAt?: string
}

interface LevelInfo {
  level: number
  xpIntoLevel: number
  xpForLevel: number
  nextLevelTotal: number
}

interface GamificationState {
  level: number
  experience: number
  xpIntoLevel: number
  xpForLevel: number
  nextLevelAt: number
  streakDays: number
  bestStreak: number
  lastActivityDate: string | null
  achievements: GamificationAchievement[]
  dailyQuests: DailyQuest[]
  lastQuestReset: string | null
  recentActivity: Array<{ id: string; label: string; xp: number; at: string }>
  addExperience: (points: number, activity?: PreferredActivity, label?: string) => void
  registerActivity: (activity: PreferredActivity) => void
  completeQuest: (questId: string) => void
  hydrateFromUser: (user: User | null) => void
  resetDailyQuests: () => void
}

const QUEST_DEFINITIONS: Array<Omit<DailyQuest, 'completed' | 'completedAt'>> = [
  {
    id: 'write-ideas',
    title: 'Draft new ideas',
    description: 'Capture or refine 2 article ideas in your notebook.',
    xpReward: 40,
  },
  {
    id: 'share-feedback',
    title: 'Give feedback',
    description: 'Leave thoughtful comments on 2 community articles.',
    xpReward: 35,
  },
  {
    id: 'update-profile',
    title: 'Polish your profile',
    description: 'Refresh your bio, expertise tags, or availability notes.',
    xpReward: 25,
  },
]

const ACHIEVEMENT_DEFINITIONS: Array<Omit<GamificationAchievement, 'unlocked' | 'unlockedAt'>> = [
  {
    id: 'reach_level_2',
    title: 'Momentum Rising',
    description: 'Reach level 2 by actively participating in Aetheris.',
  },
  {
    id: 'reach_level_5',
    title: 'Seasoned Creator',
    description: 'Reach level 5 and become a trusted voice for the community.',
  },
  {
    id: 'reach_level_10',
    title: 'Aetheris Luminary',
    description: 'Reach level 10 and unlock the luminary badge.',
  },
  {
    id: 'streak_3',
    title: 'Consistency Wins',
    description: 'Maintain a 3 day streak of meaningful activity.',
  },
  {
    id: 'streak_7',
    title: 'Weekly Flow',
    description: 'Keep a productive streak going for 7 days in a row.',
  },
  {
    id: 'complete_daily_set',
    title: 'Daily Focus',
    description: 'Complete all daily quests in a single day.',
  },
]

const ACTION_REWARDS: Record<PreferredActivity, { xp: number; label: string }> = {
  publish_article: { xp: 80, label: 'Published an article' },
  receive_comment: { xp: 20, label: 'Received feedback from readers' },
  daily_login: { xp: 10, label: 'Checked in today' },
  complete_daily_quest: { xp: 0, label: 'Completed a daily quest' },
  share_article: { xp: 30, label: 'Shared your work with the community' },
}

export const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 2,
    title: 'Emerging voice',
    description: 'Publish consistently to unlock a custom profile backdrop.',
    reward: 'Profile banner variants',
  },
  {
    level: 3,
    title: 'Community catalyst',
    description: 'Spark conversations and earn extra reactions from readers.',
    reward: 'Reaction multiplier +1',
  },
  {
    level: 5,
    title: 'Featured author',
    description: 'Gain access to spotlight placement on the home feed.',
    reward: 'Featured slot priority',
  },
  {
    level: 7,
    title: 'Mentor in residence',
    description: 'Unlock ability to host curated reading circles.',
    reward: 'Curated circle host',
  },
  {
    level: 10,
    title: 'Aetheris luminary',
    description: 'Join the invite-only creator council guiding the roadmap.',
    reward: 'Creator council badge',
  },
]

function xpForLevel(level: number): number {
  return 100 + (level - 1) * 75
}

function calculateLevelInfo(experience: number): LevelInfo {
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

function buildFreshAchievements(): GamificationAchievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
    ...achievement,
    unlocked: false,
  }))
}

function buildFreshQuests(): DailyQuest[] {
  return QUEST_DEFINITIONS.map((quest) => ({
    ...quest,
    completed: false,
  }))
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string | null, b: string): number | null {
  if (!a) return null
  const start = new Date(a)
  const end = new Date(b)
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function evaluateAchievements(state: GamificationState) {
  const { achievements, level, streakDays, bestStreak, dailyQuests } = state
  const now = new Date().toISOString()

  const updated = achievements.map((achievement) => {
    if (achievement.unlocked) return achievement

    let shouldUnlock = false
    switch (achievement.id) {
      case 'reach_level_2':
        shouldUnlock = level >= 2
        break
      case 'reach_level_5':
        shouldUnlock = level >= 5
        break
      case 'reach_level_10':
        shouldUnlock = level >= 10
        break
      case 'streak_3':
        shouldUnlock = streakDays >= 3 || bestStreak >= 3
        break
      case 'streak_7':
        shouldUnlock = streakDays >= 7 || bestStreak >= 7
        break
      case 'complete_daily_set':
        shouldUnlock = dailyQuests.length > 0 && dailyQuests.every((quest) => quest.completed)
        break
      default:
        shouldUnlock = false
    }

    if (!shouldUnlock) return achievement
    return {
      ...achievement,
      unlocked: true,
      unlockedAt: now,
    }
  })

  return updated
}

function ensureDailyQuests(state: GamificationState): Partial<GamificationState> | null {
  const today = isoToday()
  if (state.lastQuestReset === today && state.dailyQuests.length === QUEST_DEFINITIONS.length) {
    return null
  }

  return {
    dailyQuests: buildFreshQuests(),
    lastQuestReset: today,
  }
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      level: 1,
      experience: 0,
      xpIntoLevel: 0,
      xpForLevel: xpForLevel(1),
      nextLevelAt: xpForLevel(1),
      streakDays: 0,
      bestStreak: 0,
      lastActivityDate: null,
      achievements: buildFreshAchievements(),
      dailyQuests: buildFreshQuests(),
      lastQuestReset: isoToday(),
      recentActivity: [],
      hydrateFromUser: (user) => {
        if (!user) {
          set({
            level: 1,
            experience: 0,
            xpIntoLevel: 0,
            xpForLevel: xpForLevel(1),
            nextLevelAt: xpForLevel(1),
            streakDays: 0,
            bestStreak: 0,
            lastActivityDate: null,
            achievements: buildFreshAchievements(),
            dailyQuests: buildFreshQuests(),
            lastQuestReset: isoToday(),
            recentActivity: [],
          })
          return
        }

        const initialExperience = Math.max(user.experience ?? 0, 0)
        const { level, xpForLevel: levelXp, xpIntoLevel, nextLevelTotal } =
          calculateLevelInfo(initialExperience)

        set((state) => ({
          level,
          experience: initialExperience,
          xpIntoLevel,
          xpForLevel: levelXp,
          nextLevelAt: nextLevelTotal,
          streakDays: state.streakDays || 0,
          bestStreak: state.bestStreak || 0,
          achievements: evaluateAchievements({
            ...state,
            level,
            streakDays: state.streakDays,
            bestStreak: state.bestStreak,
            dailyQuests: state.dailyQuests,
          }),
        }))
      },
      addExperience: (points, activity, label) => {
        const xpGain = Math.max(points, 0)
        if (xpGain === 0) return

        const today = isoToday()
        set((state) => {
          const derivedQuests = ensureDailyQuests(state)

          const updatedExperience = state.experience + xpGain
          const { level, xpIntoLevel, xpForLevel: levelRequirement, nextLevelTotal } =
            calculateLevelInfo(updatedExperience)

          const dayDiff = daysBetween(state.lastActivityDate, today)
          let streak = state.streakDays
          if (dayDiff === null) {
            streak = 1
          } else if (dayDiff === 0) {
            streak = state.streakDays || 1
          } else if (dayDiff === 1) {
            streak = state.streakDays + 1
          } else if (dayDiff > 1) {
            streak = 1
          }

          const bestStreak = Math.max(state.bestStreak, streak)

          const activityLabel =
            label ?? (activity ? ACTION_REWARDS[activity]?.label : 'Completed an action')

          const updatedState: GamificationState = {
            ...state,
            ...derivedQuests,
            level,
            experience: updatedExperience,
            xpIntoLevel,
            xpForLevel: levelRequirement,
            nextLevelAt: nextLevelTotal,
            streakDays: streak,
            bestStreak,
            lastActivityDate: today,
            achievements: state.achievements,
            dailyQuests: derivedQuests?.dailyQuests ?? state.dailyQuests,
            recentActivity: [
              {
                id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                label: activityLabel,
                xp: xpGain,
                at: new Date().toISOString(),
              },
              ...state.recentActivity.slice(0, 9),
            ],
          }

          const evaluatedAchievements = evaluateAchievements(updatedState)

          return {
            ...updatedState,
            achievements: evaluatedAchievements,
          }
        })
      },
      registerActivity: (activity) => {
        const reward = ACTION_REWARDS[activity]
        if (reward) {
          get().addExperience(reward.xp, activity, reward.label)
        }
      },
      completeQuest: (questId) => {
        set((state) => {
          const derivedQuests = ensureDailyQuests(state)
          const quests = derivedQuests?.dailyQuests ?? state.dailyQuests

          const targetQuest = quests.find((quest) => quest.id === questId)
          if (!targetQuest || targetQuest.completed) {
            return state
          }

          const updatedQuests = quests.map((quest) =>
            quest.id === questId
              ? {
                  ...quest,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : quest
          )

          const updatedState: GamificationState = {
            ...state,
            ...derivedQuests,
            dailyQuests: updatedQuests,
            lastQuestReset: derivedQuests?.lastQuestReset ?? state.lastQuestReset,
          }

          // Update achievements with the prospective state
          const achievementsAfterQuests = evaluateAchievements({
            ...updatedState,
            level: updatedState.level,
            experience: updatedState.experience,
            streakDays: updatedState.streakDays,
            bestStreak: updatedState.bestStreak,
          })

          return {
            ...updatedState,
            achievements: achievementsAfterQuests,
          }
        })

        get().addExperience(
          ACTION_REWARDS.complete_daily_quest.xp + getQuestReward(questId),
          'complete_daily_quest',
          `Completed "${targetQuestTitle(questId)}"`
        )

        function getQuestReward(id: string): number {
          const quest = QUEST_DEFINITIONS.find((item) => item.id === id)
          return quest?.xpReward ?? 0
        }

        function targetQuestTitle(id: string): string {
          const quest = QUEST_DEFINITIONS.find((item) => item.id === id)
          return quest?.title ?? 'daily quest'
        }
      },
      resetDailyQuests: () => {
        set({
          dailyQuests: buildFreshQuests(),
          lastQuestReset: isoToday(),
        })
      },
    }),
    {
      name: 'aetheris-gamification',
      version: 1,
    }
  )
)

