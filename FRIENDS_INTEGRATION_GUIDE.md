# 👥 Руководство по интеграции системы друзей с базой данных

## 📋 Оглавление
1. [Обзор системы](#обзор-системы)
2. [Структура Strapi](#структура-strapi)
3. [API эндпоинты](#api-эндпоинты)
4. [Интеграция с фронтендом](#интеграция-с-фронтендом)
5. [Real-time обновления](#real-time-обновления)
6. [Приватность и безопасность](#приватность-и-безопасность)
7. [Чеклист миграции](#чеклист-миграции)

---

## 🎯 Обзор системы

Система друзей Aetheris включает:
- **Список друзей** - управление существующими дружескими связями
- **Запросы в друзья** - отправка, принятие и отклонение запросов
- **Поиск пользователей** - поиск новых друзей по имени и интересам
- **Рекомендации** - умные предложения друзей на основе общих связей и интересов
- **Активность друзей** - лента действий друзей
- **Избранные друзья** - пометка важных друзей
- **Теги и заметки** - организация друзей с помощью тегов и личных заметок
- **Онлайн статус** - отображение активности друзей в реальном времени

---

## 🗄️ Структура Strapi

### 1. Content Type: `FriendRequest`

```typescript
{
  // Relations
  sender: relation (User, many-to-one)
  receiver: relation (User, many-to-one)
  
  // Status
  status: enumeration ['pending', 'accepted', 'declined'] (required, default: 'pending')
  
  // Message
  message: text (optional, max 500 chars)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
  respondedAt: datetime (nullable) // When request was accepted/declined
}
```

**Unique constraint:** `sender` + `receiver` (one request per pair)

**Hooks для FriendRequest:**
```typescript
// beforeCreate
- Check if users are already friends
- Check if reverse request exists (receiver -> sender)
- Check rate limiting (max 10 requests per day)
- Validate that sender !== receiver

// afterCreate
- Send notification to receiver
- Update sender's sentRequests count
- Update receiver's pendingRequests count

// afterUpdate (status change to 'accepted')
- Create Friendship record
- Delete the request
- Send notification to sender
- Update both users' friend counts

// afterUpdate (status change to 'declined')
- Send notification to sender (optional)
- Delete the request after 7 days (cleanup job)
```

---

### 2. Content Type: `Friendship`

```typescript
{
  // Relations
  user: relation (User, many-to-one)
  friend: relation (User, many-to-one)
  
  // Metadata
  isFavorite: boolean (default: false)
  notes: text (nullable, private notes about friend)
  tags: json (array of strings, for organizing friends)
  
  // Timestamps
  createdAt: datetime (auto) // When friendship was established
  updatedAt: datetime (auto)
}
```

**Unique constraint:** `user` + `friend` (bidirectional, create two records for each friendship)

**Hooks для Friendship:**
```typescript
// afterCreate
- Create reverse friendship (friend -> user)
- Update both users' totalFriends count
- Send notification

// afterDelete
- Delete reverse friendship
- Update both users' totalFriends count
- Send notification (optional)
```

---

### 3. Content Type: `FriendActivity`

```typescript
{
  // Relations
  user: relation (User, many-to-one) // User who performed the action
  
  // Activity details
  type: enumeration [
    'article_published',
    'course_created',
    'achievement_unlocked',
    'level_up',
    'joined_event',
    'comment_posted',
    'project_shared'
  ] (required)
  
  title: string (required, max 200 chars)
  description: text (nullable, max 500 chars)
  link: string (nullable) // Link to the activity
  
  // Metadata
  metadata: json (nullable) // Additional data specific to activity type
  
  // Visibility
  isPublic: boolean (default: true) // Can be seen by friends
  
  // Timestamps
  timestamp: datetime (required)
  createdAt: datetime (auto)
}
```

**Hooks для FriendActivity:**
```typescript
// afterCreate
- Notify friends about new activity
- Update activity feed cache

// Cleanup job (cron)
- Delete activities older than 30 days
```

---

### 4. Расширение User Content Type

Добавить поля в существующий User:

```typescript
{
  // ... existing fields
  
  // Friend-related
  totalFriends: number (default: 0)
  pendingRequests: number (default: 0) // Received requests
  sentRequests: number (default: 0)
  
  // Online status
  isOnline: boolean (default: false)
  lastSeen: datetime (nullable)
  
  // Privacy settings
  friendPrivacy: enumeration ['everyone', 'friends_of_friends', 'nobody'] (default: 'everyone')
  activityPrivacy: enumeration ['public', 'friends', 'private'] (default: 'friends')
  onlineStatusVisible: boolean (default: true)
  
  // Relations
  friends: relation (Friendship, one-to-many, field: 'user')
  sentFriendRequests: relation (FriendRequest, one-to-many, field: 'sender')
  receivedFriendRequests: relation (FriendRequest, one-to-many, field: 'receiver')
  activities: relation (FriendActivity, one-to-many)
}
```

---

### 5. Content Type: `BlockedUser` (для безопасности)

```typescript
{
  // Relations
  blocker: relation (User, many-to-one) // User who blocked
  blocked: relation (User, many-to-one) // User who was blocked
  
  // Reason
  reason: enumeration ['spam', 'harassment', 'inappropriate', 'other'] (nullable)
  notes: text (nullable)
  
  // Timestamps
  createdAt: datetime (auto)
}
```

**Unique constraint:** `blocker` + `blocked`

---

## 🔌 API эндпоинты

### Friends

```typescript
// GET /api/friends
// Query params: search, tags, onlineOnly, favorites, sortBy, pagination
// Returns: { data: Friendship[], meta: { pagination, stats } }

// GET /api/friends/:id
// Returns: { data: Friendship }

// DELETE /api/friends/:id
// Remove friend
// Returns: { data: { success: true } }

// PUT /api/friends/:id
// Update friendship (favorite, notes, tags)
// Body: { isFavorite?: boolean, notes?: string, tags?: string[] }
// Returns: { data: Friendship }
```

### Friend Requests

```typescript
// GET /api/friends/requests/received
// Get received friend requests
// Query params: pagination
// Returns: { data: FriendRequest[], meta: { pagination } }

// GET /api/friends/requests/sent
// Get sent friend requests
// Query params: pagination
// Returns: { data: FriendRequest[], meta: { pagination } }

// POST /api/friends/requests
// Send friend request
// Body: { receiverId: string, message?: string }
// Returns: { data: FriendRequest }

// PUT /api/friends/requests/:id/accept
// Accept friend request
// Returns: { data: Friendship }

// PUT /api/friends/requests/:id/decline
// Decline friend request
// Returns: { data: { success: true } }

// DELETE /api/friends/requests/:id
// Cancel sent request
// Returns: { data: { success: true } }
```

### Friend Suggestions

```typescript
// GET /api/friends/suggestions
// Get friend suggestions based on mutual friends and interests
// Query params: limit (default: 10)
// Returns: { 
//   data: Array<{
//     user: User,
//     reason: 'mutual_friends' | 'same_interests' | 'same_location' | 'popular',
//     mutualFriends?: User[],
//     commonTags?: string[],
//     score: number
//   }>
// }
```

### User Search

```typescript
// GET /api/friends/search
// Search users by username, displayName, bio
// Query params: q (query), limit, offset
// Returns: { data: User[], meta: { pagination } }
```

### Friend Activity

```typescript
// GET /api/friends/activity
// Get friends' recent activity
// Query params: limit (default: 20), offset
// Returns: { data: FriendActivity[], meta: { pagination } }

// POST /api/friends/activity
// Create activity (automatic from other actions)
// Body: { type, title, description?, link?, metadata? }
// Returns: { data: FriendActivity }
```

### Statistics

```typescript
// GET /api/friends/stats
// Get friendship statistics
// Returns: {
//   data: {
//     totalFriends: number,
//     onlineFriends: number,
//     pendingRequests: number,
//     sentRequests: number,
//     mutualFriends: number,
//     recentActivity: number
//   }
// }
```

### Blocking

```typescript
// POST /api/friends/block
// Block a user
// Body: { userId: string, reason?: string, notes?: string }
// Returns: { data: BlockedUser }

// DELETE /api/friends/block/:id
// Unblock a user
// Returns: { data: { success: true } }

// GET /api/friends/blocked
// Get blocked users list
// Returns: { data: BlockedUser[] }
```

---

## 🎨 Интеграция с фронтендом

### 1. Создать API клиент

**Файл:** `frontend-react/src/api/friends.ts`

```typescript
import { api } from './client'
import type {
  FriendUser,
  Friendship,
  FriendRequest,
  FriendSuggestion,
  FriendActivity,
  FriendStats,
  FriendsFilters,
} from '@/types/friends'

export const friendsApi = {
  // Get friends list
  getFriends: async (filters?: FriendsFilters) => {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('filters[friend][username][$containsi]', filters.search)
    if (filters?.onlineOnly) params.append('filters[friend][isOnline][$eq]', 'true')
    if (filters?.favorites) params.append('filters[isFavorite][$eq]', 'true')
    if (filters?.tags?.length) {
      filters.tags.forEach(tag => params.append('filters[tags][$contains]', tag))
    }
    if (filters?.sortBy) {
      const sortMap = {
        name: 'friend.username:asc',
        recent: 'createdAt:desc',
        reputation: 'friend.reputation:desc',
        level: 'friend.level:desc',
      }
      params.append('sort', sortMap[filters.sortBy])
    }
    
    params.append('populate', 'friend')
    
    const response = await api.get(`/friends?${params.toString()}`)
    return response.data
  },

  // Remove friend
  removeFriend: async (friendshipId: string) => {
    const response = await api.delete(`/friends/${friendshipId}`)
    return response.data
  },

  // Update friendship
  updateFriendship: async (
    friendshipId: string,
    data: { isFavorite?: boolean; notes?: string; tags?: string[] }
  ) => {
    const response = await api.put(`/friends/${friendshipId}`, { data })
    return response.data.data as Friendship
  },

  // Get received requests
  getReceivedRequests: async () => {
    const response = await api.get('/friends/requests/received?populate=sender')
    return response.data.data as FriendRequest[]
  },

  // Get sent requests
  getSentRequests: async () => {
    const response = await api.get('/friends/requests/sent?populate=receiver')
    return response.data.data as FriendRequest[]
  },

  // Send friend request
  sendFriendRequest: async (receiverId: string, message?: string) => {
    const response = await api.post('/friends/requests', {
      data: { receiver: receiverId, message },
    })
    return response.data.data as FriendRequest
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string) => {
    const response = await api.put(`/friends/requests/${requestId}/accept`)
    return response.data.data as Friendship
  },

  // Decline friend request
  declineFriendRequest: async (requestId: string) => {
    const response = await api.put(`/friends/requests/${requestId}/decline`)
    return response.data
  },

  // Cancel sent request
  cancelFriendRequest: async (requestId: string) => {
    const response = await api.delete(`/friends/requests/${requestId}`)
    return response.data
  },

  // Get friend suggestions
  getSuggestions: async (limit = 10) => {
    const response = await api.get(`/friends/suggestions?limit=${limit}`)
    return response.data.data as FriendSuggestion[]
  },

  // Search users
  searchUsers: async (query: string, limit = 20) => {
    const response = await api.get(`/friends/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data.data as FriendUser[]
  },

  // Get friend activity
  getFriendActivity: async (limit = 20) => {
    const response = await api.get(`/friends/activity?limit=${limit}&populate=user`)
    return response.data.data as FriendActivity[]
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/friends/stats')
    return response.data.data as FriendStats
  },

  // Block user
  blockUser: async (userId: string, reason?: string, notes?: string) => {
    const response = await api.post('/friends/block', {
      data: { blocked: userId, reason, notes },
    })
    return response.data
  },

  // Unblock user
  unblockUser: async (blockId: string) => {
    const response = await api.delete(`/friends/block/${blockId}`)
    return response.data
  },

  // Get blocked users
  getBlockedUsers: async () => {
    const response = await api.get('/friends/blocked?populate=blocked')
    return response.data.data
  },
}
```

---

### 2. Обновить FriendsPage для использования API

**Файл:** `frontend-react/src/pages/FriendsPage.tsx`

Заменить импорт мок-данных:

```typescript
// ❌ Удалить
import {
  mockFriendships,
  mockReceivedRequests,
  mockSentRequests,
  mockSuggestions,
  mockFriendActivity,
  mockFriendStats,
  mockUsers,
} from '@/data/friendsMockData'

// ✅ Добавить
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendsApi } from '@/api/friends'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
```

Заменить useState на useQuery:

```typescript
// Friends list
const { data: friendships, isLoading: friendsLoading } = useQuery({
  queryKey: ['friends', { searchQuery, onlineOnly, favoritesOnly }],
  queryFn: () => friendsApi.getFriends({
    search: searchQuery,
    onlineOnly,
    favorites: favoritesOnly,
  }),
})

// Received requests
const { data: receivedRequests } = useQuery({
  queryKey: ['friendRequests', 'received'],
  queryFn: () => friendsApi.getReceivedRequests(),
})

// Sent requests
const { data: sentRequests } = useQuery({
  queryKey: ['friendRequests', 'sent'],
  queryFn: () => friendsApi.getSentRequests(),
})

// Suggestions
const { data: suggestions } = useQuery({
  queryKey: ['friendSuggestions'],
  queryFn: () => friendsApi.getSuggestions(),
})

// Activity
const { data: friendActivity } = useQuery({
  queryKey: ['friendActivity'],
  queryFn: () => friendsApi.getFriendActivity(),
})

// Stats
const { data: stats } = useQuery({
  queryKey: ['friendStats'],
  queryFn: () => friendsApi.getStats(),
})

// Search users
const { data: searchResults } = useQuery({
  queryKey: ['userSearch', searchQuery],
  queryFn: () => friendsApi.searchUsers(searchQuery),
  enabled: !!searchQuery && activeTab === 'search',
})
```

Добавить mutations:

```typescript
const queryClient = useQueryClient()
const { toast } = useToast()

// Accept friend request
const acceptRequestMutation = useMutation({
  mutationFn: (requestId: string) => friendsApi.acceptFriendRequest(requestId),
  onSuccess: () => {
    queryClient.invalidateQueries(['friendRequests'])
    queryClient.invalidateQueries(['friends'])
    queryClient.invalidateQueries(['friendStats'])
    toast({
      title: 'Запрос принят',
      description: 'Пользователь добавлен в друзья',
    })
  },
})

// Decline friend request
const declineRequestMutation = useMutation({
  mutationFn: (requestId: string) => friendsApi.declineFriendRequest(requestId),
  onSuccess: () => {
    queryClient.invalidateQueries(['friendRequests'])
    queryClient.invalidateQueries(['friendStats'])
    toast({
      title: 'Запрос отклонен',
    })
  },
})

// Send friend request
const sendRequestMutation = useMutation({
  mutationFn: ({ userId, message }: { userId: string; message?: string }) =>
    friendsApi.sendFriendRequest(userId, message),
  onSuccess: () => {
    queryClient.invalidateQueries(['friendRequests'])
    queryClient.invalidateQueries(['friendStats'])
    toast({
      title: 'Запрос отправлен',
      description: 'Ожидайте ответа от пользователя',
    })
  },
})

// Cancel friend request
const cancelRequestMutation = useMutation({
  mutationFn: (requestId: string) => friendsApi.cancelFriendRequest(requestId),
  onSuccess: () => {
    queryClient.invalidateQueries(['friendRequests'])
    queryClient.invalidateQueries(['friendStats'])
    toast({
      title: 'Запрос отменен',
    })
  },
})

// Remove friend
const removeFriendMutation = useMutation({
  mutationFn: (friendshipId: string) => friendsApi.removeFriend(friendshipId),
  onSuccess: () => {
    queryClient.invalidateQueries(['friends'])
    queryClient.invalidateQueries(['friendStats'])
    toast({
      title: 'Друг удален',
    })
  },
})

// Update friendship
const updateFriendshipMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: any }) =>
    friendsApi.updateFriendship(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['friends'])
    toast({
      title: 'Изменения сохранены',
    })
  },
})
```

---

## 🔄 Real-time обновления

### 1. WebSocket для онлайн статуса

**Установка:**
```bash
npm install socket.io-client
```

**Файл:** `frontend-react/src/services/socket.ts`

```typescript
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(userId: string) {
    this.socket = io(process.env.VITE_WS_URL || 'ws://localhost:1337', {
      auth: {
        token: localStorage.getItem('jwt'),
      },
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.socket?.emit('user:online', { userId })
    })

    this.socket.on('friend:online', ({ friendId }) => {
      // Update friend online status in cache
      console.log('Friend came online:', friendId)
    })

    this.socket.on('friend:offline', ({ friendId }) => {
      // Update friend offline status in cache
      console.log('Friend went offline:', friendId)
    })

    this.socket.on('friend:request', ({ request }) => {
      // Show notification about new friend request
      console.log('New friend request:', request)
    })

    this.socket.on('friend:accepted', ({ friendship }) => {
      // Show notification about accepted request
      console.log('Friend request accepted:', friendship)
    })

    this.socket.on('friend:activity', ({ activity }) => {
      // Update activity feed
      console.log('New friend activity:', activity)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  updateOnlineStatus(isOnline: boolean) {
    this.socket?.emit('user:status', { isOnline })
  }
}

export const socketService = new SocketService()
```

**Использование в App.tsx:**

```typescript
import { socketService } from '@/services/socket'

function App() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      socketService.connect(user.id)
      
      // Update online status on visibility change
      const handleVisibilityChange = () => {
        socketService.updateOnlineStatus(!document.hidden)
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        socketService.disconnect()
      }
    }
  }, [user])

  // ...
}
```

---

### 2. Strapi WebSocket сервер

**Файл:** `backend/src/websocket/index.ts`

```typescript
import { Server } from 'socket.io'

