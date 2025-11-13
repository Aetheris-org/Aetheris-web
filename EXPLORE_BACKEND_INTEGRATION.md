# Explore Backend Integration Guide

## 📋 Overview

This guide provides comprehensive instructions for integrating the Explore page with a real backend (Strapi or custom API). The Explore page includes:

1. **Duels & Clan Wars** - Real-time competitive battles
2. **Leaderboards** - Rankings for users and clans
3. **Events** - Community tournaments and challenges

---

## 🗄️ Database Schema (Strapi Content Types)

### 1. User Stats Extension

Extend the existing `users-permissions` user model:

```javascript
// backend/strapi-backend/src/extensions/users-permissions/content-types/user/schema.json
{
  "attributes": {
    // ... existing fields
    "level": {
      "type": "integer",
      "default": 1,
      "min": 1
    },
    "rating": {
      "type": "integer",
      "default": 1000,
      "min": 0
    },
    "totalPoints": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "clan": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clan.clan",
      "inversedBy": "members"
    },
    "clanRole": {
      "type": "enumeration",
      "enum": ["leader", "officer", "member"],
      "default": "member"
    },
    "achievements": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::achievement.achievement",
      "mappedBy": "users"
    }
  }
}
```

### 2. Clan

```javascript
// Content Type: clan
{
  "kind": "collectionType",
  "collectionName": "clans",
  "info": {
    "singularName": "clan",
    "pluralName": "clans",
    "displayName": "Clan"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "tag": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 6
    },
    "logo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "banner": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "description": {
      "type": "text",
      "required": true
    },
    "motto": {
      "type": "string"
    },
    "level": {
      "type": "integer",
      "default": 1,
      "min": 1
    },
    "rating": {
      "type": "integer",
      "default": 1000
    },
    "totalPoints": {
      "type": "integer",
      "default": 0
    },
    "wins": {
      "type": "integer",
      "default": 0
    },
    "losses": {
      "type": "integer",
      "default": 0
    },
    "draws": {
      "type": "integer",
      "default": 0
    },
    "maxMembers": {
      "type": "integer",
      "default": 50,
      "min": 10,
      "max": 100
    },
    "minLevel": {
      "type": "integer",
      "default": 1
    },
    "minRating": {
      "type": "integer",
      "default": 0
    },
    "applicationRequired": {
      "type": "boolean",
      "default": false
    },
    "specialization": {
      "type": "json"
    },
    "members": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "plugin::users-permissions.user",
      "mappedBy": "clan"
    },
    "leader": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user"
    }
  }
}
```

### 3. Duel Challenge

```javascript
// Content Type: duel-challenge
{
  "kind": "collectionType",
  "collectionName": "duel_challenges",
  "info": {
    "singularName": "duel-challenge",
    "pluralName": "duel-challenges",
    "displayName": "Duel Challenge"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "type": {
      "type": "enumeration",
      "enum": ["1v1", "team", "clan-war"],
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "active", "completed", "cancelled"],
      "default": "pending"
    },
    "challenger": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "opponent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "challengerTeam": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "plugin::users-permissions.user"
    },
    "opponentTeam": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "plugin::users-permissions.user"
    },
    "category": {
      "type": "string",
      "required": true
    },
    "difficulty": {
      "type": "enumeration",
      "enum": ["easy", "medium", "hard", "expert"],
      "required": true
    },
    "timeLimit": {
      "type": "integer",
      "min": 5,
      "max": 180
    },
    "pointsAtStake": {
      "type": "integer",
      "required": true,
      "min": 10
    },
    "challengerScore": {
      "type": "integer",
      "default": 0
    },
    "opponentScore": {
      "type": "integer",
      "default": 0
    },
    "winner": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user"
    },
    "startedAt": {
      "type": "datetime"
    },
    "completedAt": {
      "type": "datetime"
    },
    "expiresAt": {
      "type": "datetime"
    }
  }
}
```

### 4. Clan War

