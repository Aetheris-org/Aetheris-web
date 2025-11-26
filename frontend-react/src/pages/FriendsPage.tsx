import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'
import {
  Users,
  UserPlus,
  Search,
  Star,
  MoreVertical,
  MessageCircle,
  UserMinus,
  Heart,
  Clock,
  CheckCircle2,
  X,
  Send,
  TrendingUp,
  Sparkles,
  Activity,
  BookOpen,
  GraduationCap,
  Eye,
} from 'lucide-react'
import type { FriendUser, Friendship, FriendRequest, FriendSuggestion } from '@/types/friends'
import {
  mockFriendships,
  mockReceivedRequests,
  mockSentRequests,
  mockSuggestions,
  mockFriendActivity,
  mockFriendStats,
  mockUsers,
} from '@/data/friendsMockData'

type TabValue = 'friends' | 'requests' | 'search' | 'activity'

export default function FriendsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabValue>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Filter friends
  const filteredFriends = useMemo(() => {
    return mockFriendships.filter((friendship) => {
      const friend = friendship.friend
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          friend.username.toLowerCase().includes(query) ||
          friend.displayName?.toLowerCase().includes(query) ||
          friend.bio?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Online filter
      if (onlineOnly && !friend.isOnline) return false

      // Favorites filter
      if (favoritesOnly && !friendship.isFavorite) return false

      return true
    })
  }, [searchQuery, onlineOnly, favoritesOnly])

  // Search users
  const searchResults = useMemo(() => {
    if (!searchQuery) return []
    
    return mockUsers.filter((user) => {
      const query = searchQuery.toLowerCase()
      return (
        user.username.toLowerCase().includes(query) ||
        user.displayName?.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  const stats = mockFriendStats

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold truncate">{t('friends.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="friends-dev-banner" />
      <main className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Друзья</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Управляйте своими друзьями и находите новых
              </p>
            </div>
            <Button className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm w-full sm:w-auto" onClick={() => setActiveTab('search')}>
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Найти друзей
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Users}
              label="Всего друзей"
              value={stats.totalFriends}
              variant="default"
            />
            <StatCard
              icon={Activity}
              label="Онлайн"
              value={stats.onlineFriends}
              variant="success"
            />
            <StatCard
              icon={Clock}
              label="Запросы"
              value={stats.pendingRequests}
              variant="warning"
              onClick={() => setActiveTab('requests')}
              clickable
            />
            <StatCard
              icon={TrendingUp}
              label="Активность"
              value={stats.recentActivity}
              variant="info"
              onClick={() => setActiveTab('activity')}
              clickable
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="inline-flex h-auto items-center justify-start rounded-lg bg-transparent p-0 w-auto border-0 gap-2">
              <TabsTrigger 
                value="friends" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2"
              >
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Друзья</span>
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 h-4 sm:h-5">
                {stats.totalFriends}
              </Badge>
            </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Запросы</span>
              {stats.pendingRequests > 0 && (
                  <Badge variant="default" className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 h-4 sm:h-5">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Поиск</span>
            </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2"
              >
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Активность</span>
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg">Мои друзья</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {filteredFriends.length} {filteredFriends.length === 1 ? 'друг' : 'друзей'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant={onlineOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOnlineOnly(!onlineOnly)}
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Онлайн
                    </Button>
                    <Button
                      variant={favoritesOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFavoritesOnly(!favoritesOnly)}
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Избранные
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск друзей..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Friends Grid */}
                  {filteredFriends.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredFriends.map((friendship) => (
                        <FriendCard
                          key={friendship.id}
                          friendship={friendship}
                          onMessage={() => navigate(`/messages/${friendship.friend.id}`)}
                          onViewProfile={() => navigate(`/profile/${friendship.friend.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="Друзья не найдены"
                      description="Попробуйте изменить фильтры или поисковый запрос"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Received Requests */}
              <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Входящие запросы
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {mockReceivedRequests.length} {mockReceivedRequests.length === 1 ? 'запрос' : 'запросов'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {mockReceivedRequests.length > 0 ? (
                    <div className="space-y-3">
                      {mockReceivedRequests.map((request) => (
                        <ReceivedRequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Clock}
                      title="Нет входящих запросов"
                      description="Когда кто-то отправит вам запрос, он появится здесь"
                      compact
                    />
                  )}
                </CardContent>
              </Card>

              {/* Sent Requests */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Исходящие запросы
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {mockSentRequests.length} {mockSentRequests.length === 1 ? 'запрос' : 'запросов'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {mockSentRequests.length > 0 ? (
                    <div className="space-y-3">
                      {mockSentRequests.map((request) => (
                        <SentRequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Send}
                      title="Нет исходящих запросов"
                      description="Отправьте запрос, чтобы добавить друга"
                      compact
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            {mockSuggestions.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Возможно, вы знаете
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Пользователи, которые могут вас заинтересовать
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockSuggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.user.id} suggestion={suggestion} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Поиск пользователей</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Найдите друзей по имени пользователя или интересам
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Введите имя пользователя..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 h-9 sm:h-10 md:h-12 text-xs sm:text-sm"
                  />
                </div>

                {/* Search Results */}
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {searchResults.map((user) => (
                        <UserSearchCard key={user.id} user={user} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="Пользователи не найдены"
                      description="Попробуйте изменить поисковый запрос"
                    />
                  )
                ) : (
                  <EmptyState
                    icon={Search}
                    title="Начните поиск"
                    description="Введите имя пользователя для поиска"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Активность друзей
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Последние действия ваших друзей
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {mockFriendActivity.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {mockFriendActivity.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Activity}
                    title="Нет активности"
                    description="Активность ваших друзей появится здесь"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  icon: typeof Users
  label: string
  value: number
  variant?: 'default' | 'success' | 'warning' | 'info'
  clickable?: boolean
  onClick?: () => void
}

function StatCard({ icon: Icon, label, value, variant = 'default', clickable, onClick }: StatCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600 dark:text-green-500',
    warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-500',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-500',
  }

  return (
    <Card
      className={cn(
        'transition-all',
        clickable && 'cursor-pointer hover:border-primary hover:shadow-md'
      )}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        <div className={cn('flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0', variantStyles[variant])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold">{value}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Friend Card Component
interface FriendCardProps {
  friendship: Friendship
  onMessage: () => void
  onViewProfile: () => void
}

function FriendCard({ friendship, onMessage, onViewProfile }: FriendCardProps) {
  const friend = friendship.friend

  return (
    <Card className="group transition-all hover:border-primary hover:shadow-md">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarFallback className="text-xs sm:text-sm">{friend.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold truncate">{friend.displayName || friend.username}</span>
                {friend.verified && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />}
                {friendship.isFavorite && <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-red-500 text-red-500 flex-shrink-0" />}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">@{friend.username}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs sm:text-sm">
              <DropdownMenuItem onClick={onViewProfile} className="text-xs sm:text-sm">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                Просмотреть профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMessage} className="text-xs sm:text-sm">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                Написать сообщение
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs sm:text-sm">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                {friendship.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive text-xs sm:text-sm">
                <UserMinus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                Удалить из друзей
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {friend.bio && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{friend.bio}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Уровень {friend.level}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{friend.reputation}</span>
          </div>
          {friend.mutualFriends && friend.mutualFriends > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{friend.mutualFriends} общих</span>
            </div>
          )}
        </div>

        {friendship.tags && friendship.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {friendship.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1 sm:pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm" onClick={onMessage}>
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Сообщение
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm" onClick={onViewProfile}>
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Профиль
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Received Request Card Component
interface ReceivedRequestCardProps {
  request: FriendRequest
}

function ReceivedRequestCard({ request }: ReceivedRequestCardProps) {
  const sender = request.sender
  const timeAgo = getTimeAgo(request.createdAt)

  return (
    <Card className="transition-all hover:border-primary">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="text-xs sm:text-sm">{sender.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {sender.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate">{sender.displayName || sender.username}</span>
              {sender.verified && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">@{sender.username}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{timeAgo}</p>
          </div>
        </div>

        {request.message && (
          <p className="text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 sm:p-3">
            "{request.message}"
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Уровень {sender.level}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{sender.reputation}</span>
          </div>
          {sender.mutualFriends && sender.mutualFriends > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{sender.mutualFriends} общих друзей</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Принять
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Отклонить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Sent Request Card Component
interface SentRequestCardProps {
  request: FriendRequest
}

function SentRequestCard({ request }: SentRequestCardProps) {
  const receiver = request.receiver
  const timeAgo = getTimeAgo(request.createdAt)

  return (
    <Card className="transition-all hover:border-primary">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">{receiver.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate">{receiver.displayName || receiver.username}</span>
              {receiver.verified && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">@{receiver.username}</p>
            <Badge variant="secondary" className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              Отправлено {timeAgo}
            </Badge>
          </div>
        </div>

        {request.message && (
          <p className="text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 sm:p-3">
            "{request.message}"
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Отменить запрос
        </Button>
      </CardContent>
    </Card>
  )
}

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: FriendSuggestion
}

function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const user = suggestion.user

  const reasonText = {
    mutual_friends: `${suggestion.mutualFriends?.length || 0} общих друзей`,
    same_interests: 'Общие интересы',
    same_location: 'Из вашего города',
    popular: 'Популярный пользователь',
  }

  return (
    <Card className="group transition-all hover:border-primary hover:shadow-md">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="text-xs sm:text-sm">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate">{user.displayName || user.username}</span>
              {user.verified && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-5">
          {reasonText[suggestion.reason]}
        </Badge>

        {user.bio && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Уровень {user.level}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{user.reputation}</span>
          </div>
        </div>

        <Button size="sm" className="w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
          <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Добавить в друзья
        </Button>
      </CardContent>
    </Card>
  )
}

// User Search Card Component
interface UserSearchCardProps {
  user: FriendUser
}

function UserSearchCard({ user }: UserSearchCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="group transition-all hover:border-primary hover:shadow-md">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="text-xs sm:text-sm">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold truncate">{user.displayName || user.username}</span>
              {user.verified && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {user.bio && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Уровень {user.level}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{user.reputation}</span>
          </div>
          {user.stats && (
            <>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{user.stats.articles}</span>
              </div>
              {user.stats.courses > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{user.stats.courses}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm" onClick={() => navigate(`/profile/${user.id}`)}>
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Профиль
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Card Component
interface ActivityCardProps {
  activity: typeof mockFriendActivity[0]
}

function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate()
  const timeAgo = getTimeAgo(activity.timestamp)

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'article_published':
        return <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'course_created':
        return <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'achievement_unlocked':
        return <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'level_up':
        return <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      default:
        return <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    }
  }

  return (
    <Card
      className={cn(
        'transition-all',
        activity.link && 'cursor-pointer hover:border-primary hover:shadow-md'
      )}
      onClick={activity.link ? () => navigate(activity.link!) : undefined}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">{activity.friend.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium truncate">{activity.friend.displayName || activity.friend.username}</span>
              <div className="flex items-center gap-0.5 sm:gap-1 text-primary shrink-0">
                {getActivityIcon()}
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium break-words">{activity.title}</p>
            {activity.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon: typeof Users
  title: string
  description: string
  compact?: boolean
}

function EmptyState({ icon: Icon, title, description, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-8' : 'py-16')}>
      <div className={cn('flex items-center justify-center rounded-full bg-muted mb-4', compact ? 'h-12 w-12' : 'h-16 w-16')}>
        <Icon className={cn('text-muted-foreground', compact ? 'h-6 w-6' : 'h-8 w-8')} />
      </div>
      <h3 className={cn('font-semibold mb-2', compact ? 'text-base' : 'text-lg')}>{title}</h3>
      <p className={cn('text-muted-foreground max-w-md', compact ? 'text-xs' : 'text-sm')}>{description}</p>
    </div>
  )
}

// Helper function to format time ago
function getTimeAgo(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days < 7) return `${days} д назад`
  
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