export default {
  register({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    })

    // Store user socket connections
    const userSockets = new Map<string, string>() // userId -> socketId

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Authenticate user
      const token = socket.handshake.auth.token
      // Verify token and get userId
      const userId = verifyToken(token) // Implement this

      if (!userId) {
        socket.disconnect()
        return
      }

      // User came online
      socket.on('user:online', async ({ userId }) => {
        userSockets.set(userId, socket.id)
        
        // Update user online status in database
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: { isOnline: true, lastSeen: new Date() },
        })

        // Notify friends
        const friends = await strapi.entityService.findMany('api::friendship.friendship', {
          filters: { user: userId },
          populate: ['friend'],
        })

        friends.forEach((friendship) => {
          const friendSocketId = userSockets.get(friendship.friend.id)
          if (friendSocketId) {
            io.to(friendSocketId).emit('friend:online', { friendId: userId })
          }
        })
      })

      // User status update
      socket.on('user:status', async ({ isOnline }) => {
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: { isOnline, lastSeen: new Date() },
        })

        // Notify friends
        const friends = await strapi.entityService.findMany('api::friendship.friendship', {
          filters: { user: userId },
          populate: ['friend'],
        })

        friends.forEach((friendship) => {
          const friendSocketId = userSockets.get(friendship.friend.id)
          if (friendSocketId) {
            const event = isOnline ? 'friend:online' : 'friend:offline'
            io.to(friendSocketId).emit(event, { friendId: userId })
          }
        })
      })

      // Disconnect
      socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.id)
        userSockets.delete(userId)
        
        // Update user offline status
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: { isOnline: false, lastSeen: new Date() },
        })

        // Notify friends
        const friends = await strapi.entityService.findMany('api::friendship.friendship', {
          filters: { user: userId },
          populate: ['friend'],
        })

        friends.forEach((friendship) => {
          const friendSocketId = userSockets.get(friendship.friend.id)
          if (friendSocketId) {
            io.to(friendSocketId).emit('friend:offline', { friendId: userId })
          }
        })
      })
    })

    strapi.io = io
  },
}
```

---

## 🔐 Приватность и безопасность

### 1. Настройки приватности

Добавить в настройки пользователя:

```typescript
// frontend-react/src/pages/SettingsPage.tsx