```javascript
// Content Type: clan-war
{
  "kind": "collectionType",
  "collectionName": "clan_wars",
  "info": {
    "singularName": "clan-war",
    "pluralName": "clan-wars",
    "displayName": "Clan War"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "status": {
      "type": "enumeration",
      "enum": ["pending", "active", "completed", "cancelled"],
      "default": "pending"
    },
    "clan1": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clan.clan"
    },
    "clan2": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clan.clan"
    },
    "clan1Score": {
      "type": "integer",
      "default": 0
    },
    "clan2Score": {
      "type": "integer",
      "default": 0
    },
    "format": {
      "type": "enumeration",
      "enum": ["best-of-3", "best-of-5", "tournament", "points-race"],
      "required": true
    },
    "category": {
      "type": "string",
      "required": true
    },
    "duration": {
      "type": "integer",
      "required": true
    },
    "rounds": {
      "type": "json"
    },
    "totalPointsAtStake": {
      "type": "integer",
      "required": true
    },
    "winner": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "api::clan.clan"
    },
    "startedAt": {
      "type": "datetime"
    },
    "completedAt": {
      "type": "datetime"
    }
  }
}
```

### 5. Event

```javascript
// Content Type: event
{
  "kind": "collectionType",
  "collectionName": "events",
  "info": {
    "singularName": "event",
    "pluralName": "events",
    "displayName": "Event"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "type": {
      "type": "enumeration",
      "enum": ["tournament", "challenge", "hackathon", "contest", "community"],
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["upcoming", "active", "completed"],
      "default": "upcoming"
    },
    "title": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text",
      "required": true
    },
    "shortDescription": {
      "type": "string",
      "required": true
    },
    "banner": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "thumbnail": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "organizer": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "organizerType": {
      "type": "enumeration",
      "enum": ["admin", "community", "sponsor"],
      "default": "community"
    },
    "startDate": {
      "type": "datetime",
      "required": true
    },
    "endDate": {
      "type": "datetime",
      "required": true
    },
    "registrationDeadline": {
      "type": "datetime"
    },
    "maxParticipants": {
      "type": "integer"
    },
    "minParticipants": {
      "type": "integer"
    },
    "prizes": {
      "type": "json"
    },
    "requirements": {
      "type": "json"
    },
    "category": {
      "type": "string",
      "required": true
    },
    "tags": {
      "type": "json"
    },
    "customData": {
      "type": "json"
    },
    "participants": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "plugin::users-permissions.user"
    },
    "viewsCount": {
      "type": "integer",
      "default": 0
    }
  }
}
```

### 6. Achievement

```javascript
// Content Type: achievement
{
  "kind": "collectionType",
  "collectionName": "achievements",
  "info": {
    "singularName": "achievement",
    "pluralName": "achievements",
    "displayName": "Achievement"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "description": {
      "type": "text",
      "required": true
    },
    "icon": {
      "type": "string",
      "required": true
    },
    "rarity": {
      "type": "enumeration",
      "enum": ["common", "rare", "epic", "legendary", "mythic"],
      "required": true
    },
    "requirement": {
      "type": "json",
      "required": true
    },
    "reward": {
      "type": "json",
      "required": true
    },
    "users": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "plugin::users-permissions.user",
      "inversedBy": "achievements"
    }
  }
}
```

---

## 🔌 API Endpoints

### Duels

```typescript
// GET /api/explore/duels
// Get all duels with filters
interface DuelsQuery {
  status?: 'pending' | 'active' | 'completed'
  type?: '1v1' | 'team' | 'clan-war'
  category?: string
  difficulty?: string
  limit?: number
  start?: number
}

// POST /api/explore/duels
// Create a new duel challenge
interface CreateDuelBody {
  type: '1v1' | 'team' | 'clan-war'
  opponentId?: number // Optional, can be null for open challenge
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  timeLimit: number
  pointsAtStake: number
}

// POST /api/explore/duels/:id/accept
// Accept a duel challenge
// Requires authentication

// POST /api/explore/duels/:id/decline
// Decline a duel challenge
// Requires authentication

// POST /api/explore/duels/:id/complete
// Complete a duel and update scores
// Requires authentication (only participants)
interface CompleteDuelBody {
  challengerScore: number
  opponentScore: number
}

// POST /api/explore/duels/:id/cancel
// Cancel a duel
// Requires authentication (only challenger)
```

### Clan Wars

```typescript
// GET /api/explore/clan-wars
// Get all clan wars

// POST /api/explore/clan-wars
// Declare war on another clan
// Requires authentication (clan leader/officer)
interface CreateClanWarBody {
  targetClanId: number
  format: 'best-of-3' | 'best-of-5' | 'tournament' | 'points-race'
  category: string
  duration: number
}

// POST /api/explore/clan-wars/:id/accept
// Accept clan war
// Requires authentication (target clan leader/officer)

// POST /api/explore/clan-wars/:id/update-round
// Update round score
// Requires authentication (system or admin)
interface UpdateRoundBody {
  roundNumber: number
  clan1Score: number
  clan2Score: number
}
```

