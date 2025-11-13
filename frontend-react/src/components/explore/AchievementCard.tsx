/**
 * ACHIEVEMENT CARD COMPONENT
 * 
 * Карточка достижения с прогрессом и анимацией
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, CheckCircle2 } from 'lucide-react'
import type { Achievement } from '@/types/explore'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
}

const rarityColors = {
  common: 'bg-muted',
  rare: 'bg-blue-600 dark:bg-blue-500',
  epic: 'bg-purple-600 dark:bg-purple-500',
  legendary: 'bg-yellow-600 dark:bg-yellow-500',
  mythic: 'bg-pink-600 dark:bg-pink-500',
}

const rarityBorders = {
  common: 'border-muted-foreground/30',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/40',
  legendary: 'border-yellow-500/40',
  mythic: 'border-pink-500/40',
}

const rarityGlows = {
  common: '',
  rare: 'shadow-md',
  epic: 'shadow-md',
  legendary: 'shadow-md',
  mythic: 'shadow-md',
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt
  const hasProgress = achievement.progress && !isUnlocked

  if (compact) {
    return (
      <div
        className={`
          relative p-3 rounded-lg border transition-all
          ${rarityBorders[achievement.rarity]}
          ${isUnlocked ? rarityGlows[achievement.rarity] : 'opacity-60'}
        `}
      >
        {/* Icon */}
        <div className="flex items-center gap-3">
          <div
            className={`
              flex items-center justify-center w-12 h-12 rounded-full text-2xl
              ${isUnlocked ? rarityColors[achievement.rarity] : 'bg-muted'}
            `}
          >
            {isUnlocked ? achievement.icon : <Lock className="h-5 w-5" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
              {isUnlocked && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
            
            {hasProgress && (
              <div className="mt-2">
                <Progress value={achievement.progress.percentage} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.progress.current}/{achievement.progress.required}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card
      className={`
        relative border transition-all
        ${rarityBorders[achievement.rarity]}
        ${isUnlocked ? rarityGlows[achievement.rarity] : 'opacity-60'}
      `}
    >
      {/* Rarity badge */}
      <div className="absolute top-3 right-3">
        <Badge
          variant="outline"
          className={`${rarityColors[achievement.rarity]} text-white border-0 capitalize`}
        >
          {achievement.rarity}
        </Badge>
      </div>

      <CardHeader>
        {/* Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`
              flex items-center justify-center w-16 h-16 rounded-full text-3xl flex-shrink-0
              ${isUnlocked ? rarityColors[achievement.rarity] : 'bg-muted'}
            `}
          >
            {isUnlocked ? achievement.icon : <Lock className="h-6 w-6" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              {achievement.name}
              {isUnlocked && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription className="mt-1">
              {achievement.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Requirement */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Requirement</div>
          <p className="text-sm text-muted-foreground">{achievement.requirement.description}</p>
        </div>

        {/* Progress */}
        {hasProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{achievement.progress.percentage.toFixed(0)}%</span>
            </div>
            <Progress value={achievement.progress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.progress.current} / {achievement.progress.required}
            </p>
          </div>
        )}

        {/* Reward */}
        <div>
          <div className="text-sm font-medium mb-2">Reward</div>
          <div className="flex flex-wrap gap-2">
            {achievement.reward.points && (
              <Badge variant="secondary">
                +{achievement.reward.points} Points
              </Badge>
            )}
            {achievement.reward.title && (
              <Badge variant="secondary">
                Title: {achievement.reward.title}
              </Badge>
            )}
            {achievement.reward.badge && (
              <Badge variant="secondary">
                Badge: {achievement.reward.badge}
              </Badge>
            )}
          </div>
        </div>

        {/* Unlocked date */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

