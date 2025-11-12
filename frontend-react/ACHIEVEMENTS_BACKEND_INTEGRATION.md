# Achievements Page - Backend Integration Guide

This document provides step-by-step instructions for replacing mock data in the Achievements page with real data from the Strapi backend.

## Current State

The Achievements page (`src/pages/AchievementsPage.tsx`) currently uses:
- Mock achievement definitions stored in the component
- Achievement unlock status from `gamificationStore` (Zustand, persisted locally)
- Client-side evaluation of achievement conditions

## Integration Steps

### 1. Create Strapi Content Types

#### Achievement Content Type

Create a new content type `achievement` in Strapi Admin with the following fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UID | Yes | Unique identifier (auto-generated) |
| `title` | Text | Yes | Achievement title (e.g., "Momentum Rising") |
| `description` | Text | Yes | Achievement description |
| `category` | Enumeration | Yes | Options: `level`, `streak`, `activity`, `milestone`, `social` |
| `rarity` | Enumeration | Yes | Options: `common`, `rare`, `epic`, `legendary` |
| `icon` | Media | No | Custom icon image (optional) |
| `xpReward` | Number | No | XP points awarded when unlocked |
| `requirement` | JSON | No | Condition logic (e.g., `{ "type": "level", "value": 5 }`) |
| `isActive` | Boolean | Yes | Whether achievement is currently available (default: true) |
| `sortOrder` | Number | No | Display order in catalog |

**Permissions**: Set public read access for authenticated users.

#### User Achievement Content Type (Join Table)

Create a new content type `user-achievement` to track which achievements each user has unlocked:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `user` | Relation (User) | Yes | Reference to the user |
| `achievement` | Relation (Achievement) | Yes | Reference to the achievement |
| `unlockedAt` | DateTime | Yes | When the achievement was unlocked |
| `progress` | Number | No | Progress percentage (0-100) for progress-based achievements |

**Permissions**: 
- Authenticated users can read their own achievements
- System/admin can create/update user achievements

### 2. Create Backend API Endpoints

#### Achievement Controller

Create `backend/strapi-backend/src/api/achievement/controllers/achievement.ts`:

```typescript
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::achievement.achievement', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx)
    
    // Filter out inactive achievements unless admin
    const isAdmin = ctx.state.user?.role?.type === 'admin'
    const filtered = data.filter((achievement: any) => 
      isAdmin || achievement.attributes.isActive !== false
    )
    
    return { data: filtered, meta }
  },
}))
```

#### User Achievement Controller

Create `backend/strapi-backend/src/api/user-achievement/controllers/user-achievement.ts`:

```typescript
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::user-achievement.user-achievement', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user
    if (!user) {
      return ctx.unauthorized('You must be authenticated')
    }

    // Only return achievements for the current user
    ctx.query.filters = {
      ...ctx.query.filters,
      user: { id: { $eq: user.id } },
    }

    const { data, meta } = await super.find(ctx, {
      populate: ['achievement'],
    })

    return { data, meta }
  },

  async create(ctx) {
    const user = ctx.state.user
    if (!user) {
      return ctx.unauthorized('You must be authenticated')
    }

    // Ensure user can only create achievements for themselves
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
      unlockedAt: new Date().toISOString(),
    }

    const { data, meta } = await super.create(ctx, {
      populate: ['achievement'],
    })

    return { data, meta }
  },
}))
```

#### Achievement Evaluation Service

Create `backend/strapi-backend/src/api/achievement/services/achievement.ts`:

```typescript
import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::achievement.achievement', ({ strapi }) => ({
  async evaluateUserAchievements(userId: number) {
    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      populate: ['user_achievements.achievement'],
    })

    const allAchievements = await strapi.entityService.findMany('api::achievement.achievement', {
      filters: { isActive: true },
    })

    const unlockedAchievementIds = new Set(
      user.user_achievements?.map((ua: any) => ua.achievement.id) || []
    )

    const newlyUnlocked = []

    for (const achievement of allAchievements) {
      if (unlockedAchievementIds.has(achievement.id)) continue

      const shouldUnlock = await this.checkRequirement(achievement, user)
      if (shouldUnlock) {
        await strapi.entityService.create('api::user-achievement.user-achievement', {
          data: {
            user: userId,
            achievement: achievement.id,
            unlockedAt: new Date().toISOString(),
          },
        })
        newlyUnlocked.push(achievement)
      }
    }

    return newlyUnlocked
  },

  async checkRequirement(achievement: any, user: any): Promise<boolean> {
    const requirement = achievement.requirement
    if (!requirement) return false

    switch (requirement.type) {
      case 'level':
        return user.level >= requirement.value
      case 'streak':
        return user.streakDays >= requirement.value
      case 'publish_count':
        // Query articles count
        const articleCount = await strapi.entityService.count('api::article.article', {
          filters: { author: user.id, publishedAt: { $notNull: true } },
        })
        return articleCount >= requirement.value
      case 'reaction_count':
        // Query total reactions on user's articles
        // Implementation depends on your reaction system
        return false
      default:
        return false
    }
  },
}))
```