### Clans

```typescript
// GET /api/explore/clans
// Get all clans with filters
interface ClansQuery {
  search?: string
  minLevel?: number
  maxLevel?: number
  specialization?: string[]
  acceptingMembers?: boolean
  limit?: number
  start?: number
}

// POST /api/explore/clans
// Create a new clan
// Requires authentication
interface CreateClanBody {
  name: string
  tag: string // Max 6 characters
  description: string
  motto?: string
  specialization?: string[]
  minLevel?: number
  minRating?: number
  applicationRequired?: boolean
}

// POST /api/explore/clans/:id/join
// Join a clan
// Requires authentication

// POST /api/explore/clans/:id/leave
// Leave a clan
// Requires authentication

// PUT /api/explore/clans/:id
// Update clan settings
// Requires authentication (leader only)

// POST /api/explore/clans/:id/kick/:userId
// Kick a member
// Requires authentication (leader/officer)
```

### Leaderboards

```typescript
// GET /api/explore/leaderboards/:type/:period
// Get leaderboard
// type: 'users' | 'clans' | 'duels' | 'clan-wars'
// period: 'all-time' | 'monthly' | 'weekly' | 'daily'
interface LeaderboardQuery {
  limit?: number
  offset?: number
}

// Response should be cached for 5-10 minutes
```

### Events

```typescript
// GET /api/explore/events
// Get all events
interface EventsQuery {
  status?: 'upcoming' | 'active' | 'completed'
  type?: string
  category?: string
  search?: string
  limit?: number
  start?: number
}

// GET /api/explore/events/:id
// Get event details

// POST /api/explore/events/:id/register
// Register for an event
// Requires authentication

// POST /api/explore/events/:id/unregister
// Unregister from an event
// Requires authentication

// POST /api/explore/events/:id/view
// Increment view count
```

### User Stats

```typescript
// GET /api/explore/stats/:userId
// Get user stats and achievements

// Response includes:
// - Level, rating, rank
// - Duel statistics
// - Clan information
// - Event participation
// - Achievements
```

---

## 🔒 Permissions & Security

### Public Endpoints
- `GET /api/explore/duels` (read-only)
- `GET /api/explore/clan-wars` (read-only)
- `GET /api/explore/clans` (read-only)
- `GET /api/explore/leaderboards/:type/:period`
- `GET /api/explore/events`
- `GET /api/explore/events/:id`
- `GET /api/explore/stats/:userId`

### Authenticated Endpoints
- All `POST`, `PUT`, `DELETE` operations
- Clan management (leader/officer only)
- Duel acceptance/completion
- Event registration

### Server-Side Validation

**CRITICAL**: All score updates and rating changes MUST be validated server-side:

```javascript
// Example: Duel completion validation
async completeDuel(ctx) {
  const { id } = ctx.params;
  const user = ctx.state.user;
  const duel = await strapi.entityService.findOne('api::duel-challenge.duel-challenge', id, {
    populate: ['challenger', 'opponent']
  });

  // 1. Verify user is a participant
  if (duel.challenger.id !== user.id && duel.opponent.id !== user.id) {
    return ctx.forbidden('You are not a participant in this duel');
  }

  // 2. Verify duel is active
  if (duel.status !== 'active') {
    return ctx.badRequest('Duel is not active');
  }

  // 3. Validate scores (server-side logic, not client input)
  // Scores should be calculated based on actual game results, not client-submitted values
  const { challengerScore, opponentScore } = await calculateDuelScores(duel);

  // 4. Update duel
  const winner = challengerScore > opponentScore ? duel.challenger : duel.opponent;
  await strapi.entityService.update('api::duel-challenge.duel-challenge', id, {
    data: {
      status: 'completed',
      challengerScore,
      opponentScore,
      winner: winner.id,
      completedAt: new Date()
    }
  });

  // 5. Update user ratings (with transaction)
  await updateUserRatings(duel.challenger, duel.opponent, winner, duel.pointsAtStake);

  // 6. Check and award achievements
  await checkAchievements(user.id);

  return { success: true };
}
```

---

## 🔴 Real-Time Updates (WebSocket)

Use Socket.io or Strapi's built-in WebSocket support for real-time features:

### Events to Broadcast

1. **Duel Updates**
   - `duel:created` - New duel challenge
   - `duel:accepted` - Challenge accepted
   - `duel:score-update` - Score changed
   - `duel:completed` - Duel finished

