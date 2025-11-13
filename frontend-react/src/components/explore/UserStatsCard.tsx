/**
 * USER STATS CARD COMPONENT
 * 
 * Компактная карточка со статистикой пользователя для раздела Explore
 * Может использоваться на главной странице, в профиле, в дуэлях и т.д.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, Star, Trophy, Target, Flame } from 'lucide-react'
import type { UserStats } from '@/types/explore'

interface UserStatsCardProps {
  stats: UserStats
  compact?: boolean
  showProgress?: boolean
}

export function UserStatsCard({ stats, compact = false, showProgress = true }: UserStatsCardProps) {
  // Прогресс до следующего уровня (пример расчета)
  const nextLevelProgress = ((stats.totalPoints % 1000) / 1000) * 100

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${stats.userId}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Player</span>
                {stats.clan && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Shield className="h-3 w-3" />
                    [{stats.clan.tag}]
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Lvl {stats.level}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  #{stats.rank}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-500" />
                  {stats.rating}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${stats.userId}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Player</h3>
                {stats.clan && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    [{stats.clan.tag}]
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Level {stats.level}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  Rank #{stats.rank}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  {stats.rating} Rating
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="font-medium">{Math.round(nextLevelProgress)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-green-500">{stats.duels.wins}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-red-500">{stats.duels.losses}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-orange-500">{stats.duels.winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              {stats.duels.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

