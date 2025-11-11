import { useEffect, type ReactNode } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileEdit,
  Flame,
  Globe,
  ListChecks,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  NotebookPen,
  ClipboardList,
  PenSquare,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  MapPin,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProfileDetailsStore, defaultProfileDetails, type ProfileDetails, type PreferredContactMethod } from '@/stores/profileDetailsStore'
import { getUserProfile } from '@/api/profile'
import type { UserProfile } from '@/types/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { ArticleCard } from '@/components/ArticleCard'
import {
  useGamificationStore,
  type GamificationAchievement,
  type DailyQuest,
  LEVEL_MILESTONES,
} from '@/stores/gamificationStore'
import { shallow } from 'zustand/shallow'
import { cn } from '@/lib/utils'

type InsightMetric = {
  label: string
  value: string
  change: string
  icon: LucideIcon
  helper: string
}

type ContentMixEntry = {
  label: string
  percentage: number
  helper: string
}

type ActivityItem = {
  title: string
  description: string
  time: string
  icon: LucideIcon
}

type CreatorGoal = {
  title: string
  progress: number
  target: string
  icon: LucideIcon
}

type PinnedCollection = {
  title: string
  description: string
  articles: number
}

type QuickAction = {
  label: string
  description: string
  icon: LucideIcon
  onClick: () => void
}

type ProfileComment = {
  id: string
  articleTitle: string
  articleId: string
  excerpt: string
  publishedAt: string
  likes?: number
}

type ProfileDraft = {
  id: string
  title: string
  summary: string
  updatedAt: string
  progress: number
}

type ProfileBookmark = {
  id: string
  title: string
  description: string
  articleId: string
}

interface LevelProgressCardProps {
  level: number
  totalExperience: number
  xpProgress: number
  xpCurrent: number
  xpRequired: number
  xpToNextLevel: number
  streak: number
  bestStreak: number
  recentActivity: Array<{ id: string; label: string; xp: number; at: string }>
}