2. **Clan War Updates**
   - `clan-war:started` - War begins
   - `clan-war:round-completed` - Round finished
   - `clan-war:completed` - War finished

3. **Leaderboard Updates**
   - `leaderboard:updated` - Rankings changed (broadcast every 5-10 min)

4. **Notifications**
   - `notification:duel-challenge` - You've been challenged
   - `notification:clan-war` - Your clan is at war
   - `notification:achievement` - Achievement unlocked

### Implementation Example

```javascript
// backend/strapi-backend/src/index.js
module.exports = {
  register({ strapi }) {
    // Socket.io setup
  },
  
  bootstrap({ strapi }) {
    const io = require('socket.io')(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    // Authenticate socket connections
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user-specific room
      socket.join(`user:${socket.userId}`);
      
      // Join clan room if user has clan
      // ... implementation
    });

    // Store io instance for use in controllers
    strapi.io = io;
  }
};

// In controller:
strapi.io.to(`user:${opponentId}`).emit('duel:challenge', duelData);
```

---

## 💾 Caching Strategy

### Redis Caching

Use Redis for frequently accessed data:

```javascript
// Leaderboards (update every 5-10 minutes)
const CACHE_TTL = {
  LEADERBOARD: 600, // 10 minutes
  CLAN_STATS: 900, // 15 minutes
  ACTIVE_DUELS: 30, // 30 seconds
  EVENTS: 1800, // 30 minutes
};

// Example implementation
async getLeaderboard(type, period) {
  const cacheKey = `leaderboard:${type}:${period}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const data = await fetchLeaderboardFromDB(type, period);
  
  // Cache result
  await redis.setex(cacheKey, CACHE_TTL.LEADERBOARD, JSON.stringify(data));
  
  return data;
}
```

---

## 📊 Analytics & Monitoring

Track important metrics:

1. **Duel Metrics**
   - Total duels per day/week/month
   - Average duel duration
   - Most popular categories
   - Win rates by difficulty

2. **Clan Metrics**
   - Active clans
   - Average clan size
   - Clan war frequency
   - Member retention

3. **Event Metrics**
   - Registration rates
   - Completion rates
   - Most popular event types

4. **User Engagement**
   - Daily active users
   - Average session duration
   - Feature usage (duels vs events vs leaderboards)

---

## 🧪 Testing

### Unit Tests

Test all critical functions:
- Rating calculations
- Achievement checks
- Score validation
- Permission checks

### Integration Tests

Test API endpoints:
- Create duel
- Accept challenge
- Complete duel
- Update ratings
- Award achievements

### Load Tests

Simulate high traffic:
- 1000+ concurrent duels
- Real-time score updates
- Leaderboard queries

---

## 🚀 Deployment Checklist

- [ ] All Content Types created in Strapi
- [ ] Custom controllers implemented
- [ ] Permissions configured correctly
- [ ] WebSocket server running
- [ ] Redis cache configured
- [ ] Rate limiting enabled
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Anti-cheat measures implemented
- [ ] Load testing completed

---

## 📝 Migration from Mock Data

1. **Remove mock data imports** from `ExplorePage.tsx`
2. **Create API service** in `frontend-react/src/api/explore.ts`
3. **Implement React Query hooks** for data fetching
4. **Add loading states** and error handling
5. **Connect WebSocket** for real-time updates
6. **Test thoroughly** with real data

Example API service:

```typescript
// frontend-react/src/api/explore.ts
import { apiClient } from './axios'
import type { DuelChallenge, ClanWar, Event, LeaderboardEntry } from '@/types/explore'

export async function getDuels(filters?: {
  status?: string
  type?: string
  limit?: number
}): Promise<DuelChallenge[]> {
  const res = await apiClient.get('/api/explore/duels', { params: filters })
  return res.data.data.map(transformDuel)
}

export async function createDuel(data: CreateDuelBody): Promise<DuelChallenge> {
  const res = await apiClient.post('/api/explore/duels', data, {
    headers: { 'X-Require-Auth': 'true' }
  })
  return transformDuel(res.data.data)
}

// ... more functions
```

---

## 🆘 Support

For questions or issues during integration, refer to:
- Strapi documentation: https://docs.strapi.io
- Socket.io documentation: https://socket.io/docs
- This codebase's existing API patterns in `frontend-react/src/api/`

---

**Good luck with the integration! 🚀**

