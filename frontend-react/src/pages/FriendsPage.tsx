import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Users,
  UserPlus,
  Search,
  Filter,
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
  UserCheck,
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
      <SiteHeader />

      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Друзья</h1>
              <p className="text-muted-foreground">
                Управляйте своими друзьями и находите новых
              </p>
            </div>
            <Button className="gap-2" onClick={() => setActiveTab('search')}>
              <UserPlus className="h-4 w-4" />
              Найти друзей
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Друзья</span>
              <Badge variant="secondary" className="ml-1">
                {stats.totalFriends}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Запросы</span>
              {stats.pendingRequests > 0 && (
                <Badge variant="default" className="ml-1">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Поиск</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Активность</span>
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Мои друзья</CardTitle>
                    <CardDescription>
                      {filteredFriends.length} {filteredFriends.length === 1 ? 'друг' : 'друзей'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={onlineOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOnlineOnly(!onlineOnly)}
                      className="gap-2"
                    >
                      <Activity className="h-4 w-4" />
                      Онлайн
                    </Button>
                    <Button
                      variant={favoritesOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFavoritesOnly(!favoritesOnly)}
                      className="gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Избранные
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск друзей..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Friends Grid */}
                  {filteredFriends.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <TabsContent value="requests" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Received Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Входящие запросы
                  </CardTitle>
                  <CardDescription>
                    {mockReceivedRequests.length} {mockReceivedRequests.length === 1 ? 'запрос' : 'запросов'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Исходящие запросы
                  </CardTitle>
                  <CardDescription>
                    {mockSentRequests.length} {mockSentRequests.length === 1 ? 'запрос' : 'запросов'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Возможно, вы знаете
                  </CardTitle>
                  <CardDescription>
                    Пользователи, которые могут вас заинтересовать
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockSuggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.user.id} suggestion={suggestion} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Поиск пользователей</CardTitle>
                <CardDescription>
                  Найдите друзей по имени пользователя или интересам
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Введите имя пользователя..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                {/* Search Results */}
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Активность друзей
                </CardTitle>
                <CardDescription>
                  Последние действия ваших друзей
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockFriendActivity.length > 0 ? (
                  <div className="space-y-4">
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
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', variantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{friend.displayName || friend.username}</span>
                {friend.verified && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                {friendship.isFavorite && <Heart className="h-4 w-4 fill-red-500 text-red-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground">@{friend.username}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewProfile}>
                <Eye className="h-4 w-4 mr-2" />
                Просмотреть профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Написать сообщение
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="h-4 w-4 mr-2" />
                {friendship.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <UserMinus className="h-4 w-4 mr-2" />
                Удалить из друзей
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {friend.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{friend.bio}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Уровень {friend.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>{friend.reputation}</span>
          </div>
          {friend.mutualFriends && friend.mutualFriends > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{friend.mutualFriends} общих</span>
            </div>
          )}
        </div>

        {friendship.tags && friendship.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {friendship.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={onMessage}>
            <MessageCircle className="h-4 w-4" />
            Сообщение
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={onViewProfile}>
            <Eye className="h-4 w-4" />
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{sender.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {sender.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{sender.displayName || sender.username}</span>
              {sender.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">@{sender.username}</p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
          </div>
        </div>

        {request.message && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            "{request.message}"
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Уровень {sender.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>{sender.reputation}</span>
          </div>
          {sender.mutualFriends && sender.mutualFriends > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{sender.mutualFriends} общих друзей</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Принять
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <X className="h-4 w-4" />
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{receiver.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{receiver.displayName || receiver.username}</span>
              {receiver.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">@{receiver.username}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Отправлено {timeAgo}
            </Badge>
          </div>
        </div>

        {request.message && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            "{request.message}"
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full gap-2">
          <X className="h-4 w-4" />
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{user.displayName || user.username}</span>
              {user.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <Badge variant="secondary" className="text-xs">
          {reasonText[suggestion.reason]}
        </Badge>

        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Уровень {user.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>{user.reputation}</span>
          </div>
        </div>

        <Button size="sm" className="w-full gap-2">
          <UserPlus className="h-4 w-4" />
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{user.displayName || user.username}</span>
              {user.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Уровень {user.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>{user.reputation}</span>
          </div>
          {user.stats && (
            <>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{user.stats.articles}</span>
              </div>
              {user.stats.courses > 0 && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{user.stats.courses}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => navigate(`/profile/${user.id}`)}>
            <Eye className="h-4 w-4" />
            Профиль
          </Button>
          <Button size="sm" className="flex-1 gap-2">
            <UserPlus className="h-4 w-4" />
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
        return <BookOpen className="h-4 w-4" />
      case 'course_created':
        return <GraduationCap className="h-4 w-4" />
      case 'achievement_unlocked':
        return <Star className="h-4 w-4" />
      case 'level_up':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
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
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{activity.friend.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{activity.friend.displayName || activity.friend.username}</span>
              <div className="flex items-center gap-1 text-primary">
                {getActivityIcon()}
              </div>
            </div>
            <p className="text-sm font-medium">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
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