### 3. Update Frontend API Layer

Create `frontend-react/src/api/achievements.ts`:

```typescript
import { api } from './axios'

export interface Achievement {
  id: number
  attributes: {
    title: string
    description: string
    category: 'level' | 'streak' | 'activity' | 'milestone' | 'social'
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    xpReward?: number
    requirement?: Record<string, unknown>
    isActive: boolean
    icon?: {
      data?: {
        attributes: {
          url: string
        }
      }
    }
  }
}

export interface UserAchievement {
  id: number
  attributes: {
    unlockedAt: string
    progress?: number
    achievement: {
      data: Achievement
    }
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await api.get('/api/achievements?populate=*&sort=sortOrder:asc')
  return data.data
}

export async function getUserAchievements(): Promise<UserAchievement[]> {
  const { data } = await api.get('/api/user-achievements?populate[achievement][populate]=*')
  return data.data
}

export async function unlockAchievement(achievementId: number): Promise<UserAchievement> {
  const { data } = await api.post('/api/user-achievements', {
    data: {
      achievement: achievementId,
    },
  })
  return data.data
}
```

### 4. Update AchievementsPage Component

Replace the mock data section in `src/pages/AchievementsPage.tsx`:

**Remove:**
- The `mockAchievements` array
- The comment block with integration guide (or move it to this file)

**Add React Query hooks:**

```typescript
import { useQuery } from '@tanstack/react-query'
import { getAchievements, getUserAchievements } from '@/api/achievements'

// Inside component:
const { data: achievementsData = [], isLoading: achievementsLoading } = useQuery({
  queryKey: ['achievements'],
  queryFn: getAchievements,
})

const { data: userAchievementsData = [], isLoading: userAchievementsLoading } = useQuery({
  queryKey: ['user-achievements'],
  queryFn: getUserAchievements,
  enabled: !!user,
})

// Transform Strapi data to component format
const allAchievements = useMemo(() => {
  if (!achievementsData.length) return []
  
  return achievementsData.map((achievement) => {
    const userAchievement = userAchievementsData.find(
      (ua) => ua.attributes.achievement.data.id === achievement.id
    )
    
    return {
      id: achievement.id.toString(),
      title: achievement.attributes.title,
      description: achievement.attributes.description,
      category: achievement.attributes.category,
      rarity: achievement.attributes.rarity,
      xpReward: achievement.attributes.xpReward,
      unlocked: !!userAchievement,
      unlockedAt: userAchievement?.attributes.unlockedAt,
      iconUrl: achievement.attributes.icon?.data?.attributes?.url,
    }
  })
}, [achievementsData, userAchievementsData])
```

**Add loading states:**

```typescript
if (achievementsLoading || userAchievementsLoading) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container space-y-8 pb-16 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/60 animate-pulse">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-muted" />
                <div className="h-4 w-3/4 bg-muted" />
                <div className="h-3 w-full bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
```

### 5. Auto-Unlock Achievements

Set up webhooks or lifecycle hooks in Strapi to automatically evaluate and unlock achievements when:
- User levels up
- User publishes an article
- User receives reactions/comments
- Daily streak updates
- Any other relevant activity

**Example lifecycle hook** in `backend/strapi-backend/src/api/article/content-types/article/lifecycles.ts`:

```typescript
export default {
  async afterCreate(event) {
    const { result } = event
    if (result.publishedAt && result.author) {
      // Trigger achievement evaluation
      const achievementService = strapi.service('api::achievement.achievement')
      await achievementService.evaluateUserAchievements(result.author.id)
    }
  },
}
```

### 6. Real-time Updates (Optional)

For real-time achievement unlocks, consider:

1. **WebSockets**: Use Strapi's real-time features or Socket.io
2. **Polling**: Poll user achievements every 30 seconds when on the achievements page
3. **Server-Sent Events**: Stream achievement updates to the client

### 7. Migration from Mock Data

1. Export existing mock achievements to JSON
2. Import them into Strapi using the admin panel or a migration script
3. For existing users, run a one-time script to evaluate and unlock achievements based on their current stats
4. Remove mock data from the frontend
5. Test thoroughly with real data

### 8. Testing Checklist

- [ ] All achievements load from Strapi
- [ ] User achievements are correctly filtered by user
- [ ] Achievement unlock conditions work correctly
- [ ] New achievements appear in the catalog
- [ ] Inactive achievements are hidden from non-admins
- [ ] Loading states display correctly
- [ ] Error states handle API failures gracefully
- [ ] Achievement icons display when provided
- [ ] Progress tracking works for progress-based achievements

## Notes

- Keep the gamificationStore for client-side XP and level calculations
- Achievement unlock status should come from the backend
- Consider caching achievement data on the frontend to reduce API calls
- Add pagination if the achievement catalog grows large (>50 achievements)

## Questions?

If you encounter issues during integration, check:
1. Strapi API permissions are correctly configured
2. User authentication is working
3. Content types are properly populated
4. API responses match the expected format