function LevelProgressCard({
  level,
  totalExperience,
  xpProgress,
  xpCurrent,
  xpRequired,
  xpToNextLevel,
  streak,
  bestStreak,
  recentActivity,
}: LevelProgressCardProps) {
  const activityPreview = recentActivity.slice(0, 3)

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Award className="h-4 w-4 text-primary" />
          Creator level
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Earn XP by publishing, collaborating, and supporting the community.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>Level {level}</span>
            <span>{xpProgress}%</span>
          </div>
          <Progress value={xpProgress} className="mt-2 h-2" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {xpCurrent} / {xpRequired} XP in level
            </span>
            <span>{xpToNextLevel} XP to next milestone</span>
            <span className="ml-auto font-medium text-foreground">
              Total XP: {totalExperience}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current streak
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Flame className={cn('h-4 w-4', streak > 0 ? 'text-primary' : 'text-muted-foreground')} />
              {streak} day{streak === 1 ? '' : 's'}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Best streak
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              {bestStreak} day{bestStreak === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {activityPreview.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent XP
            </p>
            <ul className="space-y-1.5">
              {activityPreview.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground"
                >
                  <span className="flex items-center gap-2 text-left">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {entry.label}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    +{entry.xp} XP
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No recent activity yet. Complete quests or publish to earn experience.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementsSpotlight({ achievements }: { achievements: GamificationAchievement[] }) {
  if (!achievements.length) return null

  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked === b.unlocked) {
      return (a.unlockedAt ?? '').localeCompare(b.unlockedAt ?? '')
    }
    return a.unlocked ? -1 : 1
  })

  const spotlight = sorted.slice(0, 3)

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Trophy className="h-4 w-4 text-primary" />
          Achievements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Unlock badges as you grow. Higher levels unlock community perks.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {spotlight.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              'rounded-lg border bg-background/70 p-3 transition-colors',
              achievement.unlocked
                ? 'border-primary/50 shadow-sm'
                : 'border-border/60 opacity-70'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              {achievement.unlocked ? (
                <Badge variant="secondary" className="flex items-center gap-1 rounded-md text-[11px] uppercase tracking-wide">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-md text-[11px] uppercase tracking-wide">
                  Locked
                </Badge>
              )}
            </div>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Earned {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
        {achievements.length > spotlight.length && (
          <p className="text-xs text-muted-foreground">
            {achievements.length - spotlight.length} more achievements waiting to be unlocked.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function DailyQuestBoard({
  quests,
  onQuestComplete,
  isOwnProfile,
}: {
  quests: DailyQuest[]
  onQuestComplete: (questId: string) => void
  isOwnProfile: boolean
}) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ListChecks className="h-4 w-4 text-primary" />
          Daily focus
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete quests to earn extra XP. New objectives appear every morning.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{quest.title}</p>
              <p className="text-xs text-muted-foreground">{quest.description}</p>
            </div>
            {quest.completed ? (
              <Badge variant="secondary" className="flex items-center gap-1 rounded-md py-1 text-[11px] uppercase tracking-wide">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Done
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => (isOwnProfile ? onQuestComplete(quest.id) : undefined)}
                disabled={!isOwnProfile}
              >
                {isOwnProfile ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    +{quest.xpReward} XP
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Locked
                  </>
                )}
              </Button>
            )}
          </div>
        ))}
        {!isOwnProfile && (
          <p className="text-xs text-muted-foreground">
            Daily quests are only interactive for the profile owner.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function HallOfFamePath({ level }: { level: number }) {
  const milestones = LEVEL_MILESTONES.map((milestone) => {
    if (level >= milestone.level) {
      return { ...milestone, status: 'achieved' as const }
    }
    if (level + 1 === milestone.level) {
      return { ...milestone, status: 'next' as const }
    }
    return { ...milestone, status: 'locked' as const }
  })

  const firstPendingIndex = milestones.findIndex((milestone) => milestone.status !== 'achieved')

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Star className="h-4 w-4 text-primary" />
          Path of glory
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how close you are to prestige milestones and community recognitions.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {milestones.map((milestone, index) => {
            const isAchieved = milestone.status === 'achieved'
            const isNext = milestone.status === 'next'
            const isHighlighted = isNext || (isAchieved && index === firstPendingIndex - 1)

            return (
              <li key={milestone.level} className="relative pl-10">
                {index !== milestones.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[15px] top-7 h-[calc(100%_-_1.25rem)] w-px',
                      isAchieved ? 'bg-primary/60' : 'bg-border'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    isAchieved
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : isNext
                        ? 'border-primary/40 bg-primary/5 text-primary'
                        : 'border-border bg-muted/60 text-muted-foreground'
                  )}
                >
                  {milestone.level}
                </span>
                <div
                  className={cn(
                    'rounded-lg border border-border/60 bg-background/80 p-3 transition-colors',
                    isHighlighted && 'border-primary/60 shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                    <Badge
                      variant={isAchieved ? 'secondary' : isNext ? 'outline' : 'outline'}
                      className={cn(
                        'rounded-md text-[11px] uppercase tracking-wide',
                        isAchieved ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {isAchieved ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
                          Achieved
                        </>
                      ) : isNext ? (
                        'Next reward'
                      ) : (
                        'Locked'
                      )}
                    </Badge>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted/30 px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {milestone.reward}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

type ExtendedProfileFields = {
  audienceInsights?: InsightMetric[]
  contentMix?: ContentMixEntry[]
  activityTimeline?: ActivityItem[]
  creatorGoals?: CreatorGoal[]
  pinnedCollections?: PinnedCollection[]
  recentComments?: ProfileComment[]
  drafts?: ProfileDraft[]
  bookmarks?: ProfileBookmark[]
  profileDetails?: Partial<ProfileDetails>
}

const CONTACT_METHOD_LABELS: Record<PreferredContactMethod, string> = {
  email: 'Email',
  'direct-message': 'Direct messages',
  schedule: 'Scheduling link',
  social: 'Social first',
  'not-specified': 'No preference set',
}

const mockProfile: UserProfile = {
  user: {
    id: 0,
    username: 'Noelle Rivers',
    bio: 'Design director at Aetheris. Exploring calm tech, accessibility, and mindful publishing.',
    memberSince: '2019-08-14T00:00:00.000Z',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1280&q=80',
  },
  stats: {
    publishedArticles: 128,
    draftArticles: 6,
    totalLikes: 18240,
    totalComments: 964,
  },
  highlights: {
    tags: ['design systems', 'ux writing', 'calm tech', 'accessibility', 'editorial strategy'],
    recentArticleCount: 4,
  },
  articles: [
    {
      id: 'mock-aetheris-quiet-spaces',
      documentId: 'mock-aetheris-quiet-spaces',
      databaseId: 1,
      title: 'Designing quiet spaces inside loud products',
      content:
        'Mock content describing how to build restorative moments inside complex workflows. This placeholder text simulates a 1.2k word article to power the read-time estimate in the UI.',
      excerpt:
        'Tech teams are embracing restorative UI moments. Here is the framework we use to keep experiences calm even during intense release cycles.',
      author: {
        id: 0,
        username: 'Noelle Rivers',
      },
      tags: ['design', 'calm interfaces', 'research'],
      createdAt: '2025-03-01T09:00:00.000Z',
      updatedAt: '2025-03-05T12:00:00.000Z',
      status: 'published',
      likes: 1240,
      commentsCount: 58,
      previewImage:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      difficulty: 'intermediate',
      views: 48000,
    },
    {
      id: 'mock-editorial-rhythm',
      documentId: 'mock-editorial-rhythm',
      databaseId: 2,
      title: 'Rebuilding editorial rhythm with mindful tooling',
      content:
        'A mock deep dive exploring how we redesigned the editorial process at Aetheris. The content focuses on cadence, voice, and reducing burnout for the team.',
      excerpt:
        'How a small tooling change helped our editors reclaim focus time, reduce context switching, and keep author voice consistent across issues.',
      author: {
        id: 0,
        username: 'Noelle Rivers',
      },
      tags: ['workflow', 'editorial', 'team operations'],
      createdAt: '2025-02-10T11:30:00.000Z',
      updatedAt: '2025-02-18T08:45:00.000Z',
      status: 'published',
      likes: 986,
      commentsCount: 34,
      previewImage:
        'https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=1200&q=80',
      difficulty: 'advanced',
      views: 36500,
    },
  ],
}

const mockProfileDetails: ProfileDetails = {
  headline: 'Design director shaping calm publishing tools',
  availability: 'Open for design systems consulting and guest lectures.',
  currentRole: 'Design Director',
  currentCompany: 'Aetheris Studio',
  yearsExperience: '10+ years in product and editorial design',
  timezone: 'UTC+1 · Central European Time',
  pronouns: 'she/they',
  contactEmail: 'hello@aetheris.dev',
  website: 'https://aetheris.dev',
  location: 'Valencia, Spain',
  languages: 'English, Spanish, Catalan',
  focusAreas: 'Calm interfaces, accessibility systems, editorial strategy, mindful publishing',
  currentlyLearning: 'Multi-sensory reading experiences and tactile motion design',
  openToMentoring: true,
  openToConsulting: true,
  openToSpeaking: true,
  preferredContactMethod: 'email',
  newsletterName: 'Field Notes',
  newsletterUrl: 'https://newsletter.aetheris.dev',
  officeHours: 'Replies within 48h · Tues–Thurs 10:00–16:00 CET',
  collaborationNotes: 'Excited about mindful product teams, editorial ops, and inclusive tooling.',
  social: {
    twitter: 'https://twitter.com/aetheris',
    github: 'https://github.com/aetheris',
    linkedin: 'https://linkedin.com/in/aetheris',
    portfolio: 'https://dribbble.com/aetheris',
  },
}

const mockAudienceInsights: InsightMetric[] = [
  {
    label: 'Active readers',
    value: '12.4k',
    change: '+8.2% vs last month',
    icon: Users,
    helper: 'Unique visitors who read for 3+ minutes',
  },
  {
    label: 'Newsletter growth',
    value: '1.3k',
    change: '+12.1% this quarter',
    icon: TrendingUp,
    helper: 'New email subscribers attributed to articles',
  },
  {
    label: 'Reader retention',
    value: '68%',
    change: '+3.1% week over week',
    icon: Target,
    helper: 'Percentage finishing more than 60% of each article',
  },
  {
    label: 'Community replies',
    value: '214',
    change: '+5.4% since last post',
    icon: MessageCircle,
    helper: 'Comments gathered across all distribution channels',
  },
];

const mockContentMix: ContentMixEntry[] = [
  { label: 'Deep dives', percentage: 42, helper: 'Research-heavy explorations with diagrams' },
  { label: 'Case studies', percentage: 27, helper: 'Partner features and product teardowns' },
  { label: 'Frameworks', percentage: 19, helper: 'Reusable templates for product teams' },
  { label: 'Weekend reads', percentage: 12, helper: 'Short reflective pieces for the newsletter' },
];

const mockActivityTimeline: ActivityItem[] = [
  {
    title: 'Shipped redesign playbook',
    description: 'Guided 40 editors through the new calm interface checklist.',
    time: '3 days ago',
    icon: Sparkles,
  },
  {
    title: 'Hosted live Q&A',
    description: 'Answered 55 community questions about inclusive typography.',
    time: '1 week ago',
    icon: MessageCircle,
  },
  {
    title: 'Interview published',
    description: 'Shared insights from Studio Aurora on mindful product launches.',
    time: '2 weeks ago',
    icon: NotebookPen,
  },
  {
    title: 'Milestone reached',
    description: 'Celebrated 10k newsletter subscribers with a limited series.',
    time: 'Last month',
    icon: Flame,
  },
];

const mockCreatorGoals: CreatorGoal[] = [
  {
    title: 'Release the consistency playbook',
    progress: 68,
    target: 'Drafting chapters • targeting April release',
    icon: BookOpen,
  },
  {
    title: 'Mentorship sessions for product teams',
    progress: 45,
    target: '12 of 20 sessions booked for Q2 cohorts',
    icon: CalendarClock,
  },
  {
    title: 'Accessibility audit series',
    progress: 90,
    target: '3 of 4 long-form reports drafted',
    icon: Target,
  },
];

const mockPinnedCollections: PinnedCollection[] = [
  {
    title: 'Calm Interface Patterns',
    description: 'A curated set of articles and worksheets for reducing cognitive load in dashboards.',
    articles: 12,
  },
  {
    title: 'Workshop Toolkits',
    description: 'Slide decks, facilitation guides, and Figma resources for design sprints.',
    articles: 6,
  },
]

const mockRecentComments: ProfileComment[] = [
  {
    id: 'comment-1',
    articleTitle: 'Designing quiet spaces inside loud products',
    articleId: 'mock-aetheris-quiet-spaces',
    excerpt: 'Loved the part about reducing notification fatigue — especially the staged announcements. Looking forward to trying this with our fintech dashboard.',
    publishedAt: '2025-03-11T10:00:00.000Z',
    likes: 42,
  },
  {
    id: 'comment-2',
    articleTitle: 'Rebuilding editorial rhythm with mindful tooling',
    articleId: 'mock-editorial-rhythm',
    excerpt: 'We applied your cadence model to our content calendar and saw an instant morale boost. Thanks for sharing the audit checklist! ',
    publishedAt: '2025-02-22T09:15:00.000Z',
    likes: 18,
  },
  {
    id: 'comment-3',
    articleTitle: 'Calming notification ecosystems',
    articleId: 'mock-notifications',
    excerpt: 'Will you release the data viz templates mentioned during the livestream? They would be a game changer for our ops team.',
    publishedAt: '2025-01-30T21:45:00.000Z',
  },
]

const mockDrafts: ProfileDraft[] = [
  {
    id: 'draft-1',
    title: 'Design review rituals for async teams',
    summary: 'Iterating on the weekly review to reduce meeting load while keeping quality bars high.',
    updatedAt: '2025-03-09T08:30:00.000Z',
    progress: 68,
  },
  {
    id: 'draft-2',
    title: 'Accessible notification palettes',
    summary: 'A guide to building notification color systems with contrast budgets and motion comfort.',
    updatedAt: '2025-02-27T17:10:00.000Z',
    progress: 42,
  },
]

const mockBookmarks: ProfileBookmark[] = [
  {
    id: 'bookmark-1',
    title: 'Typography tuning in Strapi + shadcn',
    description: 'Great breakdown on how to keep modular scales in sync with theming tokens.',
    articleId: 'ref-typography',
  },
  {
    id: 'bookmark-2',
    title: 'Motion safety checklist',
    description: 'Collection of heuristics to keep animations accessible for vestibular disorders.',
    articleId: 'ref-motion',
  },
]

/**
 * Developer Note:
 * - The mock objects above mirror the full UX we want to ship. To go live, extend the Strapi profile API (or companion endpoints)
 *   so it returns: audience insight metrics, content mix percentages, creator goals, pinned collections, activity timeline items,
 *   recent comments, draft previews, and saved bookmarks in addition to the existing author + article payload.
 * - Suggested approach: add component collections such as `profile-insights`, `profile-content-mix`, `profile-goals`,
 *   `profile-activities`, `profile-comments`, `profile-drafts`, and `profile-bookmarks` to the `profile` content type. Shape them to match the TypeScript interfaces in this file. Store
 *   percentage deltas and helper text so the UI can render without extra transformation.
 * - Update `getUserProfile` in `src/api/profile.ts` (using axios + TanStack Query) to hydrate these new fields and return them
 *   alongside the core `UserProfile`. Then widen the `UserProfile` type (or create an extended type) with optional properties
 *   for `audienceInsights`, `contentMix`, `activityTimeline`, `creatorGoals`, `pinnedCollections`, `recentComments`, `drafts`, and `bookmarks`.
 * - Once the API serves real data, remove the `usingMockData` fallback, drop the visual callout, and delete the mocks defined
 *   in this file. The new sections will automatically render live data because they already read from the hydrated profile object.
 */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Card className="overflow-hidden border-border/60 shadow-lg">
        <div className="relative h-36 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background" />
        </div>
        <CardContent className="pb-10 pt-10 md:pt-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
              <div className="-mt-20 h-24 w-24 rounded-full border-4 border-background bg-muted md:-mt-24" />
              <div className="space-y-3">
                <div className="h-6 w-40 rounded bg-muted/70" />
                <div className="h-4 w-24 rounded bg-muted/60" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-lg bg-muted/70" />
              <div className="h-10 w-28 rounded-lg bg-muted/50" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-24 rounded-xl bg-muted/60" />
            <div className="h-24 rounded-xl bg-muted/60" />
            <div className="h-24 rounded-xl bg-muted/60" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-64 bg-muted/50" />
        <div className="space-y-4">
          <Card className="h-40 bg-muted/50" />
          <Card className="h-40 bg-muted/50" />
        </div>
      </div>
    </div>
  )
}

function MockDataCallout() {
  return (
    <Card className="border border-dashed border-primary/40 bg-primary/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Preview data in use</p>
          <p className="text-xs text-muted-foreground">
            The profile screen is currently driven by mock data. See the developer note in `ProfilePage.tsx`
            for instructions on wiring real Strapi responses.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  if (!actions.length) return null
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardList className="h-4 w-4 text-primary" />
          Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="ghost"
              type="button"
              className="w-full justify-between gap-3 rounded-md border border-transparent px-3 py-6 text-left hover:border-border"
              onClick={action.onClick}
            >
              <span className="flex flex-col items-start gap-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}

function AudienceInsightsGrid({ metrics }: { metrics: InsightMetric[] }) {
  if (!metrics.length) return null
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="border-border/60 bg-card/80 shadow-sm">
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">{metric.value}</span>
                  <Badge variant="outline" className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{metric.helper}</p>
              </div>
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ContentMixCard({ entries }: { entries: ContentMixEntry[] }) {
  if (!entries.length) return null
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BookOpen className="h-4 w-4 text-primary" />
          Content mix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Highlights how this creator balances deep dives, toolkits, and editorial series.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{entry.label}</span>
              <span>{entry.percentage}%</span>
            </div>
            <Progress value={entry.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{entry.helper}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function CreatorGoalsCard({ goals }: { goals: CreatorGoal[] }) {
  if (!goals.length) return null
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-4 w-4 text-primary" />
          Creator goals
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track long-running initiatives, workshops, or launch plans.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const Icon = goal.icon
          const complete = goal.progress >= 100
          return (
            <div key={goal.title} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {goal.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{goal.target}</p>
                </div>
                {complete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <Progress value={Math.min(goal.progress, 100)} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function PinnedCollectionsCard({ collections }: { collections: PinnedCollection[] }) {
  if (!collections.length) return null
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Pinned collections
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Curated sets of articles and resources the author wants readers to explore first.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {collections.map((collection) => (
          <button
            key={collection.title}
            type="button"
            className="group w-full rounded-lg border border-border/40 bg-card/70 p-4 text-left transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                  {collection.title}
                </p>
                <p className="text-xs text-muted-foreground">{collection.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <Badge
              variant="outline"
              className="mt-3 inline-flex items-center gap-1 rounded-md text-[11px] uppercase tracking-wide"
            >
              {collection.articles} articles
            </Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

function ActivityTimelineCard({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarClock className="h-4 w-4 text-primary" />
          Activity timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A log of recent milestones, live sessions, and noteworthy publishing moments.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.title} className="flex items-start gap-3">
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.time}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function ProfileFact({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm leading-relaxed text-foreground">{value}</div>
    </div>
  )
}

function AboutAuthorCard({ profile, details }: { profile: UserProfile; details?: ProfileDetails }) {
  const contactEmail = details?.contactEmail?.trim()
  const website = details?.website?.trim()
  const newsletterUrl = details?.newsletterUrl?.trim()
  const newsletterName = details?.newsletterName?.trim()
  const availabilityNote = details?.availability?.trim()
  const languages = details?.languages?.trim()
  const focusAreas = details?.focusAreas?.trim()
  const currentlyLearning = details?.currentlyLearning?.trim()
  const officeHours = details?.officeHours?.trim()
  const collaborationNotes = details?.collaborationNotes?.trim()
  const preferredContactLabel =
     details && details.preferredContactMethod !== 'not-specified'
       ? CONTACT_METHOD_LABELS[details.preferredContactMethod]
       : undefined
 
   const socialLinks = details
     ? [
         { label: 'Twitter', href: details.social.twitter?.trim() },
         { label: 'GitHub', href: details.social.github?.trim() },
         { label: 'LinkedIn', href: details.social.linkedin?.trim() },
         { label: 'Portfolio', href: details.social.portfolio?.trim() },
       ].filter((entry) => entry.href)
     : []
  const activeAvailability = details
    ? [
        { label: 'Mentoring', active: details.openToMentoring },
        { label: 'Consulting', active: details.openToConsulting },
        { label: 'Speaking', active: details.openToSpeaking },
      ].filter((entry) => entry.active)
    : []

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-4 w-4 text-primary" />
          About the author
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.user.bio
            ? profile.user.bio
            : 'This author prefers to let their writing speak for itself. Check back later for more details.'}
        </p>
        {details ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileFact label="Location" value={details?.location?.trim()} />
              <ProfileFact label="Availability" value={availabilityNote} />
              <ProfileFact label="Languages" value={languages} />
              <ProfileFact label="Focus areas" value={focusAreas} />
              <ProfileFact label="Currently exploring" value={currentlyLearning} />
              <ProfileFact label="Office hours" value={officeHours} />
              <ProfileFact label="Collaboration notes" value={collaborationNotes} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open to</p>
              {activeAvailability.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeAvailability.map((item) => (
                    <Badge key={item.label} variant="secondary" className="rounded-md">
                      {item.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No public availability commitments yet.</p>
              )}
            </div>

            {(contactEmail || website || preferredContactLabel) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {contactEmail}
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Visit site
                    </a>
                  )}
                  {preferredContactLabel && (
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4" />
                      {preferredContactLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {(newsletterName || newsletterUrl) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Newsletter</p>
                <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <PenSquare className="h-3 w-3 text-primary" />
                  {newsletterUrl ? (
                    <a href={newsletterUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline-offset-4 hover:underline">
                      {newsletterName || 'Read the latest edition'}
                    </a>
                  ) : (
                    <span>{newsletterName}</span>
                  )}
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Social</p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.label}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
            Interested in guest posts or collaborations? Contact the editorial team and we&apos;ll help you connect.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommentsFeed({
  comments,
  onArticleClick,
}: {
  comments: ProfileComment[]
  onArticleClick?: (articleId: string) => void
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card
          key={comment.id}
          className="border-border/60 bg-card/80 shadow-sm transition-colors hover:border-primary/40"
        >
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onArticleClick?.(comment.articleId)}
                className="group inline-flex items-center gap-2 text-left text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <NotebookPen className="h-4 w-4" />
                <span>{comment.articleTitle}</span>
              </button>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {new Date(comment.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{comment.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground/80">
              <span>ID: {comment.id}</span>
              {comment.likes !== undefined && (
                <Badge variant="outline" className="rounded-md">
                  {comment.likes} likes received
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DraftsPreview({ drafts }: { drafts: ProfileDraft[] }) {
  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id} className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{draft.title}</p>
                <p className="text-xs text-muted-foreground">{draft.summary}</p>
              </div>
              <Badge variant="outline" className="rounded-md text-[11px] uppercase tracking-wide">
                Updated {new Date(draft.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Completion
              </span>
              <Progress value={draft.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BookmarksShelf({
  bookmarks,
  onArticleClick,
}: {
  bookmarks: ProfileBookmark[]
  onArticleClick?: (articleId: string) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{bookmark.title}</p>
                <p className="text-xs text-muted-foreground">{bookmark.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onArticleClick?.(bookmark.articleId)}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                View
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuthStore()

  const routeProfileId = id ? Number(id) : undefined
  const profileId = !Number.isNaN(routeProfileId ?? NaN)
    ? routeProfileId
    : currentUser?.id

  useEffect(() => {
    if (!routeProfileId && currentUser?.id) {
      navigate(`/profile/${currentUser.id}`, { replace: true })
    }
  }, [routeProfileId, currentUser, navigate])

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getUserProfile(profileId!),
    enabled: !!profileId,
  })

  const usingMockData = !profile
  const displayProfile = profile ?? mockProfile
  const coverImageUrl = displayProfile.user.coverImageUrl ?? null
  const stats = displayProfile.stats
  const highlightedTags = displayProfile.highlights.tags
  const articlesToDisplay =
    displayProfile.articles && displayProfile.articles.length > 0
      ? displayProfile.articles
      : mockProfile.articles

  const publishedArticles = articlesToDisplay.filter((article) => article.status !== 'archived')
  const isOwnProfile = profile?.user.id === currentUser?.id

  const extendedProfile = profile as (UserProfile & ExtendedProfileFields) | undefined

  const mergedApiProfileDetails = extendedProfile?.profileDetails
    ? {
        ...defaultProfileDetails,
        ...extendedProfile.profileDetails,
        social: {
          ...defaultProfileDetails.social,
          ...extendedProfile.profileDetails.social,
        },
      }
    : undefined

  const storeProfileDetails = useProfileDetailsStore((state) => state.details)

  const visibleProfileDetails: ProfileDetails | undefined = mergedApiProfileDetails
    ?? (isOwnProfile ? storeProfileDetails : usingMockData ? mockProfileDetails : undefined)

  const professionalMetaLine = visibleProfileDetails
    ? [
        visibleProfileDetails.currentRole?.trim(),
        visibleProfileDetails.currentCompany?.trim(),
        visibleProfileDetails.timezone?.trim(),
      ]
        .filter((value): value is string => !!value && value.length > 0)
        .join(' · ')
    : ''

  const headlineText = visibleProfileDetails?.headline?.trim()
  const locationText = visibleProfileDetails?.location?.trim()
  const websiteUrl = visibleProfileDetails?.website?.trim()
  const preferredContactLabel =
    visibleProfileDetails && visibleProfileDetails.preferredContactMethod !== 'not-specified'
      ? CONTACT_METHOD_LABELS[visibleProfileDetails.preferredContactMethod]
      : undefined

  const audienceInsights = extendedProfile?.audienceInsights ?? mockAudienceInsights
  const contentMix = extendedProfile?.contentMix ?? mockContentMix
  const activityTimeline = extendedProfile?.activityTimeline ?? mockActivityTimeline
  const creatorGoals = extendedProfile?.creatorGoals ?? mockCreatorGoals
  const pinnedCollections = extendedProfile?.pinnedCollections ?? mockPinnedCollections
  const recentComments = extendedProfile?.recentComments ?? mockRecentComments
  const drafts = extendedProfile?.drafts ?? mockDrafts
  const bookmarks = extendedProfile?.bookmarks ?? mockBookmarks

  const {
    level: userLevel,
    experience: totalExperience,
    xpIntoLevel,
    xpForLevel,
    streakDays,
    bestStreak,
    achievements,
    dailyQuests,
    recentActivity,
    completeQuest,
  registerActivity,
  } = useGamificationStore(
    (state) => ({
      level: state.level,
      experience: state.experience,
      xpIntoLevel: state.xpIntoLevel,
      xpForLevel: state.xpForLevel,
      streakDays: state.streakDays,
      bestStreak: state.bestStreak,
      achievements: state.achievements,
      dailyQuests: state.dailyQuests,
      recentActivity: state.recentActivity,
      completeQuest: state.completeQuest,
    registerActivity: state.registerActivity,
    }),
    shallow
  )

  const xpProgressPercent =
    xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0
  const xpToNextLevel = Math.max(xpForLevel - xpIntoLevel, 0)
  const profileQuickActions: QuickAction[] = isOwnProfile
    ? [
    {
      label: 'Draft new article',
      description: 'Open the editor with a guided outline.',
      icon: PenSquare,
      onClick: () => navigate('/create'),
    },
    {
      label: 'Log writing session',
      description: 'Earn XP for staying consistent with today’s focus.',
      icon: ClipboardList,
      onClick: () => registerActivity('daily_login'),
    },
    {
      label: 'Review analytics',
      description: 'Check last week’s audience performance.',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
    },
    {
      label: 'Share public profile',
      description: 'Copy a link to your latest portfolio.',
      icon: Globe,
      onClick: () => navigate(`/profile/${displayProfile.user.id}`),
    },
  ]
    : [
        {
          label: 'Follow author',
          description: 'Get notified when new articles drop.',
          icon: Sparkles,
          onClick: () => navigate('/auth'),
        },
        {
          label: 'Start collaboration',
          description: 'Pitch an idea or request an interview.',
          icon: MessageCircle,
          onClick: () => navigate('/auth'),
        },
        {
          label: 'Share profile',
          description: 'Spread the word with your audience.',
          icon: Globe,
          onClick: () => navigate(`/profile/${displayProfile.user.id}`),
        },
      ]

  if (!profileId && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <div className="container py-24 text-center">
          <Card className="mx-auto max-w-md border-dashed bg-muted/40">
            <CardContent className="space-y-4 py-10">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">Profile not found</CardTitle>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t determine which profile to show. Try selecting an author from
                the articles list.
              </p>
              <Button onClick={() => navigate('/')}>Go home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container py-10">
        {isLoading && <ProfileSkeleton />}

        {isError && !isLoading && (
          <Card className="mx-auto max-w-lg border-dashed bg-muted/40">
            <CardContent className="space-y-4 py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">Unable to load profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Something went wrong while fetching this profile. Please refresh the page or try
                again later.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Go back
                </Button>
                <Button onClick={() => navigate('/')}>Home</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="space-y-10">
            {usingMockData && <MockDataCallout />}

            <Card className="overflow-hidden border-border/60 shadow-lg">
              {coverImageUrl ? (
                <div className="relative h-36 w-full">
                  <img
                    src={coverImageUrl}
                    alt={`${displayProfile.user.username} cover`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background/90" />
                </div>
              ) : (
                <div className="relative h-32 w-full bg-gradient-to-r from-primary/15 via-primary/10 to-transparent">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background/80" />
                </div>
              )}
              <CardContent className={`${coverImageUrl ? 'pb-10 pt-10 md:pt-14' : 'pb-10 pt-6 md:pt-8'}`}>
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
                    <div className={`${coverImageUrl ? '-mt-20 md:-mt-24' : '-mt-16 md:-mt-20'} shrink-0`}>
                      {displayProfile.user.avatarUrl ? (
                        <img
                          src={displayProfile.user.avatarUrl}
                          alt={displayProfile.user.username}
                          className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-md md:h-28 md:w-28"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary/15 text-3xl font-semibold text-primary shadow-md md:h-28 md:w-28">
                          {displayProfile.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{displayProfile.user.username}</h1>
                        <Badge variant="default" className="flex items-center gap-1 rounded-md bg-primary/90 text-primary-foreground">
                          <Trophy className="h-3 w-3" />
                          Level {userLevel}
                        </Badge>
                        <Badge variant="secondary" className="rounded-md">
                          Member since {formatDate(displayProfile.user.memberSince)}
                        </Badge>
                        {usingMockData && (
                          <Badge variant="outline" className="flex items-center gap-1 rounded-md text-xs uppercase tracking-wide">
                            <Sparkles className="h-3 w-3" /> Preview data
                          </Badge>
                        )}
                      </div>
                      {headlineText && (
                        <p className="text-sm font-semibold text-foreground/90">{headlineText}</p>
                      )}
                      {professionalMetaLine && (
                        <p className="text-sm text-muted-foreground">{professionalMetaLine}</p>
                      )}
                      {displayProfile.user.bio ? (
                        <p className="max-w-2xl text-muted-foreground">{displayProfile.user.bio}</p>
                      ) : (
                        <p className="max-w-2xl text-sm text-muted-foreground">
                          This author hasn&apos;t shared a biography yet.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <NotebookPen className="h-4 w-4" />
                          {stats.publishedArticles} published articles
                        </span>
                        <Separator orientation="vertical" className="hidden h-4 md:flex" />
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" />
                          {stats.totalComments} comments received
                        </span>
                        <Separator orientation="vertical" className="hidden h-4 md:flex" />
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4" />
                          {stats.totalLikes} total reactions
                        </span>
                        <Separator orientation="vertical" className="hidden h-4 md:flex" />
                        <span className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-primary" />
                          {xpToNextLevel} XP to next level
                        </span>
                      </div>
                      {(locationText || websiteUrl || preferredContactLabel) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {locationText && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {locationText}
                            </span>
                          )}
                          {websiteUrl && (
                            <>
                              <Separator orientation="vertical" className="hidden h-4 md:flex" />
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                Visit site
                              </a>
                            </>
                          )}
                          {preferredContactLabel && (
                            <>
                              <Separator orientation="vertical" className="hidden h-4 md:flex" />
                              <span className="inline-flex items-center gap-1.5">
                                <MessageCircle className="h-3.5 w-3.5" />
                                {preferredContactLabel}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/')}
                      className="gap-2"
                      type="button"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Discover more
                    </Button>
                    <Button
                      size="sm"
                      variant={isOwnProfile ? 'secondary' : 'default'}
                      className="gap-2"
                      type="button"
                      onClick={() =>
                        isOwnProfile
                          ? navigate('/settings/profile', {
                              state: { from: location.pathname },
                            })
                          : navigate('/auth')
                      }
                    >
                      {isOwnProfile ? (
                        <>
                          <Settings className="h-4 w-4" />
                          Customize profile
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Follow author
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="grid gap-8 xl:grid-cols-[360px,1fr]">
              <aside className="space-y-6">
                <LevelProgressCard
                  level={userLevel}
                  totalExperience={totalExperience}
                  xpProgress={xpProgressPercent}
                  xpCurrent={xpIntoLevel}
                  xpRequired={xpForLevel}
                  xpToNextLevel={xpToNextLevel}
                  streak={streakDays}
                  bestStreak={bestStreak}
                  recentActivity={recentActivity}
                />

                <AchievementsSpotlight achievements={achievements} />

                <HallOfFamePath level={userLevel} />

                {dailyQuests.length > 0 && (
                  <DailyQuestBoard
                    quests={dailyQuests}
                    onQuestComplete={completeQuest}
                    isOwnProfile={isOwnProfile}
                  />
                )}

                <QuickActionsCard actions={profileQuickActions} />

                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Signature topics</h4>
                      {highlightedTags.length ? (
                        <div className="flex flex-wrap gap-2">
                          {highlightedTags.map((tag) => (
                            <Badge key={tag} variant="outline" className="rounded-md px-3 py-1 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Tags will appear here once this author starts publishing articles.
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Contact</h4>
                      <p className="text-sm text-muted-foreground">
                        Want to collaborate? Reach out via the community or leave a comment on one of the articles.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <CreatorGoalsCard goals={creatorGoals} />
                <PinnedCollectionsCard collections={pinnedCollections} />
              </aside>

              <section className="space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start gap-3 overflow-x-auto">
                    <TabsTrigger value="overview" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="articles" className="gap-2">
                      <NotebookPen className="h-4 w-4" />
                      Articles
                      <Badge variant="secondary" className="ml-2 rounded-md">
                        {publishedArticles.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="drafts" className="gap-2">
                      <FileEdit className="h-4 w-4" />
                      Drafts
                      <Badge variant="secondary" className="ml-2 rounded-md">
                        {drafts.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments
                      <Badge variant="secondary" className="ml-2 rounded-md">
                        {recentComments.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="bookmarks" className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      Bookmarks
                      <Badge variant="secondary" className="ml-2 rounded-md">
                        {bookmarks.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2" disabled={activityTimeline.length === 0}>
                      <MessageCircle className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <AudienceInsightsGrid metrics={audienceInsights} />
                    <ContentMixCard entries={contentMix} />
                    <AboutAuthorCard profile={displayProfile} details={visibleProfileDetails} />
                  </TabsContent>

                  <TabsContent value="articles" className="mt-6 space-y-4">
                    {publishedArticles.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          This author hasn&apos;t published anything yet.
                        </CardContent>
                      </Card>
                    ) : (
                      publishedArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          hidePreview
                          onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                          onTagClick={(tag) => navigate(`/?tag=${encodeURIComponent(tag)}`)}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="drafts" className="mt-6">
                    {drafts.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          Draft insights will appear once the author saves their next idea.
                      </CardContent>
                    </Card>
                    ) : (
                      <DraftsPreview drafts={drafts} />
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="mt-6">
                    {recentComments.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                          Comments will appear once this author joins the discussion.
                      </CardContent>
                    </Card>
                    ) : (
                      <CommentsFeed comments={recentComments} onArticleClick={(articleId) => navigate(`/article/${articleId}`)} />
                    )}
                  </TabsContent>

                  <TabsContent value="bookmarks" className="mt-6">
                    {bookmarks.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          Saved references live here once the author starts bookmarking.
                        </CardContent>
                      </Card>
                    ) : (
                      <BookmarksShelf bookmarks={bookmarks} onArticleClick={(articleId) => navigate(`/article/${articleId}`)} />
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6">
                    {activityTimeline.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          Activity history will appear here once interactions begin.
                        </CardContent>
                      </Card>
                    ) : (
                      <ActivityTimelineCard items={activityTimeline} />
                    )}
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