<Card>
  <CardHeader>
    <CardTitle>Приватность друзей</CardTitle>
    <CardDescription>
      Управляйте тем, кто может отправлять вам запросы в друзья
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label>Кто может отправлять запросы</Label>
      <Select value={friendPrivacy} onValueChange={setFriendPrivacy}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="everyone">Все пользователи</SelectItem>
          <SelectItem value="friends_of_friends">Друзья друзей</SelectItem>
          <SelectItem value="nobody">Никто</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Видимость активности</Label>
      <Select value={activityPrivacy} onValueChange={setActivityPrivacy}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">Все</SelectItem>
          <SelectItem value="friends">Только друзья</SelectItem>
          <SelectItem value="private">Никто</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <Label>Показывать онлайн статус</Label>
        <p className="text-sm text-muted-foreground">
          Друзья смогут видеть, когда вы онлайн
        </p>
      </div>
      <Switch
        checked={onlineStatusVisible}
        onCheckedChange={setOnlineStatusVisible}
      />
    </div>
  </CardContent>
</Card>
```

---

### 2. Rate Limiting

**В Strapi middleware:**

```typescript
// backend/src/middlewares/rateLimitFriendRequests.ts
export default (config, { strapi }) => {
  const requestCounts = new Map<string, { count: number; resetAt: number }>()

  return async (ctx, next) => {
    if (ctx.request.url === '/api/friends/requests' && ctx.request.method === 'POST') {
      const userId = ctx.state.user.id
      const now = Date.now()
      const limit = 10 // Max 10 requests per day
      const windowMs = 24 * 60 * 60 * 1000 // 24 hours

      const userLimit = requestCounts.get(userId)

      if (!userLimit || now > userLimit.resetAt) {
        requestCounts.set(userId, { count: 1, resetAt: now + windowMs })
      } else if (userLimit.count >= limit) {
        return ctx.badRequest('Превышен лимит запросов в друзья на сегодня')
      } else {
        userLimit.count++
      }
    }

    await next()
  }
}
```

---

### 3. Блокировка пользователей

**Проверка при отправке запроса:**

```typescript
// backend/src/api/friend-request/controllers/friend-request.ts
export default {
  async create(ctx) {
    const { receiver, message } = ctx.request.body.data
    const sender = ctx.state.user.id

    // Check if blocked
    const isBlocked = await strapi.entityService.findMany('api::blocked-user.blocked-user', {
      filters: {
        $or: [
          { blocker: sender, blocked: receiver },
          { blocker: receiver, blocked: sender },
        ],
      },
    })

    if (isBlocked.length > 0) {
      return ctx.forbidden('Невозможно отправить запрос этому пользователю')
    }

    // Check privacy settings
    const receiverUser = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      receiver,
      { populate: ['friends'] }
    )

    if (receiverUser.friendPrivacy === 'nobody') {
      return ctx.forbidden('Пользователь не принимает запросы в друзья')
    }

    if (receiverUser.friendPrivacy === 'friends_of_friends') {
      // Check if sender is friend of friend
      const mutualFriends = await checkMutualFriends(sender, receiver)
      if (mutualFriends.length === 0) {
        return ctx.forbidden('Вы можете отправлять запросы только друзьям друзей')
      }
    }

    // Create request
    const request = await strapi.entityService.create('api::friend-request.friend-request', {
      data: { sender, receiver, message, status: 'pending' },
      populate: ['sender', 'receiver'],
    })

    return request
  },
}
```

---

## ✅ Чеклист миграции

### Backend (Strapi)

- [ ] Создать Content Type `FriendRequest`
- [ ] Создать Content Type `Friendship`
- [ ] Создать Content Type `FriendActivity`
- [ ] Создать Content Type `BlockedUser`
- [ ] Добавить поля в User (totalFriends, isOnline, lastSeen, privacy settings)
- [ ] Настроить relations между Content Types
- [ ] Создать hooks для FriendRequest (beforeCreate, afterCreate, afterUpdate)
- [ ] Создать hooks для Friendship (afterCreate, afterDelete)
- [ ] Создать custom controllers для всех эндпоинтов
- [ ] Реализовать алгоритм рекомендаций друзей
- [ ] Настроить WebSocket сервер для real-time обновлений
- [ ] Создать middleware для rate limiting
- [ ] Реализовать проверку privacy settings
- [ ] Настроить cron job для очистки старых запросов и активности
- [ ] Настроить email/push уведомления

### Frontend (React)

- [ ] Создать `src/api/friends.ts` с API клиентом
- [ ] Обновить `FriendsPage.tsx` для использования useQuery/useMutation
- [ ] Создать Skeleton компоненты для loading states
- [ ] Добавить error handling и toast notifications
- [ ] Интегрировать WebSocket для real-time обновлений
- [ ] Добавить страницу настроек приватности
- [ ] Создать компонент блокировки пользователей
- [ ] Добавить оптимистичные обновления для мутаций
- [ ] Реализовать бесконечный скролл для списков
- [ ] Добавить фильтрацию и сортировку друзей
- [ ] Создать компонент отправки запроса с сообщением
- [ ] Добавить индикаторы онлайн статуса везде, где показываются пользователи
- [ ] Оптимизировать для мобильных устройств

### Testing

- [ ] Написать unit тесты для API functions
- [ ] Написать integration тесты для friend request flow
- [ ] Протестировать WebSocket соединения
- [ ] Протестировать privacy settings
- [ ] Протестировать rate limiting
- [ ] Протестировать блокировку пользователей
- [ ] Провести E2E тестирование всего flow

### Deployment

- [ ] Настроить environment variables для WebSocket URL
- [ ] Настроить CORS для WebSocket
- [ ] Настроить scaling для WebSocket connections
- [ ] Создать backup strategy для friendship data
- [ ] Настроить monitoring для WebSocket connections
- [ ] Оптимизировать database queries (indexes на sender, receiver, user, friend)
- [ ] Настроить caching для friend lists и suggestions

### Cleanup

- [ ] Удалить `frontend-react/src/data/friendsMockData.ts`
- [ ] Удалить все импорты mock data из компонентов
- [ ] Удалить этот файл (`FRIENDS_INTEGRATION_GUIDE.md`) после завершения миграции

---

## 📚 Дополнительные функции (опционально)

### 1. Группы друзей

Создать Content Type `FriendGroup` для организации друзей в группы:

```typescript
{
  name: string
  description: text
  user: relation (User, many-to-one)
  friends: relation (Friendship, many-to-many)
  color: string // Hex color for visual distinction
  icon: string // Icon name
}
```

### 2. Совместная активность

Отслеживать совместные действия друзей:
- Совместные курсы
- Общие интересы
- Совместные проекты

### 3. Рейтинг друзей

Автоматический рейтинг друзей на основе:
- Частоты взаимодействия
- Общих интересов
- Взаимных лайков/комментариев

### 4. Импорт друзей

Импорт друзей из социальных сетей:
- GitHub
- Twitter
- LinkedIn

---

**Последнее обновление:** 2025-02-20

**Автор:** AI Assistant (Claude Sonnet 4.5)

**Версия:** 1.0.0

