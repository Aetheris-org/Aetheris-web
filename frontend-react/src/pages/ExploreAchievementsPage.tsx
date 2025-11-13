/**
 * EXPLORE ACHIEVEMENTS PAGE
 * 
 * Страница со всеми достижениями пользователя в разделе Explore
 * 
 * BACKEND INTEGRATION:
 * - GET /api/explore/achievements - получить все достижения
 * - GET /api/explore/achievements/user/:userId - получить достижения пользователя
 * - POST /api/explore/achievements/check/:userId - проверить и начислить новые достижения
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Search, Award, Lock, CheckCircle2 } from 'lucide-react'
import { AchievementCard } from '@/components/explore/AchievementCard'
import { mockAchievements, mockUserStats } from '@/data/exploreMockData'

export default function ExploreAchievementsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all')

  // Статистика достижений
  const achievementStats = useMemo(() => {
    const unlocked = mockAchievements.filter(a => a.unlockedAt).length
    const total = mockAchievements.length
    const percentage = (unlocked / total) * 100

    return {
      unlocked,
      total,
      percentage,
      inProgress: mockAchievements.filter(a => a.progress && !a.unlockedAt).length,
    }
  }, [])

  // Фильтрация достижений
  const filteredAchievements = useMemo(() => {
    let achievements = mockAchievements

    // Фильтр по статусу
    if (filterStatus === 'unlocked') {
      achievements = achievements.filter(a => a.unlockedAt)
    } else if (filterStatus === 'locked') {
      achievements = achievements.filter(a => !a.unlockedAt)
    }

    // Фильтр по редкости
    if (filterRarity !== 'all') {
      achievements = achievements.filter(a => a.rarity === filterRarity)
    }

    // Поиск
    if (searchQuery) {
      achievements = achievements.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return achievements
  }, [filterStatus, filterRarity, searchQuery])

  // Группировка по категориям
  const achievementsByCategory = useMemo(() => {
    const categories: Record<string, typeof mockAchievements> = {
      combat: [],
      social: [],
      progression: [],
      special: [],
    }

    filteredAchievements.forEach(achievement => {
      const type = achievement.requirement.type
      if (type === 'wins' || type === 'streak') {
        categories.combat.push(achievement)
      } else if (type === 'participation') {
        categories.social.push(achievement)
      } else if (type === 'points') {
        categories.progression.push(achievement)
      } else {
        categories.special.push(achievement)
      }
    })

    return categories
  }, [filteredAchievements])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate('/explore')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Unlock achievements by completing challenges and reaching milestones
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">{achievementStats.unlocked}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-3xl font-bold">{achievementStats.total - achievementStats.unlocked}</div>
            <div className="text-sm text-muted-foreground">Locked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold">{achievementStats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{achievementStats.percentage.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </CardContent>
        </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Achievements</SelectItem>
            <SelectItem value="unlocked">Unlocked</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRarity} onValueChange={setFilterRarity}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Rarities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="mythic">Mythic</SelectItem>
          </SelectContent>
        </Select>
        </div>

        {/* Achievements by Category */}
        <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="combat">
            Combat ({achievementsByCategory.combat.length})
          </TabsTrigger>
          <TabsTrigger value="social">
            Social ({achievementsByCategory.social.length})
          </TabsTrigger>
          <TabsTrigger value="progression">
            Progression ({achievementsByCategory.progression.length})
          </TabsTrigger>
          <TabsTrigger value="special">
            Special ({achievementsByCategory.special.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAchievements.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="combat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementsByCategory.combat.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementsByCategory.social.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementsByCategory.progression.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementsByCategory.special.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

