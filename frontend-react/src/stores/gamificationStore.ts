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
  | 'reach_level_15'
  | 'reach_level_20'
  | 'reach_level_25'
  | 'reach_level_30'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_60'
  | 'streak_100'
  | 'streak_365'
  | 'complete_daily_set'
  | 'complete_weekly_set'
  | 'complete_monthly_set'
  | 'publish_first_article'
  | 'publish_5_articles'
  | 'publish_10_articles'
  | 'publish_25_articles'
  | 'publish_50_articles'
  | 'publish_100_articles'
  | 'publish_250_articles'
  | 'publish_500_articles'
  | 'first_comment'
  | 'comment_5_times'
  | 'comment_10_times'
  | 'comment_25_times'
  | 'comment_50_times'
  | 'comment_100_times'
  | 'comment_250_times'
  | 'first_reaction'
  | 'receive_5_reactions'
  | 'receive_10_reactions'
  | 'receive_25_reactions'
  | 'receive_50_reactions'
  | 'receive_100_reactions'
  | 'receive_250_reactions'
  | 'receive_500_reactions'
  | 'receive_1000_reactions'
  | 'share_first_article'
  | 'share_5_articles'
  | 'share_10_articles'
  | 'share_25_articles'
  | 'share_50_articles'
  | 'first_bookmark'
  | 'bookmark_5_articles'
  | 'bookmark_10_articles'
  | 'bookmark_25_articles'
  | 'bookmark_50_articles'
  | 'bookmark_100_articles'
  | 'complete_profile'
  | 'update_avatar'
  | 'update_bio'
  | 'add_expertise_tags'
  | 'join_community'
  | 'early_adopter'
  | 'first_week_active'
  | 'first_month_active'
  | 'first_year_active'
  | 'read_10_articles'
  | 'read_50_articles'
  | 'read_100_articles'
  | 'read_500_articles'
  | 'follow_first_user'
  | 'follow_10_users'
  | 'follow_25_users'
  | 'get_10_followers'
  | 'get_50_followers'
  | 'get_100_followers'
  | 'get_500_followers'
  | 'get_1000_followers'
  | 'article_trending'
  | 'article_featured'
  | 'article_editor_choice'
  | 'community_helper'
  | 'mentor'
  | 'ambassador'

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
  // Level achievements
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
    id: 'reach_level_15',
    title: 'Master Architect',
    description: 'Reach level 15 and join the ranks of master creators.',
  },
  {
    id: 'reach_level_20',
    title: 'Legendary Pioneer',
    description: 'Reach level 20 and become a legendary figure in the community.',
  },
  // Streak achievements
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
    id: 'streak_14',
    title: 'Fortnight Champion',
    description: 'Maintain your momentum for 14 consecutive days.',
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Complete a full month of consistent engagement.',
  },
  {
    id: 'streak_60',
    title: 'Unstoppable Force',
    description: 'Maintain a 60-day streak of daily activity.',
  },
  // Publishing achievements
  {
    id: 'publish_first_article',
    title: 'First Steps',
    description: 'Publish your first article on Aetheris.',
  },
  {
    id: 'publish_10_articles',
    title: 'Prolific Writer',
    description: 'Publish 10 articles that resonate with the community.',
  },
  {
    id: 'publish_25_articles',
    title: 'Content Creator',
    description: 'Share 25 articles with the Aetheris community.',
  },
  {
    id: 'publish_50_articles',
    title: 'Thought Leader',
    description: 'Reach 50 published articles and establish your voice.',
  },
  {
    id: 'publish_100_articles',
    title: 'Publishing Legend',
    description: 'Achieve the milestone of 100 published articles.',
  },
  // Commenting achievements
  {
    id: 'first_comment',
    title: 'Voice Your Thoughts',
    description: 'Leave your first comment on a community article.',
  },
  {
    id: 'comment_10_times',
    title: 'Active Participant',
    description: 'Engage with 10 articles through thoughtful comments.',
  },
  {
    id: 'comment_50_times',
    title: 'Community Voice',
    description: 'Leave 50 thoughtful comments on community articles.',
  },
  {
    id: 'comment_100_times',
    title: 'Discussion Leader',
    description: 'Contribute 100 comments to community discussions.',
  },
  // Reaction achievements
  {
    id: 'first_reaction',
    title: 'Show Appreciation',
    description: 'Give your first reaction to a community article.',
  },
  {
    id: 'receive_10_reactions',
    title: 'Getting Noticed',
    description: 'Receive 10 reactions on your articles.',
  },
  {
    id: 'receive_50_reactions',
    title: 'Community Favorite',
    description: 'Receive 50 reactions on your published work.',
  },
  {
    id: 'receive_100_reactions',
    title: 'Highly Valued',
    description: 'Accumulate 100 reactions from the community.',
  },
  {
    id: 'receive_500_reactions',
    title: 'Community Star',
    description: 'Reach 500 total reactions on your articles.',
  },
  // Sharing achievements
  {
    id: 'share_first_article',
    title: 'Spread the Word',
    description: 'Share your first article with your network.',
  },
  {
    id: 'share_10_articles',
    title: 'Amplifier',
    description: 'Share 10 articles with your network.',
  },
  {
    id: 'share_25_articles',
    title: 'Content Curator',
    description: 'Share 25 articles to help others discover great content.',
  },
  // Bookmark achievements
  {
    id: 'first_bookmark',
    title: 'Save for Later',
    description: 'Bookmark your first article for future reading.',
  },
  {
    id: 'bookmark_10_articles',
    title: 'Reading List Builder',
    description: 'Create a reading list with 10 bookmarked articles.',
  },
  {
    id: 'bookmark_25_articles',
    title: 'Knowledge Collector',
    description: 'Build a collection of 25 bookmarked articles.',
  },
  // Profile achievements
  {
    id: 'complete_profile',
    title: 'Profile Complete',
    description: 'Fill out your complete profile with all details.',
  },
  {
    id: 'update_avatar',
    title: 'Show Your Face',
    description: 'Add or update your profile avatar.',
  },
  {
    id: 'join_community',
    title: 'Welcome Aboard',
    description: 'Join the Aetheris community and complete onboarding.',
  },
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Be among the first members of the Aetheris community.',
  },
  // Milestone achievements
  {
    id: 'complete_daily_set',
    title: 'Daily Focus',
    description: 'Complete all daily quests in a single day.',
  },
  {
    id: 'complete_weekly_set',
    title: 'Weekly Warrior',
    description: 'Complete all weekly quests in a single week.',
  },
  {
    id: 'complete_monthly_set',
    title: 'Monthly Master',
    description: 'Complete all monthly quests in a single month.',
  },
  // Additional publishing achievements
  {
    id: 'publish_5_articles',
    title: 'Getting Started',
    description: 'Publish your first 5 articles on Aetheris.',
  },
  {
    id: 'publish_250_articles',
    title: 'Content Master',
    description: 'Reach the milestone of 250 published articles.',
  },
  {
    id: 'publish_500_articles',
    title: 'Publishing Titan',
    description: 'Achieve the incredible feat of 500 published articles.',
  },
  // Additional comment achievements
  {
    id: 'comment_5_times',
    title: 'Engaging',
    description: 'Leave 5 comments on community articles.',
  },
  {
    id: 'comment_25_times',
    title: 'Active Commenter',
    description: 'Engage with 25 articles through comments.',
  },
  {
    id: 'comment_250_times',
    title: 'Discussion Master',
    description: 'Contribute 250 comments to community discussions.',
  },
  // Additional reaction achievements
  {
    id: 'receive_5_reactions',
    title: 'First Recognition',
    description: 'Receive your first 5 reactions on articles.',
  },
  {
    id: 'receive_25_reactions',
    title: 'Appreciated',
    description: 'Receive 25 reactions on your published work.',
  },
  {
    id: 'receive_250_reactions',
    title: 'Highly Valued Creator',
    description: 'Accumulate 250 reactions from the community.',
  },
  {
    id: 'receive_1000_reactions',
    title: 'Community Icon',
    description: 'Reach the incredible milestone of 1000 reactions.',
  },
  // Additional sharing achievements
  {
    id: 'share_5_articles',
    title: 'Sharing Starter',
    description: 'Share 5 articles with your network.',
  },
  {
    id: 'share_50_articles',
    title: 'Content Amplifier',
    description: 'Share 50 articles to help others discover great content.',
  },
  // Additional bookmark achievements
  {
    id: 'bookmark_5_articles',
    title: 'Curator',
    description: 'Bookmark 5 articles for future reading.',
  },
  {
    id: 'bookmark_50_articles',
    title: 'Knowledge Seeker',
    description: 'Build a collection of 50 bookmarked articles.',
  },
  {
    id: 'bookmark_100_articles',
    title: 'Library Builder',
    description: 'Create an extensive library with 100 bookmarked articles.',
  },
  // Additional level achievements
  {
    id: 'reach_level_25',
    title: 'Elite Creator',
    description: 'Reach level 25 and join the elite ranks.',
  },
  {
    id: 'reach_level_30',
    title: 'Aetheris Legend',
    description: 'Reach level 30 and become a true legend of the platform.',
  },
  // Additional streak achievements
  {
    id: 'streak_100',
    title: 'Centurion',
    description: 'Maintain a 100-day streak of daily activity.',
  },
  {
    id: 'streak_365',
    title: 'Year of Dedication',
    description: 'Complete a full year of consistent daily engagement.',
  },
  // Profile achievements
  {
    id: 'update_bio',
    title: 'Tell Your Story',
    description: 'Add or update your profile bio.',
  },
  {
    id: 'add_expertise_tags',
    title: 'Showcase Skills',
    description: 'Add expertise tags to your profile.',
  },
  // Activity milestones
  {
    id: 'first_week_active',
    title: 'Week One',
    description: 'Stay active for your first week on Aetheris.',
  },
  {
    id: 'first_month_active',
    title: 'Monthly Member',
    description: 'Complete your first month of activity.',
  },
  {
    id: 'first_year_active',
    title: 'Year One',
    description: 'Celebrate your first year on Aetheris.',
  },
  // Reading achievements
  {
    id: 'read_10_articles',
    title: 'Reader',
    description: 'Read 10 articles on the platform.',
  },
  {
    id: 'read_50_articles',
    title: 'Avid Reader',
    description: 'Read 50 articles and expand your knowledge.',
  },
  {
    id: 'read_100_articles',
    title: 'Knowledge Seeker',
    description: 'Read 100 articles from the community.',
  },
  {
    id: 'read_500_articles',
    title: 'Scholar',
    description: 'Read 500 articles and become a true scholar.',
  },
  // Social achievements
  {
    id: 'follow_first_user',
    title: 'First Connection',
    description: 'Follow your first user on Aetheris.',
  },
  {
    id: 'follow_10_users',
    title: 'Building Network',
    description: 'Follow 10 users and grow your network.',
  },
  {
    id: 'follow_25_users',
    title: 'Network Builder',
    description: 'Follow 25 users and expand your connections.',
  },
  {
    id: 'get_10_followers',
    title: 'Getting Noticed',
    description: 'Gain your first 10 followers.',
  },
  {
    id: 'get_50_followers',
    title: 'Growing Audience',
    description: 'Reach 50 followers on your profile.',
  },
  {
    id: 'get_100_followers',
    title: 'Influencer',
    description: 'Build an audience of 100 followers.',
  },
  {
    id: 'get_500_followers',
    title: 'Thought Leader',
    description: 'Reach 500 followers and become a recognized voice.',
  },
  {
    id: 'get_1000_followers',
    title: 'Community Star',
    description: 'Achieve 1000 followers and become a platform star.',
  },
  // Special achievements
  {
    id: 'article_trending',
    title: 'Trending',
    description: 'Have one of your articles become trending.',
  },
  {
    id: 'article_featured',
    title: 'Featured Creator',
    description: 'Have one of your articles featured on the homepage.',
  },
  {
    id: 'article_editor_choice',
    title: "Editor's Choice",
    description: 'Have an article selected as editor\'s choice.',
  },
  {
    id: 'community_helper',
    title: 'Community Helper',
    description: 'Be recognized for helping other community members.',
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'Become a mentor to new community members.',
  },
  {
    id: 'ambassador',
    title: 'Aetheris Ambassador',
    description: 'Be selected as an official Aetheris ambassador.',
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
    const id = achievement.id

    // Level achievements
    if (id.startsWith('reach_level_')) {
      const targetLevel = parseInt(id.replace('reach_level_', ''), 10)
      shouldUnlock = level >= targetLevel
    }
    // Streak achievements
    else if (id.startsWith('streak_')) {
      const targetDays = parseInt(id.replace('streak_', ''), 10)
      shouldUnlock = streakDays >= targetDays || bestStreak >= targetDays
    }
    // Milestone achievements
    else if (id === 'complete_daily_set') {
        shouldUnlock = dailyQuests.length > 0 && dailyQuests.every((quest) => quest.completed)
    }
    // Profile achievements - these would need to be checked against user data
    // For now, we'll leave them as false until backend integration
    else if (id === 'complete_profile' || id === 'update_avatar' || id === 'join_community' || id === 'early_adopter') {
      // These require user profile data - will be handled in backend integration
      shouldUnlock = false
    }
    // Activity achievements (publishing, commenting, reactions, etc.)
    // These require tracking counters - will be handled in backend integration
    else if (
      id.startsWith('publish_') ||
      id.startsWith('comment_') ||
      id.startsWith('receive_') ||
      id.startsWith('share_') ||
      id.startsWith('bookmark_') ||
      id === 'first_comment' ||
      id === 'first_reaction'
    ) {
      // These require activity counters - will be handled in backend integration
      shouldUnlock = false
    }
    // Unknown achievements
    else {
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

