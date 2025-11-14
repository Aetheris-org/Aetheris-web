import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { useTranslation } from '@/hooks/useTranslation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Swords,
  Trophy,
  Users,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Crown,
  Zap,
  Target,
  Award,
  Clock,
  Flame,
  Shield,
  Star,
  ChevronRight,
  Play,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import {
  mockDuels,
  mockClanWars,
  mockClans,
  mockLeaderboards,
  mockEvents,
  mockAchievements,
  mockUserStats,
} from '@/data/exploreMockData'

import type { DuelStatus, EventStatus, LeaderboardPeriod } from '@/types/explore'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [mainTab, setMainTab] = useState<'duels' | 'leaderboards' | 'events'>('duels')
  const [duelTab, setDuelTab] = useState<'active' | 'pending' | 'clan-wars'>('active')
  const [leaderboardType, setLeaderboardType] = useState<'users' | 'clans'>('users')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('all-time')
  const [eventFilter, setEventFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Фильтрация дуэлей
  const filteredDuels = useMemo(() => {
    let duels = mockDuels
    
    if (duelTab === 'active') {
      duels = duels.filter(d => d.status === 'active')
    } else if (duelTab === 'pending') {
      duels = duels.filter(d => d.status === 'pending')
    }
    
    if (searchQuery) {
      duels = duels.filter(d =>
        d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.challenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.opponent?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return duels
  }, [duelTab, searchQuery])

  // Фильтрация войн кланов
  const filteredClanWars = useMemo(() => {
    let wars = mockClanWars
    
    if (searchQuery) {
      wars = wars.filter(w =>
        w.clan1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.clan2.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return wars
  }, [searchQuery])

  // Фильтрация ивентов
  const filteredEvents = useMemo(() => {
    let events = mockEvents
    
    if (eventFilter !== 'all') {
      events = events.filter(e => e.status === eventFilter)
    }
    
    if (searchQuery) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return events
  }, [eventFilter, searchQuery])

  // Получение лидерборда
  const currentLeaderboard = useMemo(() => {
    return mockLeaderboards[leaderboardType] || []
  }, [leaderboardType])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t('explore.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('explore.description')}
          </p>
        </div>

        {/* Статистика пользователя */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border">
                  <AvatarImage src={mockUserStats.clan?.id ? `https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster` : undefined} />
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">CodeMaster</h3>
                    {mockUserStats.clan && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        [{mockUserStats.clan.tag}]
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {t('explore.level')} {mockUserStats.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {t('explore.rank')} #{mockUserStats.rank}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {mockUserStats.rating} {t('explore.rating')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold">{mockUserStats.totalPoints.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{t('explore.totalPoints')}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate('/explore/achievements')}
                >
                  <Award className="h-4 w-4" />
                  Achievements
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg border bg-card">
                <div className="text-xl font-bold">{mockUserStats.duels.wins}</div>
                <div className="text-xs text-muted-foreground">{t('explore.wins')}</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <div className="text-xl font-bold">{mockUserStats.duels.losses}</div>
                <div className="text-xs text-muted-foreground">{t('explore.losses')}</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <div className="text-xl font-bold">{mockUserStats.duels.winRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{t('explore.winRate')}</div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <div className="text-xl font-bold flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4" />
                  {mockUserStats.duels.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">{t('explore.streak')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Главные табы */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="duels" className="gap-2">
              <Swords className="h-4 w-4" />
              {t('explore.duelsWars')}
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="gap-2">
              <Trophy className="h-4 w-4" />
              {t('explore.leaderboards')}
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              {t('explore.events')}
            </TabsTrigger>
          </TabsList>

        {/* ДУЭЛИ И ВОЙНЫ */}
        <TabsContent value="duels" className="space-y-6">
          {/* Поиск и фильтры */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Swords className="h-4 w-4" />
              {t('explore.createDuel')}
            </Button>
          </div>

          {/* Табы дуэлей */}
          <Tabs value={duelTab} onValueChange={(v) => setDuelTab(v as any)}>
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                <Play className="h-4 w-4" />
                {t('explore.activeDuels')}
                <Badge variant="secondary" className="ml-1">{mockDuels.filter(d => d.status === 'active').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                {t('explore.pending')}
                <Badge variant="secondary" className="ml-1">{mockDuels.filter(d => d.status === 'pending').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="clan-wars" className="gap-2">
                <Shield className="h-4 w-4" />
                {t('explore.clanWars')}
                <Badge variant="secondary" className="ml-1">{mockClanWars.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Активные дуэли */}
            <TabsContent value="active" className="space-y-4 mt-6">
              {filteredDuels.length === 0 ? (
                <Card className="p-12 text-center">
                  <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('explore.noActiveDuels')}</h3>
                  <p className="text-muted-foreground mb-4">{t('explore.noActiveDuelsDescription')}</p>
                  <Button>{t('explore.createDuel')}</Button>
                </Card>
              ) : (
                filteredDuels.map((duel) => (
                  <Card key={duel.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {duel.category}
                            <Badge variant={duel.difficulty === 'expert' ? 'destructive' : duel.difficulty === 'hard' ? 'default' : 'secondary'}>
                              {duel.difficulty}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {duel.timeLimit} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {duel.pointsAtStake} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {duel.type}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3 text-green-500" />
                          Live
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-4">
                        {/* Challenger */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={duel.challenger.avatar} />
                            <AvatarFallback>{duel.challenger.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">{duel.challenger.name}</div>
                            <div className="text-sm text-muted-foreground">Level {duel.challenger.level}</div>
                            {duel.challengerScore !== undefined && (
                              <div className="text-2xl font-bold text-primary mt-1">{duel.challengerScore}</div>
                            )}
                          </div>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                          <Swords className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">VS</span>
                        </div>

                        {/* Opponent */}
                        {duel.opponent ? (
                          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                            <Avatar className="h-12 w-12 border-2 border-purple-500">
                              <AvatarImage src={duel.opponent.avatar} />
                              <AvatarFallback>{duel.opponent.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-right">
                              <div className="font-semibold">{duel.opponent.name}</div>
                              <div className="text-sm text-muted-foreground">Level {duel.opponent.level}</div>
                              {duel.opponentScore !== undefined && (
                                <div className="text-2xl font-bold text-purple-500 mt-1">{duel.opponentScore}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-center text-muted-foreground">
                            Waiting for opponent...
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        {t('explore.watchLive')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Pending дуэли */}
            <TabsContent value="pending" className="space-y-4 mt-6">
              {filteredDuels.length === 0 ? (
                <Card className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('explore.noPendingChallenges')}</h3>
                  <p className="text-muted-foreground">{t('explore.noPendingChallengesDescription')}</p>
                </Card>
              ) : (
                filteredDuels.map((duel) => (
                  <Card key={duel.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {duel.category}
                            <Badge variant={duel.difficulty === 'expert' ? 'destructive' : duel.difficulty === 'hard' ? 'default' : 'secondary'}>
                              {duel.difficulty}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {duel.timeLimit} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {duel.pointsAtStake} pts
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarImage src={duel.challenger.avatar} />
                          <AvatarFallback>{duel.challenger.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">{duel.challenger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Level {duel.challenger.level} • {duel.challenger.rating} rating
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button className="flex-1 gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('explore.acceptChallenge')}
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <XCircle className="h-4 w-4" />
                        {t('explore.decline')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Войны кланов */}
            <TabsContent value="clan-wars" className="space-y-4 mt-6">
              {filteredClanWars.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('explore.noClanWars')}</h3>
                  <p className="text-muted-foreground mb-4">{t('explore.noClanWarsDescription')}</p>
                  <Button>{t('explore.declareWar')}</Button>
                </Card>
              ) : (
                filteredClanWars.map((war) => (
                  <Card key={war.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {war.category}
                            <Badge variant="outline">{war.format}</Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {war.duration}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {war.totalPointsAtStake} pts
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant={war.status === 'active' ? 'default' : 'secondary'} className="gap-1">
                          {war.status === 'active' ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {war.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Кланы */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Clan 1 */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={war.clan1.logo} />
                            <AvatarFallback>{war.clan1.tag}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">{war.clan1.name}</div>
                            <div className="text-sm text-muted-foreground">[{war.clan1.tag}]</div>
                            <div className="text-2xl font-bold text-primary mt-1">{war.clan1.score}</div>
                          </div>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                          <Shield className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">VS</span>
                        </div>

                        {/* Clan 2 */}
                        <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                          <Avatar className="h-12 w-12 border-2 border-purple-500">
                            <AvatarImage src={war.clan2.logo} />
                            <AvatarFallback>{war.clan2.tag}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{war.clan2.name}</div>
                            <div className="text-sm text-muted-foreground">[{war.clan2.tag}]</div>
                            <div className="text-2xl font-bold text-purple-500 mt-1">{war.clan2.score}</div>
                          </div>
                        </div>
                      </div>

                      {/* Раунды */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Rounds Progress</div>
                        <div className="flex gap-2">
                          {war.rounds.map((round) => (
                            <div
                              key={round.id}
                              className={`flex-1 h-2 rounded-full ${
                                round.status === 'completed'
                                  ? round.winner === war.clan1.id
                                    ? 'bg-primary'
                                    : 'bg-purple-500'
                                  : round.status === 'active'
                                  ? 'bg-yellow-500 animate-pulse'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        {t('explore.viewWarDetails')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ЛИДЕРБОРДЫ */}
        <TabsContent value="leaderboards" className="space-y-6">
          {/* Фильтры лидерборда */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={leaderboardType} onValueChange={(v) => setLeaderboardType(v as any)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">{t('explore.topPlayers')}</SelectItem>
                <SelectItem value="clans">{t('explore.topClans')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={leaderboardPeriod} onValueChange={(v) => setLeaderboardPeriod(v as any)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">{t('explore.allTime')}</SelectItem>
                <SelectItem value="monthly">{t('explore.monthly')}</SelectItem>
                <SelectItem value="weekly">{t('explore.weekly')}</SelectItem>
                <SelectItem value="daily">{t('explore.daily')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Таблица лидеров */}
          <div className="space-y-2">
            {currentLeaderboard.map((entry, index) => (
              <Card
                key={index}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div
                        className={`text-xl font-bold ${
                          entry.rank === 1
                            ? 'text-yellow-600 dark:text-yellow-500'
                            : entry.rank === 2
                            ? 'text-slate-400'
                            : entry.rank === 3
                            ? 'text-orange-600 dark:text-orange-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        #{entry.rank}
                      </div>
                      {entry.previousRank && entry.previousRank !== entry.rank && (
                        <div className="flex items-center gap-1 text-xs">
                          {entry.previousRank > entry.rank ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                          )}
                          <span className="text-muted-foreground">{Math.abs(entry.previousRank - entry.rank)}</span>
                        </div>
                      )}
                    </div>

                    {/* User/Clan Info */}
                    {entry.user && (
                      <>
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {entry.user.name}
                            {entry.user.clan && (
                              <Badge variant="outline" className="text-xs">
                                [{entry.user.clan.tag}]
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">Level {entry.user.level}</div>
                        </div>
                      </>
                    )}

                    {entry.clan && (
                      <>
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarImage src={entry.clan.logo} />
                          <AvatarFallback>{entry.clan.tag}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">{entry.clan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            [{entry.clan.tag}] • {entry.clan.totalMembers} members
                          </div>
                        </div>
                      </>
                    )}

                      {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{entry.rating}</div>
                        <div className="text-xs text-muted-foreground">{t('explore.rating')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-500">{entry.wins}</div>
                        <div className="text-xs text-muted-foreground">{t('explore.wins')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{entry.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('explore.winRate')}</div>
                      </div>
                    </div>

                    {/* Badges */}
                    {entry.badges && entry.badges.length > 0 && (
                      <div className="flex gap-1">
                        {entry.badges.slice(0, 3).map((badge) => (
                          <div
                            key={badge.id}
                            className="text-xl"
                            title={badge.name}
                          >
                            {badge.icon}
                          </div>
                        ))}
                      </div>
                    )}

                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ИВЕНТЫ */}
        <TabsContent value="events" className="space-y-6">
          {/* Фильтры ивентов */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allEvents')}</SelectItem>
                <SelectItem value="active">{t('explore.active')}</SelectItem>
                <SelectItem value="upcoming">{t('explore.upcoming')}</SelectItem>
                <SelectItem value="completed">{t('explore.completed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Список ивентов */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:border-primary/50 transition-colors overflow-hidden cursor-pointer"
                onClick={() => navigate(`/explore/events/${event.id}`)}
              >
                {event.banner && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}>
                          {event.status === 'active' ? t('explore.active') : event.status === 'upcoming' ? t('explore.upcoming') : t('explore.completed')}
                        </Badge>
                        <Badge variant="outline">{event.type}</Badge>
                        {event.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.shortDescription}</p>

                  {/* Организатор */}
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={event.organizer.avatar} />
                      <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">by {event.organizer.name}</span>
                  </div>

                  {/* Даты */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.participants}
                      {event.maxParticipants && `/${event.maxParticipants}`}
                    </span>
                  </div>

                  {/* Прогресс регистрации */}
                  {event.maxParticipants && (
                    <div className="space-y-1">
                      <Progress value={(event.participants / event.maxParticipants) * 100} />
                      <div className="text-xs text-muted-foreground text-right">
                        {event.maxParticipants - event.participants} spots left
                      </div>
                    </div>
                  )}

                  {/* Призы */}
                  {event.prizes && event.prizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Prizes
                      </div>
                      <div className="space-y-1">
                        {event.prizes.slice(0, 3).map((prize) => (
                          <div key={prize.place} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-semibold">#{prize.place}</span>
                            <span className="flex-1">{prize.title}</span>
                            {prize.value && <span className="text-primary font-semibold">{prize.value}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/explore/events/${event.id}`)
                    }}
                  >
                    {event.status === 'active' ? (
                      <>
                        <Play className="h-4 w-4" />
                        {t('explore.joinNow')}
                      </>
                    ) : event.status === 'upcoming' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {t('explore.register')}
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        {t('explore.viewResults')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('explore.noEventsFound')}</h3>
              <p className="text-muted-foreground">{t('explore.noEventsFoundDescription')}</p>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

