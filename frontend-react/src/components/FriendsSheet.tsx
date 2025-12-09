import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  MessageCircle,
  Eye,
  Settings,
  CheckCircle2,
  Clock,
  ArrowRight,
  Heart,
  Activity,
  X,
} from 'lucide-react'
import type { Friendship, FriendRequest } from '@/types/friends'
import {
  mockFriendships,
  mockReceivedRequests,
  mockFriendStats,
} from '@/data/friendsMockData'
import { useTranslation } from '@/hooks/useTranslation'

interface FriendsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FriendsSheet({ open, onOpenChange }: FriendsSheetProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()

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

      return true
    })
  }, [searchQuery])

  const stats = mockFriendStats

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] p-0 flex flex-col [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <SheetTitle className="text-xl">Друзья</SheetTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {stats.totalFriends}
                    </span>
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                      <Activity className="h-3.5 w-3.5" />
                      {stats.onlineFriends}
                    </span>
                  </div>
                </div>
                <SheetDescription>
                  Управляйте друзьями и настройками
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/friends')
                }}
                aria-label="Open full friends page"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Search */}
          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('friends.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              {/* Pending Requests */}
              {mockReceivedRequests.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Входящие запросы
                    </h3>
                    <Badge variant="default" className="text-xs">
                      {mockReceivedRequests.length}
                    </Badge>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                    {mockReceivedRequests.map((request) => (
                      <ReceivedRequestItem key={request.id} request={request} />
                    ))}
                    {mockReceivedRequests.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          onOpenChange(false)
                          navigate('/friends?tab=requests')
                        }}
                      >
                        Показать все ({mockReceivedRequests.length})
                      </Button>
                    )}
                  </div>
                  <Separator className="my-4" />
                </div>
              )}

              {/* Friends List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Мои друзья
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredFriends.length}
                  </Badge>
                </div>
                {filteredFriends.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto space-y-1 pr-2">
                    {filteredFriends.map((friendship) => (
                      <FriendItem
                        key={friendship.id}
                        friendship={friendship}
                        onMessage={() => {
                          onOpenChange(false)
                          navigate(`/messages/${friendship.friend.id}`)
                        }}
                        onViewProfile={() => {
                          onOpenChange(false)
                          navigate(`/profile/${friendship.friend.uuid || friendship.friend.id}`)
                        }}
                      />
                    ))}
                    {filteredFriends.length > 10 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs mt-2"
                        onClick={() => {
                          onOpenChange(false)
                          navigate('/friends')
                        }}
                      >
                        Показать все ({filteredFriends.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {searchQuery ? 'Друзья не найдены' : 'Нет друзей'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t px-6 py-4 space-y-2">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/friends')
                }}
              >
                <ArrowRight className="h-4 w-4" />
                Открыть страницу друзей
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/friends?tab=search')
                }}
              >
                <UserPlus className="h-4 w-4" />
                Найти друзей
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/settings/friends')
                }}
              >
                <Settings className="h-4 w-4" />
                Настройки друзей
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Friend Item Component
interface FriendItemProps {
  friendship: Friendship
  onMessage: () => void
  onViewProfile: () => void
}

function FriendItem({ friendship, onViewProfile, onMessage }: FriendItemProps) {
  const friend = friendship.friend

  return (
    <div className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {friend.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{friend.displayName || friend.username}</span>
          {friend.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
          {friendship.isFavorite && <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>@{friend.username}</span>
          {friend.isOnline ? (
            <span className="text-green-600 dark:text-green-500">Онлайн</span>
          ) : (
            <span>Офлайн</span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onViewProfile}>
            <Eye className="h-4 w-4 mr-2" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMessage}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Сообщение
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Received Request Item Component
interface ReceivedRequestItemProps {
  request: FriendRequest
}

function ReceivedRequestItem({ request }: ReceivedRequestItemProps) {
  const sender = request.sender

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{sender.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{sender.displayName || sender.username}</span>
          {sender.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">@{sender.username}</p>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="default" className="h-7 px-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-2">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

